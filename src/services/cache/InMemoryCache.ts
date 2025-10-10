import { logger } from '../../utils/_core/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export class InMemoryCache {
  private namespace: string;
  private cache = new Map<string, { value: unknown; expires: number }>();

  constructor(namespace: string = 'cliniio') {
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.cache.get(this.getKey(key));
      if (item && item.expires > Date.now()) {
        return item.value as T;
      }
      if (item) {
        this.cache.delete(this.getKey(key));
      }
      return null;
    } catch (error) {
      logger.error('In-memory cache get error:', error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const ttl = options.ttl || 300; // Default 5 minutes
      const expires = Date.now() + ttl * 1000;
      this.cache.set(this.getKey(key), { value, expires });
    } catch (error) {
      logger.error('In-memory cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.cache.delete(this.getKey(key));
    } catch (error) {
      logger.error('In-memory cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const item = this.cache.get(this.getKey(key));
      return item ? item.expires > Date.now() : false;
    } catch (error) {
      logger.error('In-memory cache exists error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
    } catch (error) {
      logger.error('In-memory cache clear error:', error);
    }
  }

  // Cleanup expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of Array.from(this.cache.entries())) {
      if (item.expires <= now) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; isRedis: boolean } {
    return {
      size: this.cache.size,
      isRedis: false,
    };
  }
}
