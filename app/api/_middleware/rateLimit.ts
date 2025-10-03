import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/_core/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per time window
 */
export function createRateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return (req: NextRequest): NextResponse | null => {
    try {
      // Generate rate limit key
      const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);
      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired entry
        entry = {
          count: 0,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
      }

      // Increment request count
      entry.count++;

      // Check if limit exceeded
      if (entry.count > maxRequests) {
        logger.warn('API: Rate limit exceeded', {
          endpoint: req.url,
          key,
          count: entry.count,
          limit: maxRequests,
          resetTime: new Date(entry.resetTime).toISOString(),
        });

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((entry.resetTime - now) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(
                (entry.resetTime - now) / 1000
              ).toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': entry.resetTime.toString(),
            },
          }
        );
      }

      // Add rate limit headers
      const remaining = Math.max(0, maxRequests - entry.count);
      const resetTime = entry.resetTime;

      // Set response headers (will be added by the calling function)
      req.headers.set('X-RateLimit-Limit', maxRequests.toString());
      req.headers.set('X-RateLimit-Remaining', remaining.toString());
      req.headers.set('X-RateLimit-Reset', resetTime.toString());

      return null; // No rate limit violation
    } catch (error) {
      logger.error('API: Rate limiting error', {
        endpoint: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Fail open - don't block requests due to rate limiting errors
      return null;
    }
  };
}

/**
 * Default key generator using IP address
 */
function getDefaultKey(req: NextRequest): string {
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `rate_limit:${ip}`;
}

/**
 * User-based key generator for authenticated requests
 */
export function getUserKeyGenerator(req: NextRequest): string {
  const user = (req as NextRequest & { user?: { id: string } }).user;
  if (user?.id) {
    return `rate_limit:user:${user.id}`;
  }
  return getDefaultKey(req);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
