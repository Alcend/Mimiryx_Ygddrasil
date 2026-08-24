import { describe, it, expect } from 'vitest';
import {
  extractTokenUsage,
  checkRateLimit,
  loadBudget,
  saveBudget
} from '../../server/proxy.js';

describe('Server Proxy Logic & Defensive Parsing', () => {
  it('should defensively extract tokens from Gemini usageMetadata', () => {
    const geminiPayload = {
      usageMetadata: {
        promptTokenCount: 120,
        candidatesTokenCount: 350,
        totalTokenCount: 470
      }
    };
    const usage = extractTokenUsage(geminiPayload);
    expect(usage.inputTokens).toBe(120);
    expect(usage.outputTokens).toBe(350);
    expect(usage.totalTokens).toBe(470);
  });

  it('should defensively handle legacy or alternative usage property shapes', () => {
    const altPayload = {
      usage: {
        input_tokens: 50,
        output_tokens: 150
      }
    };
    const usage = extractTokenUsage(altPayload);
    expect(usage.inputTokens).toBe(50);
    expect(usage.outputTokens).toBe(150);
    expect(usage.totalTokens).toBe(200);
  });

  it('should return 0 tokens when payload is empty or missing metadata without throwing', () => {
    const emptyPayload = {};
    const usage = extractTokenUsage(emptyPayload);
    expect(usage.inputTokens).toBe(0);
    expect(usage.outputTokens).toBe(0);
    expect(usage.totalTokens).toBe(0);
  });

  it('should enforce IP rate limiting within the sliding window', () => {
    const testIp = '192.168.1.100';
    
    // First 60 requests should be allowed
    for (let i = 0; i < 60; i++) {
      const res = checkRateLimit(testIp);
      expect(res.allowed).toBe(true);
    }
    
    // 61st request should be rejected
    const blocked = checkRateLimit(testIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('should persist and load budget state across reloads', () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const mockBudget = { month: currentMonth, consumed: 5000, lastUpdated: new Date().toISOString() };
    
    saveBudget(mockBudget);
    const loaded = loadBudget();
    
    expect(loaded.month).toBe(currentMonth);
    expect(loaded.consumed).toBeGreaterThanOrEqual(5000);
  });
});
