import { supabase } from '@/lib/supabaseClient';
import { SECURITY_CONSTANTS } from '@/constants/securityConstants';
import { DistributedRateLimiter } from './rateLimiting/DistributedRateLimiter';

export interface RateLimitInfo {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutTime?: number;
  error?: string;
}

export interface RateLimitConfig {
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  windowSize: number; // in minutes
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: SECURITY_CONSTANTS.RATE_LIMIT.MAX_ATTEMPTS,
  lockoutDuration: SECURITY_CONSTANTS.RATE_LIMIT.LOCKOUT_DURATION_MINUTES,
  windowSize: SECURITY_CONSTANTS.RATE_LIMIT.WINDOW_SIZE_MINUTES,
};

class RateLimitService {
  private config: RateLimitConfig;
  private distributedLimiter: DistributedRateLimiter;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.distributedLimiter = new DistributedRateLimiter({
      maxRequests: this.config.maxAttempts,
      windowMs: this.config.windowSize * 60 * 1000,
      keyPrefix: 'auth',
      blockDurationMs: this.config.lockoutDuration * 60 * 1000,
    });
  }

  /**
   * Check if an email is rate limited using distributed rate limiting
   */
  async checkRateLimit(email: string): Promise<RateLimitInfo> {
    try {
      // Use distributed rate limiter for immediate response
      const result = await this.distributedLimiter.checkRateLimit(email);

      if (!result.allowed) {
        return {
          isLocked: true,
          remainingAttempts: 0,
          lockoutTime: result.resetTime,
          error: `Too many failed attempts. Please try again in ${result.retryAfter || 0} seconds.`,
        };
      }

      // Also check database for persistent rate limiting (for audit purposes)
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .gte(
          'attempted_at',
          new Date(
            Date.now() - this.config.windowSize * 60 * 1000
          ).toISOString()
        )
        .order('attempted_at', { ascending: false });

      if (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Database rate limit check failed:', error);
        }
      }

      const attempts = data || [];
      const failedAttempts = attempts.filter((attempt) => !attempt.success);

      // If database shows persistent blocking, respect it
      if (failedAttempts.length >= this.config.maxAttempts) {
        const lastAttempt = failedAttempts[0];
        const lockoutEnd = new Date(lastAttempt.attempted_at as string);
        lockoutEnd.setMinutes(
          lockoutEnd.getMinutes() + this.config.lockoutDuration
        );

        if (lockoutEnd > new Date()) {
          return {
            isLocked: true,
            remainingAttempts: 0,
            lockoutTime: lockoutEnd.getTime(),
            error: `Account temporarily locked due to repeated failed attempts. Please try again later.`,
          };
        }
      }

      return {
        isLocked: false,
        remainingAttempts: result.remaining,
      };
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Rate limit check error:', error);
      }
      // Fail open - allow login if rate limiting fails
      return { isLocked: false, remainingAttempts: this.config.maxAttempts };
    }
  }

  /**
   * Record a login attempt in the database
   */
  async recordAttempt(
    email: string,
    success: boolean,
    ipAddress?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('login_attempts').insert({
        email,
        success,
        attempted_at: new Date().toISOString(),
        ip_address: ipAddress || 'unknown',
        user_agent: navigator.userAgent,
      });

      if (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to record login attempt:', error);
        }
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error recording login attempt:', error);
      }
    }
  }

  /**
   * Reset rate limiting for an email after successful login
   */
  async resetRateLimit(email: string): Promise<void> {
    try {
      // Reset distributed rate limiter
      await this.distributedLimiter.resetRateLimit(email);

      // Also reset database records
      const { error } = await supabase
        .from('login_attempts')
        .delete()
        .eq('email', email);

      if (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to reset database rate limit:', error);
        }
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error resetting rate limit:', error);
      }
    }
  }

  /**
   * Get rate limit configuration
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Update rate limit configuration
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();

// Export the class for testing
export { RateLimitService };
