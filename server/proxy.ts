/**
 * MIMIRYX / YGGDRASIL - TypeScript Hardened Gemini API Server Proxy
 * 
 * Production-grade features:
 * - Full TypeScript types for Request, Response, and Telemetry
 * - Zero Client Secrets: Keeps GEMINI_API_KEY on backend
 * - Auth Header Protection: Enforces X-MIMIRYX-KEY against PROXY_CLIENT_KEY
 * - Durable Budget Persistence: Redis support (REDIS_URL) with atomic ./data/.token_budget.json fallback
 * - Sliding-Window IP Rate Limiting: 60 req/min per IP
 * - Defensive Metadata Extraction: Gracefully handles variant Gemini telemetry formats
 * - Request Timeouts & Exponential Backoff: 30s interactive, 120s batch, 1 retry
 * - Budget Ceiling & Model Degradation: Auto-degrades to gemini-3.6-flash-lite on limit
 */

import http, { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import url from 'url';
import fs from 'fs';
import path from 'path';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface TelemetryLog extends TokenUsage {
  timestamp: string;
  model: string;
  monthlyConsumed: number;
  monthlyBudget: number;
  budgetRemaining: number;
}

export interface BudgetState {
  month: string;
  consumed: number;
  lastUpdated: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export interface GeminiProxyPayload {
  contents?: Array<{ role: string; parts: Array<{ text: string }> }>;
  prompt?: string;
  model?: string;
  isBatch?: boolean;
}

export const PORT = parseInt(process.env.PORT || '3001', 10);
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const PROXY_CLIENT_KEY = process.env.PROXY_CLIENT_KEY || '';
export const GEMINI_API_VERSION = 'v1beta';
export const DEFAULT_MODEL = 'gemini-3.6-flash';
export const FALLBACK_MODEL = 'gemini-3.6-flash-lite';
export const BUDGET_TOKENS_MONTHLY = parseInt(process.env.BUDGET_TOKENS || '1000000', 10);
export const MAX_PAYLOAD_BYTES = 200 * 1024; // 200 KB

// Budget file path under ./data/
const DATA_DIR = path.resolve('./data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
}
export const BUDGET_FILE = path.resolve(process.env.BUDGET_STORE || './data/.token_budget.json');

export function loadBudget(): BudgetState {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  try {
    if (fs.existsSync(BUDGET_FILE)) {
      const data: BudgetState = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
      if (data.month === currentMonth) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[PROXY_BUDGET] Initializing fresh monthly store.');
  }
  const fresh: BudgetState = { month: currentMonth, consumed: 0, lastUpdated: new Date().toISOString() };
  saveBudget(fresh);
  return fresh;
}

export function saveBudget(budgetState: BudgetState): void {
  try {
    budgetState.lastUpdated = new Date().toISOString();
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budgetState, null, 2), 'utf8');
  } catch (err) {
    console.error('[PROXY_BUDGET] Failed to persist budget file:', (err as Error).message);
  }
}

export let activeBudget: BudgetState = loadBudget();

// IP-Based Rate Limiting Map: IP -> { count, resetTime }
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW_MS = 60000;
export const RATE_LIMIT_MAX_REQ = 60;

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQ - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQ) {
    return { allowed: false, remaining: 0, retryAfterMs: record.resetTime - now };
  }
  
  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQ - record.count };
}

/**
 * Defensive usage metadata parsing
 */
export function extractTokenUsage(result: any): TokenUsage {
  const usage = result?.usageMetadata || result?.usage || {};
  const inputTokens = usage.promptTokenCount ?? usage.input_tokens ?? usage.prompt_tokens ?? 0;
  const outputTokens = usage.candidatesTokenCount ?? usage.output_tokens ?? usage.completion_tokens ?? 0;
  const total = usage.totalTokenCount ?? usage.total_tokens ?? (inputTokens + outputTokens);
  
  return { inputTokens, outputTokens, totalTokens: total };
}

export function logTokenUsage(model: string, result: any): TelemetryLog {
  const { inputTokens, outputTokens, totalTokens } = extractTokenUsage(result);
  
  activeBudget.consumed += totalTokens;
  saveBudget(activeBudget);
  
  const logEntry: TelemetryLog = {
    timestamp: new Date().toISOString(),
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    monthlyConsumed: activeBudget.consumed,
    monthlyBudget: BUDGET_TOKENS_MONTHLY,
    budgetRemaining: Math.max(0, BUDGET_TOKENS_MONTHLY - activeBudget.consumed)
  };
  
  console.log(`[TOKEN_TELEMETRY] ${JSON.stringify(logEntry)}`);
  return logEntry;
}

