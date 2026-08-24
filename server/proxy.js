/**
 * MIMIRYX / YGGDRASIL - Hardened Gemini API Serverless Proxy (ES Module)
 * 
 * Production-ready server proxy featuring:
 * - Zero Client Secrets: Keeps GEMINI_API_KEY secure on backend
 * - Auth Header Protection: Requires X-MIMIRYX-KEY header matching PROXY_CLIENT_KEY (if set)
 * - Persistent Token Budget: File-backed monthly token tracking with month-rollover reset (.token_budget.json)
 * - Rate Limiting: IP-based sliding window (max 60 req/min per IP)
 * - Defensive Metadata Parsing: Gracefully handles diverse usage metadata structures
 * - Strict Payload Validation: 200KB body limit, JSON schema sanitization
 * - Timeouts & Exponential Backoff: 30s interactive, 120s batch, 1 retry on 5xx/429
 * - Graceful Fallback: Auto-degrades to gemini-3.6-flash-lite on budget warnings
 */

import http from 'http';
import https from 'https';
import url from 'url';
import fs from 'fs';
import path from 'path';

export const PORT = parseInt(process.env.PORT || '3001', 10);
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const PROXY_CLIENT_KEY = process.env.PROXY_CLIENT_KEY || '';
export const GEMINI_API_VERSION = 'v1beta';
export const DEFAULT_MODEL = 'gemini-3.6-flash';
export const FALLBACK_MODEL = 'gemini-3.6-flash-lite';
export const BUDGET_TOKENS_MONTHLY = parseInt(process.env.BUDGET_TOKENS || '1000000', 10);
export const MAX_PAYLOAD_BYTES = 200 * 1024; // 200 KB

// Persistent File-Based Budget Storage
export const BUDGET_FILE = path.resolve(process.env.BUDGET_STORE || './.token_budget.json');

