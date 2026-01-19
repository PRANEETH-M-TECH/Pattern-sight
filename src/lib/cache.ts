/**
 * Simple in-memory cache with TTL support
 * Used for server-side caching of API responses
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();

  set(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries (call periodically if needed)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instances for different cache types
export const quoteCache = new Cache<any>();
export const historyCache = new Cache<any>();
export const searchCache = new Cache<any>();

// Cache TTLs (in seconds)
// StockData.org free tier: 100 requests/day, so we cache longer
export const CACHE_TTL = {
  QUOTE: 300,       // 5 minutes (was 1 minute)
  HISTORY: 3600,    // 1 hour (was 30 minutes)
  SEARCH: 3600,     // 1 hour
} as const;
