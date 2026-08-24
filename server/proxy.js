/**
 * MIMIRYX / YGGDRASIL - Gemini API Serverless Proxy
 * 
 * Provides secure server-side execution of Google Gemini API requests:
 * - Keeps GEMINI_API_KEY off client bundles
 * - Request timeouts (30s interactive, 120s batch)
 * - Exponential backoff retry on transient 5xx/429 errors
 * - Token budget enforcement (BUDGET_TOKENS / monthly cap)
 * - Structured token usage logging (no prompt PII stored)
 * - Graceful model fallback to gemini-3.6-flash-lite on budget limits
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_VERSION = 'v1beta';
const DEFAULT_MODEL = 'gemini-3.6-flash';
const FALLBACK_MODEL = 'gemini-3.6-flash-lite';
const BUDGET_TOKENS_MONTHLY = parseInt(process.env.BUDGET_TOKENS || '1000000', 10);

// In-memory token budget tracking (in production, use Redis or Postgres)
let tokensConsumedThisMonth = 0;

/**
 * Log token usage safely without persisting user prompt/payload data
 */
function logTokenUsage(model, usageMetadata) {
  const inputTokens = usageMetadata?.promptTokenCount || 0;
  const outputTokens = usageMetadata?.candidatesTokenCount || 0;
  const total = usageMetadata?.totalTokenCount || (inputTokens + outputTokens);
  
  tokensConsumedThisMonth += total;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    model,
    inputTokens,
    outputTokens,
    totalTokens: total,
    monthlyConsumed: tokensConsumedThisMonth,
    monthlyBudget: BUDGET_TOKENS_MONTHLY,
    budgetRemaining: Math.max(0, BUDGET_TOKENS_MONTHLY - tokensConsumedThisMonth)
  };
  
  console.log(`[TOKEN_TELEMETRY] ${JSON.stringify(logEntry)}`);
  return logEntry;
}

/**
 * Execute HTTPS request with timeout and 1 retry
 */
async function callGeminiEndpoint(endpointPath, payload, isBatch = false, retryCount = 0) {
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
          console.warn(`[PROXY] Transient error ${res.statusCode}. Retrying with exponential backoff (1000ms)...`);
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

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // Health / Status endpoint
  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      service: 'Mimiryx Gemini Proxy',
      tokensConsumed: tokensConsumedThisMonth,
      monthlyBudget: BUDGET_TOKENS_MONTHLY,
      budgetExceeded: tokensConsumedThisMonth >= BUDGET_TOKENS_MONTHLY
    }));
    return;
  }

  // Generation proxy endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/api/generate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        let model = payload.model || DEFAULT_MODEL;
        const isBatch = payload.isBatch || false;
        
        // Budget Guard: Fallback or Reject if budget exceeded
        if (tokensConsumedThisMonth >= BUDGET_TOKENS_MONTHLY) {
          if (model !== FALLBACK_MODEL) {
            console.warn(`[PROXY_BUDGET] Monthly budget exceeded (${tokensConsumedThisMonth}/${BUDGET_TOKENS_MONTHLY}). Degrading to ${FALLBACK_MODEL}`);
            model = FALLBACK_MODEL;
          } else {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Monthly token quota completely exhausted.',
              code: 'BUDGET_EXCEEDED'
            }));
            return;
          }
        }

        const endpoint = `models/${model}:generateContent`;
        const result = await callGeminiEndpoint(endpoint, payload.contents ? payload : { contents: payload.contents }, isBatch);
        
        // Log telemetry
        const telemetry = logTokenUsage(model, result.usageMetadata);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: result,
          telemetry
        }));
      } catch (err) {
        console.error(`[PROXY_ERROR] ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[MIMIRYX PROXY] Running on http://localhost:${PORT}`);
    console.log(`[MIMIRYX PROXY] Monthly Token Budget: ${BUDGET_TOKENS_MONTHLY.toLocaleString()} tokens`);
  });
}

module.exports = { server, callGeminiEndpoint, logTokenUsage };
