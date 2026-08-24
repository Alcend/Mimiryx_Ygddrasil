// Declaration so TypeScript can import the JS server/proxy.js module in tests
declare module '*/server/proxy.js' {
  export const server: any;
  export function callGeminiEndpoint(endpointPath: string, payload: any, isBatch?: boolean, retryCount?: number): Promise<any>;
  export function logTokenUsage(model: string, result: any): any;
  export function extractTokenUsage(result: any): { inputTokens: number; outputTokens: number; totalTokens: number };
  export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterMs?: number };
  export function loadBudget(): { month: string; consumed: number; lastUpdated: string };
  export function saveBudget(budgetState: any): void;
  export const BUDGET_FILE: string;
  export const PORT: number;
  export const GEMINI_API_KEY: string;
  export const PROXY_CLIENT_KEY: string;
  export const GEMINI_API_VERSION: string;
  export const DEFAULT_MODEL: string;
  export const FALLBACK_MODEL: string;
  export const BUDGET_TOKENS_MONTHLY: number;
  export const MAX_PAYLOAD_BYTES: number;
  export default server;
}

declare module '../../server/proxy.js' {
  export const server: any;
  export function callGeminiEndpoint(endpointPath: string, payload: any, isBatch?: boolean, retryCount?: number): Promise<any>;
  export function logTokenUsage(model: string, result: any): any;
  export function extractTokenUsage(result: any): { inputTokens: number; outputTokens: number; totalTokens: number };
  export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterMs?: number };
  export function loadBudget(): { month: string; consumed: number; lastUpdated: string };
  export function saveBudget(budgetState: any): void;
  export const BUDGET_FILE: string;
  export const PORT: number;
  export const GEMINI_API_KEY: string;
  export const PROXY_CLIENT_KEY: string;
  export const GEMINI_API_VERSION: string;
  export const DEFAULT_MODEL: string;
  export const FALLBACK_MODEL: string;
  export const BUDGET_TOKENS_MONTHLY: number;
  export const MAX_PAYLOAD_BYTES: number;
  export default server;
}
