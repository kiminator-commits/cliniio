import { DistributedCache } from '../cache/DistributedCache';
import { logger } from '../../utils/_core/logger';

export interface CacheKey {
  service: string;
  operation: string;
  parameters: Record<string, unknown>;
  userId?: string;
  facilityId?: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  includeUserContext?: boolean;
  includeFacilityContext?: boolean;
}

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  metadata: {
    service: string;
    operation: string;
    userId?: string;
    facilityId?: string;
  };
}

export class AIResponseCache {
  private cache: DistributedCache;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private hitCounts = new Map<string, number>();

  constructor() {
    this.cache = new DistributedCache('ai_responses');
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(key: CacheKey): string {
    const { service, operation, parameters, userId, facilityId } = key;

    // Create a deterministic hash of the parameters
    const paramsHash = this.hashObject(parameters);

    let cacheKey = `${service}:${operation}:${paramsHash}`;

    if (userId) {
      cacheKey += `:user:${userId}`;
    }

    if (facilityId) {
      cacheKey += `:facility:${facilityId}`;
    }

    return cacheKey;
  }

  /**
   * Get cached response
   */
  async get<T>(key: CacheKey): Promise<T | null> {
    try {
      const cacheKey = this.generateCacheKey(key);
      const cached = await this.cache.get<CachedResponse<T>>(cacheKey);

      if (cached) {
        // Increment hit count
        const currentCount = this.hitCounts.get(cacheKey) || 0;
        this.hitCounts.set(cacheKey, currentCount + 1);

        logger.debug(`AI cache hit for ${key.service}:${key.operation}`);
        return cached.data;
      }

      return null;
    } catch (error) {
      logger.error('Error getting from AI cache:', error);
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set<T>(
    key: CacheKey,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(key);
      const ttl = options.ttl || this.DEFAULT_TTL;

      const cachedResponse: CachedResponse<T> = {
        data,
        timestamp: Date.now(),
        hitCount: 0,
        metadata: {
          service: key.service,
          operation: key.operation,
          userId: key.userId,
          facilityId: key.facilityId,
        },
      };

      await this.cache.set(cacheKey, cachedResponse, { ttl });
      logger.debug(`AI response cached for ${key.service}:${key.operation}`);
    } catch (error) {
      logger.error('Error setting AI cache:', error);
    }
  }

  /**
   * Execute operation with caching
   */
  async executeWithCache<T>(
    key: CacheKey,
    operation: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute operation
    const result = await operation();

    // Cache the result
    await this.set(key, result, options);

    return result;
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(pattern: {
    service?: string;
    operation?: string;
    userId?: string;
    facilityId?: string;
  }): Promise<void> {
    try {
      // This is a simplified implementation
      // In a real Redis setup, you'd use pattern matching
      logger.info(`Invalidating AI cache for pattern:`, pattern);

      // For now, we'll clear all cache entries
      // In production, implement pattern-based invalidation
      await this.cache.clear();
    } catch (error) {
      logger.error('Error invalidating AI cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    hitCounts: Record<string, number>;
    cacheStats: unknown;
  } {
    return {
      totalEntries: this.hitCounts.size,
      hitCounts: Object.fromEntries(this.hitCounts),
      cacheStats: this.cache.getStats(),
    };
  }

  /**
   * Clear all cached responses
   */
  async clear(): Promise<void> {
    try {
      await this.cache.clear();
      this.hitCounts.clear();
      logger.info('AI response cache cleared');
    } catch (error) {
      logger.error('Error clearing AI cache:', error);
    }
  }

  /**
   * Hash object for consistent cache keys
   */
  private hashObject(obj: unknown): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.simpleHash(str);
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton instance
export const aiResponseCache = new AIResponseCache();