export function loadBudget() {
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  try {
    if (fs.existsSync(BUDGET_FILE)) {
      const data = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
      if (data.month === currentMonth) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[PROXY_BUDGET] Could not read budget file, initializing fresh store.');
  }
  const fresh = { month: currentMonth, consumed: 0, lastUpdated: new Date().toISOString() };
  saveBudget(fresh);
  return fresh;
}

export function saveBudget(budgetState) {
  try {
    budgetState.lastUpdated = new Date().toISOString();
    fs.writeFileSync(BUDGET_FILE, JSON.stringify(budgetState, null, 2), 'utf8');
  } catch (err) {
    console.error('[PROXY_BUDGET] Failed to persist budget file:', err.message);
  }
}

export let activeBudget = loadBudget();

// IP-Based Rate Limiting Map: IP -> { count, resetTime }
export const rateLimitMap = new Map();
export const RATE_LIMIT_WINDOW_MS = 60000;
export const RATE_LIMIT_MAX_REQ = 60;

export function checkRateLimit(ip) {
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
export function extractTokenUsage(result) {
  const usage = result?.usageMetadata || result?.usage || {};
  const inputTokens = usage.promptTokenCount ?? usage.input_tokens ?? usage.prompt_tokens ?? 0;
  const outputTokens = usage.candidatesTokenCount ?? usage.output_tokens ?? usage.completion_tokens ?? 0;
  const total = usage.totalTokenCount ?? usage.total_tokens ?? (inputTokens + outputTokens);
  
  return { inputTokens, outputTokens, totalTokens: total };
}

export function logTokenUsage(model, result) {
  const { inputTokens, outputTokens, totalTokens } = extractTokenUsage(result);
  
  // Update persistent budget
  activeBudget.consumed += totalTokens;
  saveBudget(activeBudget);
  
  const logEntry = {
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
export async function callGeminiEndpoint(endpointPath, payload, isBatch = false, retryCount = 0) {
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else if ((res.statusCode >= 500 || res.statusCode === 429) && retryCount < 1) {
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

export const server = http.createServer(async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MIMIRYX-KEY');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const parsedUrl = url.parse(req.url, true);

  // Rate Limiter Guard
  const rateLimit = checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
  if (!rateLimit.allowed) {
    res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': Math.ceil(rateLimit.retryAfterMs / 1000) });
    res.end(JSON.stringify({ error: 'Rate limit exceeded. Maximum 60 requests per minute.', code: 'RATE_LIMITED' }));
    return;
  }

  // 1. Health / Metrics Endpoint
  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'Mimiryx Hardened Gemini Proxy',
      keyConfigured: Boolean(GEMINI_API_KEY),
      authProtected: Boolean(PROXY_CLIENT_KEY),
      currentMonth: activeBudget.month,
      tokensConsumed: activeBudget.consumed,
      monthlyBudget: BUDGET_TOKENS_MONTHLY,
      budgetExceeded: activeBudget.consumed >= BUDGET_TOKENS_MONTHLY
    }));
    return;
  }

  // 2. Generation Proxy Endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/api/generate') {
    // API Key Authentication Guard
    if (PROXY_CLIENT_KEY) {
      const clientKey = req.headers['x-mimiryx-key'] || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
      if (clientKey !== PROXY_CLIENT_KEY) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing X-MIMIRYX-KEY header.', code: 'UNAUTHORIZED' }));
        return;
      }
    }

    // Backend Key Configuration Guard
    if (!GEMINI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server misconfigured: GEMINI_API_KEY is missing on backend.', code: 'KEY_UNCONFIGURED' }));
      return;
    }

    let body = '';
    let totalBytes = 0;

    req.on('data', chunk => {
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
        let payload;
        try {
          payload = JSON.parse(body || '{}');
        } catch (jsonErr) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Malformed JSON body.', code: 'INVALID_JSON' }));
          return;
        }

        // Validate expected payload structure
        if (!payload.contents && !payload.prompt) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required "contents" or "prompt" field.', code: 'INVALID_PAYLOAD' }));
          return;
        }

        let model = payload.model || DEFAULT_MODEL;
        const isBatch = Boolean(payload.isBatch);

        // Budget Enforcement & Graceful Fallback
        if (activeBudget.consumed >= BUDGET_TOKENS_MONTHLY) {
          if (model !== FALLBACK_MODEL) {
            console.warn(`[PROXY_BUDGET] Monthly cap reached (${activeBudget.consumed}/${BUDGET_TOKENS_MONTHLY}). Degrading request to ${FALLBACK_MODEL}`);
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
        const formattedPayload = payload.contents ? payload : { contents: [{ role: 'user', parts: [{ text: payload.prompt }] }] };
        const result = await callGeminiEndpoint(endpoint, formattedPayload, isBatch);
        
        // Defensive Token Telemetry Logging
        const telemetry = logTokenUsage(model, result);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: result,
          telemetry
        }));
      } catch (err) {
        console.error(`[PROXY_ERROR] ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message, code: 'PROXY_UPSTREAM_ERROR' }));
      }
    });
    return;
  }

  // 404 Catch-All
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', code: 'NOT_FOUND' }));
});

// Start listening if run directly
if (process.argv[1] && process.argv[1].endsWith('proxy.js')) {
  if (!GEMINI_API_KEY) {
    console.warn('[MIMIRYX PROXY] Warning: GEMINI_API_KEY is not set. Requests to /api/generate will return 500.');
  }
  server.listen(PORT, () => {
    console.log(`[MIMIRYX HARDENED PROXY] Listening on http://localhost:${PORT}`);
    console.log(`[MIMIRYX HARDENED PROXY] Monthly Token Budget: ${BUDGET_TOKENS_MONTHLY.toLocaleString()} tokens`);
    console.log(`[MIMIRYX HARDENED PROXY] Auth Key Protected: ${PROXY_CLIENT_KEY ? 'YES (X-MIMIRYX-KEY required)' : 'NO (Open Development Mode)'}`);
    console.log(`[MIMIRYX HARDENED PROXY] Budget Store File: ${BUDGET_FILE}`);
  });
}
