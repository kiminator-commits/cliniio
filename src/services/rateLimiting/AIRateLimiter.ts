import { DistributedRateLimiter } from './DistributedRateLimiter';
import { logger } from '../../utils/_core/logger';

export interface AIRateLimitConfig {
  maxRequests: number;
  windowMs: number;
  burstLimit: number;
  retryDelay: number;
  maxRetries: number;
}

export interface AIRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  burstRemaining?: number;
}

export class AIRateLimiter {
  private generalLimiter: DistributedRateLimiter;
  private burstLimiter: DistributedRateLimiter;
  private config: AIRateLimitConfig;

  constructor(config: Partial<AIRateLimitConfig> = {}) {
    this.config = {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      burstLimit: 10,
      retryDelay: 1000,
      maxRetries: 3,
      ...config,
    };

    this.generalLimiter = new DistributedRateLimiter({
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
      keyPrefix: 'ai_general',
      blockDurationMs: this.config.windowMs,
    });

    this.burstLimiter = new DistributedRateLimiter({
      maxRequests: this.config.burstLimit,
      windowMs: 10 * 1000, // 10 seconds for burst
      keyPrefix: 'ai_burst',
      blockDurationMs: 30 * 1000, // 30 seconds
    });
  }

  /**
   * Check if AI request is allowed
   */
  async checkRateLimit(
    identifier: string,
    isBurst: boolean = false
  ): Promise<AIRateLimitResult> {
    try {
      // Check burst limit first for immediate requests
      if (isBurst) {
        const burstResult = await this.burstLimiter.checkRateLimit(identifier);
        if (!burstResult.allowed) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: burstResult.resetTime,
            retryAfter: burstResult.retryAfter,
            burstRemaining: 0,
          };
        }
      }

      // Check general rate limit
      const generalResult =
        await this.generalLimiter.checkRateLimit(identifier);

      return {
        allowed: generalResult.allowed,
        remaining: generalResult.remaining,
        resetTime: generalResult.resetTime,
        retryAfter: generalResult.retryAfter,
        burstRemaining: isBurst
          ? await this.getBurstRemaining(identifier)
          : undefined,
      };
    } catch (error) {
      logger.error('AI rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      };
    }
  }

  /**
   * Record an AI request
   */
  async recordRequest(
    identifier: string,
    isBurst: boolean = false
  ): Promise<void> {
    try {
      if (isBurst) {
        await this.burstLimiter.checkRateLimit(identifier);
      }
      await this.generalLimiter.checkRateLimit(identifier);
    } catch (error) {
      logger.error('AI rate limit recording failed:', error);
    }
  }

  /**
   * Get remaining burst requests
   */
  private async getBurstRemaining(identifier: string): Promise<number> {
    try {
      const result = await this.burstLimiter.getRateLimitStatus(identifier);
      return result.remaining;
    } catch (error) {
      logger.error('Failed to get burst remaining:', error);
      return this.config.burstLimit;
    }
  }

  /**
   * Reset rate limits for identifier
   */
  async resetRateLimit(identifier: string): Promise<void> {
    try {
      await Promise.all([
        this.generalLimiter.resetRateLimit(identifier),
        this.burstLimiter.resetRateLimit(identifier),
      ]);
    } catch (error) {
      logger.error('Failed to reset AI rate limits:', error);
    }
  }

  /**
   * Get rate limit status without consuming quota
   */
  async getStatus(identifier: string): Promise<{
    general: AIRateLimitResult;
    burst: AIRateLimitResult;
  }> {
    try {
      const [generalResult, burstResult] = await Promise.all([
        this.generalLimiter.getRateLimitStatus(identifier),
        this.burstLimiter.getRateLimitStatus(identifier),
      ]);

      return {
        general: {
          allowed: generalResult.allowed,
          remaining: generalResult.remaining,
          resetTime: generalResult.resetTime,
          retryAfter: generalResult.retryAfter,
        },
        burst: {
          allowed: burstResult.allowed,
          remaining: burstResult.remaining,
          resetTime: burstResult.resetTime,
          retryAfter: burstResult.retryAfter,
        },
      };
    } catch (error) {
      logger.error('Failed to get AI rate limit status:', error);
      return {
        general: {
          allowed: true,
          remaining: this.config.maxRequests,
          resetTime: Date.now() + this.config.windowMs,
        },
        burst: {
          allowed: true,
          remaining: this.config.burstLimit,
          resetTime: Date.now() + 10 * 1000,
        },
      };
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIRateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update limiters with new config
    this.generalLimiter = new DistributedRateLimiter({
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
      keyPrefix: 'ai_general',
      blockDurationMs: this.config.windowMs,
    });

    this.burstLimiter = new DistributedRateLimiter({
      maxRequests: this.config.burstLimit,
      windowMs: 10 * 1000,
      keyPrefix: 'ai_burst',
      blockDurationMs: 30 * 1000,
    });

    logger.info('AI rate limiter configuration updated', newConfig);
  }

  /**
   * Get current configuration
   */
  getConfigs(): AIRateLimitConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStats(): {
    general: unknown;
    burst: unknown;
    config: AIRateLimitConfig;
  } {
    return {
      general: this.generalLimiter.getStats(),
      burst: this.burstLimiter.getStats(),
      config: this.config,
    };
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    try {
      const generalStats = this.generalLimiter.getStats();
      const burstStats = this.burstLimiter.getStats();
      return generalStats.redisHealthy || burstStats.redisHealthy;
    } catch (error) {
      logger.error('Health check failed:', error);
      return false;
    }
  }
}

// Pre-configured AI rate limiters for different use cases
export const aiRateLimiter = new AIRateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000, // 1 minute
  burstLimit: 5,
  retryDelay: 2000,
  maxRetries: 3,
});

export const aiAnalyticsRateLimiter = new AIRateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  burstLimit: 3,
  retryDelay: 3000,
  maxRetries: 2,
});

export const aiBatchRateLimiter = new AIRateLimiter({
  maxRequests: 10,
  windowMs: 5 * 60 * 1000, // 5 minutes
  burstLimit: 2,
  retryDelay: 5000,
  maxRetries: 1,
});
