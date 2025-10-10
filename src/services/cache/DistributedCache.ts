import { redisManager } from '../../lib/redisClient';
import { InMemoryCache } from './InMemoryCache';
import { logger } from '../../utils/_core/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export class DistributedCache {
  private namespace: string;
  private fallbackCache: InMemoryCache;

  constructor(namespace: string = 'cliniio') {
    this.namespace = namespace;
    this.fallbackCache = new InMemoryCache(namespace);
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        const value = await (
          client as { get: (key: string) => Promise<string | null> }
        ).get(this.getKey(key));
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to in-memory cache
        return await this.fallbackCache.get<T>(key);
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return await this.fallbackCache.get<T>(key);
    }
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        const ttl = options.ttl || 300; // Default 5 minutes
        await (
          client as {
            setEx: (
              key: string,
              seconds: number,
              value: string
            ) => Promise<unknown>;
          }
        ).setEx(this.getKey(key), ttl, JSON.stringify(value));
      } else {
        // Fallback to in-memory cache
        await this.fallbackCache.set(key, value, options);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
      await this.fallbackCache.set(key, value, options);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        await (client as { del: (key: string) => Promise<unknown> }).del(
          this.getKey(key)
        );
      } else {
        await this.fallbackCache.del(key);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
      await this.fallbackCache.del(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        const result = await (
          client as { exists: (key: string) => Promise<number> }
        ).exists(this.getKey(key));
        return result === 1;
      } else {
        return await this.fallbackCache.exists(key);
      }
    } catch (error) {
      logger.error('Cache exists error:', error);
      return await this.fallbackCache.exists(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        const keys = await (
          client as { keys: (pattern: string) => Promise<string[]> }
        ).keys(this.getKey('*'));
        if (keys.length > 0) {
          await (client as { del: (keys: string[]) => Promise<unknown> }).del(
            keys
          );
        }
      } else {
        await this.fallbackCache.clear();
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
      await this.fallbackCache.clear();
    }
  }

  // Cleanup expired items from fallback cache
  cleanup(): void {
    this.fallbackCache.cleanup();
  }

  // Get cache statistics
  getStats(): { size: number; isRedis: boolean } {
    const fallbackStats = this.fallbackCache.getStats();
    return {
      size: fallbackStats.size,
      isRedis: redisManager.isHealthy(),
    };
  }
}
