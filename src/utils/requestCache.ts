export class RequestCache {
  private cache = new Map<string, { result: any; timestamp: number }>();
  private TTL = 5 * 60 * 1000; // 5 minutes

  generateKey(topic: string, operation: string): string {
    return `${operation}:${topic}`;
  }

  set(key: string, result: any): void {
    this.cache.set(key, { result, timestamp: Date.now() });
    console.log(`[Cache] Set ${key}`);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      console.log(`[Cache] Expired ${key}`);
      return null;
    }
    
    console.log(`[Cache] Hit ${key}`);
    return entry.result;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