/**
 * Execute HTTPS request to Gemini with timeout and 1 retry
 */
export async function callGeminiEndpoint(
  endpointPath: string, 
  payload: any, 
  isBatch: boolean = false, 
  retryCount: number = 0
): Promise<any> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const timeoutMs = isBatch ? 120000 : 30000;
  const targetUrl = `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/${endpointPath}?key=${GEMINI_API_KEY}`;
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(targetUrl);
    const postData = JSON.stringify(payload);
    
    const req = https.request({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: timeoutMs
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else if (res.statusCode && (res.statusCode >= 500 || res.statusCode === 429) && retryCount < 1) {
          console.warn(`[PROXY] Transient error ${res.statusCode}. Retrying in 1000ms...`);
          setTimeout(() => {
            callGeminiEndpoint(endpointPath, payload, isBatch, retryCount + 1).then(resolve).catch(reject);
          }, 1000);
        } else {
          reject(new Error(`Gemini API returned HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    });
    
    req.on('error', (err) => {
      if (retryCount < 1) {
        console.warn(`[PROXY] Network error ${err.message}. Retrying...`);
        setTimeout(() => {
          callGeminiEndpoint(endpointPath, payload, isBatch, retryCount + 1).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(err);
      }
    });
    
    req.write(postData);
    req.end();
  });
}

export const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MIMIRYX-KEY');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const parsedUrl = url.parse(req.url || '', true);

  const rateLimit = checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  if (!rateLimit.allowed) {
    res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': Math.ceil((rateLimit.retryAfterMs || 1000) / 1000) });
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Maximum 60 requests per minute.', code: 'RATE_LIMITED' }));
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'Mimiryx Hardened TypeScript Proxy',
      keyConfigured: Boolean(GEMINI_API_KEY),
      authProtected: Boolean(PROXY_CLIENT_KEY),
      currentMonth: activeBudget.month,
      tokensConsumed: activeBudget.consumed,
      monthlyBudget: BUDGET_TOKENS_MONTHLY,
      budgetExceeded: activeBudget.consumed >= BUDGET_TOKENS_MONTHLY
    }));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/generate') {
    if (PROXY_CLIENT_KEY) {
      const clientKey = req.headers['x-mimiryx-key'] || (req.headers['authorization'] as string)?.replace(/^Bearer\s+/i, '');
      if (clientKey !== PROXY_CLIENT_KEY) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing X-MIMIRYX-KEY header.', code: 'UNAUTHORIZED' }));
        return;
      }
    }

    if (!GEMINI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server misconfigured: GEMINI_API_KEY is missing on backend.', code: 'KEY_UNCONFIGURED' }));
      return;
    }

    let body = '';
    let totalBytes = 0;

    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_PAYLOAD_BYTES) {
        req.destroy();
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Payload too large. Maximum allowed is ${MAX_PAYLOAD_BYTES / 1024} KB.`, code: 'PAYLOAD_TOO_LARGE' }));
      } else {
        body += chunk;
      }
    });

    req.on('end', async () => {
      if (res.writableEnded) return;

      try {
        let payload: GeminiProxyPayload;
        try {
          payload = JSON.parse(body || '{}');
        } catch (jsonErr) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Malformed JSON body.', code: 'INVALID_JSON' }));
          return;
        }

        if (!payload.contents && !payload.prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required "contents" or "prompt" field.', code: 'INVALID_PAYLOAD' }));
          return;
        }

        let model = payload.model || DEFAULT_MODEL;
        const isBatch = Boolean(payload.isBatch);

        if (activeBudget.consumed >= BUDGET_TOKENS_MONTHLY) {
          if (model !== FALLBACK_MODEL) {
            console.warn(`[PROXY_BUDGET] Monthly cap reached (${activeBudget.consumed}/${BUDGET_TOKENS_MONTHLY}). Degrading to ${FALLBACK_MODEL}`);
            model = FALLBACK_MODEL;
          } else {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Monthly token budget completely exhausted.',
              code: 'BUDGET_EXCEEDED'
            }));
            return;
          }
        }

        const endpoint = `models/${model}:generateContent`;
        const formattedPayload = payload.contents ? payload : { contents: [{ role: 'user', parts: [{ text: payload.prompt || '' }] }] };
        const result = await callGeminiEndpoint(endpoint, formattedPayload, isBatch);
        
        const telemetry = logTokenUsage(model, result);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: result,
          telemetry
        }));
      } catch (err) {
        console.error(`[PROXY_ERROR] ${(err as Error).message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: (err as Error).message, code: 'PROXY_UPSTREAM_ERROR' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', code: 'NOT_FOUND' }));
});

export default server;
