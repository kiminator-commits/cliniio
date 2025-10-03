// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs: number; // How long to block after limit exceeded
}

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<
  string,
  { count: number; resetTime: number; blockedUntil?: number }
>();

// Rate limiting configuration by environment
export const getRateLimitConfig = (): RateLimitConfig => {
  const environment = Deno.env.get('ENVIRONMENT') || 'development';

  switch (environment) {
    case 'production':
      return {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 requests per 15 minutes
        blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
      };
    case 'staging':
      return {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20, // 20 requests per 5 minutes
        blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
      };
    case 'development':
    default:
      return {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 50, // 50 requests per minute
        blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
      };
  }
};

// Rate limiting function
export const checkRateLimit = (
  clientId: string
): { allowed: boolean; remaining: number; resetTime: number } => {
  const config = getRateLimitConfig();
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  const clientData = rateLimitStore.get(clientId);

  // If client is blocked
  if (clientData?.blockedUntil && now < clientData.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: clientData.blockedUntil,
    };
  }

  // If no data or window has expired
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  // If within window and under limit
  if (clientData.count < config.maxRequests) {
    clientData.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - clientData.count,
      resetTime: clientData.resetTime,
    };
  }

  // Rate limit exceeded - block client
  clientData.blockedUntil = now + config.blockDurationMs;
  console.warn(`🚨 Rate limit exceeded for client ${clientId}`, {
    clientId,
    count: clientData.count,
    maxRequests: config.maxRequests,
    blockedUntil: new Date(clientData.blockedUntil).toISOString(),
    timestamp: new Date().toISOString(),
  });

  return {
    allowed: false,
    remaining: 0,
    resetTime: clientData.blockedUntil,
  };
};

// Get client identifier for rate limiting
export const getClientId = (req: Request): string => {
  // Try to get IP from various headers (for different proxy setups)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  const ip =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    'unknown';

  return `ip:${ip}`;
};
