import { generalRateLimiter } from '@/services/rateLimiting/DistributedRateLimiter';

export const rateLimiter = {
  windowMs: 60000,
  maxRequests: 30,

  async checkLimit(userId: string): Promise<boolean> {
    try {
      const result = await generalRateLimiter.checkRateLimit(userId);
      return result.allowed;
    } catch (error) {
      // Fallback to allowing request if rate limiting fails
      console.warn('Rate limiting failed, allowing request:', error);
      return true;
    }
  },

  async getStatus(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const result = await generalRateLimiter.getRateLimitStatus(userId);
      return {
        allowed: result.allowed,
        remaining: result.remaining,
        resetTime: result.resetTime,
      };
    } catch (error) {
      console.warn('Rate limit status check failed:', error);
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs,
      };
    }
  },

  async resetLimit(userId: string): Promise<void> {
    try {
      await generalRateLimiter.resetRateLimit(userId);
    } catch (error) {
      console.warn('Rate limit reset failed:', error);
    }
  },
};
