import { redisManager } from '../../lib/redisClient';
import { logger } from '../../utils/_core/logger';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
  blockDurationMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

export class DistributedRateLimiter {
  private config: RateLimitConfig;
  private fallbackCache: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDurationMs: config.windowMs * 2, // Default block duration
      ...config,
    };
    this.startCleanupInterval();
  }

  /**
   * Check if request is allowed and update counters
   */
  async checkRateLimit(
    identifier: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const effectiveConfig = { ...this.config, ...customConfig };
    const key = `${effectiveConfig.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - effectiveConfig.windowMs;

    try {
      // Try Redis first
      if (redisManager.isHealthy()) {
        return await this.checkRedisRateLimit(
          key,
          effectiveConfig,
          now,
          windowStart
        );
      }
    } catch (error) {
      logger.warn(
        'Redis rate limiting failed, falling back to in-memory:',
        error
      );
    }

    // Fallback to in-memory cache
    return this.checkInMemoryRateLimit(key, effectiveConfig, now);
  }

  /**
   * Redis-based rate limiting using sliding window
   */
  private async checkRedisRateLimit(
    key: string,
    config: RateLimitConfig,
    now: number,
    windowStart: number
  ): Promise<RateLimitResult> {
    const client = redisManager.getClient();

    // Use Redis pipeline for atomic operations
    const pipeline = (client as { multi: () => unknown }).multi();

    // Remove expired entries
    pipeline.zRemRangeByScore(key, '-inf', windowStart);

    // Count current requests in window
    pipeline.zCard(key);

    // Add current request
    pipeline.zAdd(key, { score: now, member: `${now}-${Math.random()}` });

    // Set expiration
    pipeline.expire(key, Math.ceil(config.windowMs / 1000));

    // Check if blocked
    const blockKey = `${key}:blocked`;
    pipeline.get(blockKey);

    const results = await pipeline.exec();

    if (!results || results.length < 4) {
      throw new Error('Redis pipeline execution failed');
    }

    const currentCount = results[1] as number;
    const isBlocked = results[4] as string | null;

    // Check if currently blocked
    if (isBlocked) {
      const blockUntil = parseInt(isBlocked);
      if (now < blockUntil) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          retryAfter: Math.ceil((blockUntil - now) / 1000),
        };
      } else {
        // Block expired, remove it
        await (client as { del: (key: string) => Promise<unknown> }).del(
          blockKey
        );
      }
    }

    // Check rate limit
    if (currentCount >= config.maxRequests) {
      // Set block if configured
      if (config.blockDurationMs) {
        const blockUntil = now + config.blockDurationMs;
        await (
          client as {
            setEx: (
              key: string,
              seconds: number,
              value: string
            ) => Promise<unknown>;
          }
        ).setEx(
          blockKey,
          Math.ceil(config.blockDurationMs / 1000),
          blockUntil.toString()
        );
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + config.windowMs,
        retryAfter: Math.ceil(config.windowMs / 1000),
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - currentCount - 1,
      resetTime: now + config.windowMs,
    };
  }

  /**
   * In-memory fallback rate limiting
   */
  private checkInMemoryRateLimit(
    key: string,
    config: RateLimitConfig,
    now: number
  ): RateLimitResult {
    const entry = this.fallbackCache.get(key);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      this.fallbackCache.delete(key);
    }

    const currentEntry = this.fallbackCache.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      blocked: false,
    };

    // Check if blocked
    if (
      currentEntry.blocked &&
      currentEntry.blockUntil &&
      now < currentEntry.blockUntil
    ) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.blockUntil,
        retryAfter: Math.ceil((currentEntry.blockUntil - now) / 1000),
      };
    }

    // Reset if window expired
    if (currentEntry.resetTime < now) {
      currentEntry.count = 0;
      currentEntry.resetTime = now + config.windowMs;
      currentEntry.blocked = false;
      delete currentEntry.blockUntil;
    }

    // Check rate limit
    if (currentEntry.count >= config.maxRequests) {
      // Set block if configured
      if (config.blockDurationMs) {
        currentEntry.blocked = true;
        currentEntry.blockUntil = now + config.blockDurationMs;
      }

      this.fallbackCache.set(key, currentEntry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: currentEntry.resetTime,
        retryAfter: Math.ceil(config.windowMs / 1000),
      };
    }

    // Allow request
    currentEntry.count++;
    this.fallbackCache.set(key, currentEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime,
    };
  }

  /**
   * Reset rate limit for specific identifier
   */
  async resetRateLimit(
    identifier: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<void> {
    const effectiveConfig = { ...this.config, ...customConfig };
    const key = `${effectiveConfig.keyPrefix}:${identifier}`;

    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();
        await (client as { del: (key: string) => Promise<unknown> }).del(key);
        await (client as { del: (key: string) => Promise<unknown> }).del(
          `${key}:blocked`
        );
      }
    } catch (error) {
      logger.warn('Failed to reset Redis rate limit:', error);
    }

    // Also clear from fallback cache
    this.fallbackCache.delete(key);
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getRateLimitStatus(
    identifier: string,
    customConfig?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const effectiveConfig = { ...this.config, ...customConfig };
    const key = `${effectiveConfig.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - effectiveConfig.windowMs;

    try {
      if (redisManager.isHealthy()) {
        const client = redisManager.getClient();

        // Check if blocked
        const blockKey = `${key}:blocked`;
        const isBlocked = await (
          client as { get: (key: string) => Promise<string | null> }
        ).get(blockKey);

        if (isBlocked) {
          const blockUntil = parseInt(isBlocked);
          if (now < blockUntil) {
            return {
              allowed: false,
              remaining: 0,
              resetTime: blockUntil,
              retryAfter: Math.ceil((blockUntil - now) / 1000),
            };
          }
        }

        // Count current requests
        const currentCount = await (
          client as {
            zCount: (key: string, min: number, max: string) => Promise<number>;
          }
        ).zCount(key, windowStart, '+inf');

        return {
          allowed: currentCount < effectiveConfig.maxRequests,
          remaining: Math.max(0, effectiveConfig.maxRequests - currentCount),
          resetTime: now + effectiveConfig.windowMs,
        };
      }
    } catch (error) {
      logger.warn('Failed to get Redis rate limit status:', error);
    }

    // Fallback to in-memory
    const entry = this.fallbackCache.get(key);
    if (!entry || entry.resetTime < now) {
      return {
        allowed: true,
        remaining: effectiveConfig.maxRequests,
        resetTime: now + effectiveConfig.windowMs,
      };
    }

    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      };
    }

    return {
      allowed: entry.count < effectiveConfig.maxRequests,
      remaining: Math.max(0, effectiveConfig.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries from fallback cache
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of Array.from(this.fallbackCache.entries())) {
        if (entry.resetTime < now) {
          this.fallbackCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Get statistics about rate limiting
   */
  getStats(): {
    fallbackCacheSize: number;
    redisHealthy: boolean;
    config: RateLimitConfig;
  } {
    return {
      fallbackCacheSize: this.fallbackCache.size,
      redisHealthy: redisManager.isHealthy(),
      config: this.config,
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.fallbackCache.clear();
  }
}

// Pre-configured rate limiters for different use cases
export const apiRateLimiter = new DistributedRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'api',
  blockDurationMs: 5 * 60 * 1000, // 5 minutes
});

export const authRateLimiter = new DistributedRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'auth',
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
});

export const aiRateLimiter = new DistributedRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'ai',
  blockDurationMs: 2 * 60 * 1000, // 2 minutes
});

export const generalRateLimiter = new DistributedRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'general',
});
