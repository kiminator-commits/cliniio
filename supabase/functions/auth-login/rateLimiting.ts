// Redis-based rate limiting for authentication
interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number;
  retryAfter?: number;
  message?: string;
}

interface RateLimitConfig {
  maxAttemptsPerEmail: number;
  maxAttemptsPerIP: number;
  windowSizeMinutes: number;
  lockoutDurationMinutes: number;
  progressiveDelaySeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttemptsPerEmail: 5,
  maxAttemptsPerIP: 10,
  windowSizeMinutes: 15,
  lockoutDurationMinutes: 30,
  progressiveDelaySeconds: 60,
};

// Redis client setup
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    const { createClient } = await import('https://esm.sh/redis@4.6.12');
    
    const redisUrl = Deno.env.get('REDIS_URL') || 'redis://localhost:6379';
    redisClient = createClient({ url: redisUrl });
    
    redisClient.on('error', (err: Error) => {
      console.error('Redis client error:', err);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis not available, using in-memory fallback:', error);
    return null;
  }
}

// In-memory fallback storage
const memoryStore = new Map<string, { count: number; resetTime: number; lockoutUntil?: number }>();

export function getClientId(req: Request): string {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  const identifier = `${ip}-${userAgent}`;
  return btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

export function getRateLimitConfig(): RateLimitConfig {
  return {
    maxAttemptsPerEmail: parseInt(Deno.env.get('RATE_LIMIT_MAX_EMAIL') || DEFAULT_CONFIG.maxAttemptsPerEmail.toString()),
    maxAttemptsPerIP: parseInt(Deno.env.get('RATE_LIMIT_MAX_IP') || DEFAULT_CONFIG.maxAttemptsPerIP.toString()),
    windowSizeMinutes: parseInt(Deno.env.get('RATE_LIMIT_WINDOW') || DEFAULT_CONFIG.windowSizeMinutes.toString()),
    lockoutDurationMinutes: parseInt(Deno.env.get('RATE_LIMIT_LOCKOUT') || DEFAULT_CONFIG.lockoutDurationMinutes.toString()),
    progressiveDelaySeconds: parseInt(Deno.env.get('RATE_LIMIT_DELAY') || DEFAULT_CONFIG.progressiveDelaySeconds.toString()),
  };
}

async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig,
  isFailedAttempt: boolean = false,
  isSuccess: boolean = false
): Promise<RateLimitResult> {
  const redis = await getRedisClient();
  if (!redis) {
    return checkMemoryRateLimit(key, config, isFailedAttempt, isSuccess);
  }

  try {
    const now = Date.now();
    const windowMs = config.windowSizeMinutes * 60 * 1000;
    const lockoutMs = config.lockoutDurationMinutes * 60 * 1000;
    
    // Check if currently locked out
    const lockoutKey = `${key}:lockout`;
    const lockoutUntil = await redis.get(lockoutKey);
    
    if (lockoutUntil && parseInt(lockoutUntil) > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: parseInt(lockoutUntil),
        retryAfter: Math.ceil((parseInt(lockoutUntil) - now) / 1000),
        message: 'Account temporarily locked due to too many failed attempts',
      };
    }

    // Get current attempt count
    const count = await redis.get(key) || '0';
    const attemptCount = parseInt(count);

    if (isSuccess) {
      // Reset on successful login
      await redis.del(key);
      await redis.del(lockoutKey);
      return {
        allowed: true,
        remainingAttempts: config.maxAttemptsPerEmail,
        resetTime: now + windowMs,
      };
    }

    if (isFailedAttempt) {
      const newCount = attemptCount + 1;
      
      if (newCount >= config.maxAttemptsPerEmail) {
        // Lock out the account
        const lockoutEnd = now + lockoutMs;
        await redis.setex(lockoutKey, config.lockoutDurationMinutes * 60, lockoutEnd.toString());
        await redis.del(key); // Clear attempt counter
        
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: lockoutEnd,
          retryAfter: config.lockoutDurationMinutes * 60,
          message: 'Account locked due to too many failed attempts',
        };
      } else {
        // Increment counter
        await redis.setex(key, config.windowSizeMinutes * 60, newCount.toString());
        
        return {
          allowed: true,
          remainingAttempts: config.maxAttemptsPerEmail - newCount,
          resetTime: now + windowMs,
        };
      }
    }

    // Check if already at limit
    if (attemptCount >= config.maxAttemptsPerEmail) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: now + windowMs,
        retryAfter: Math.ceil(windowMs / 1000),
        message: 'Rate limit exceeded',
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttemptsPerEmail - attemptCount,
      resetTime: now + windowMs,
    };

  } catch (error) {
    console.error('Redis rate limit check failed:', error);
    return checkMemoryRateLimit(key, config, isFailedAttempt, isSuccess);
  }
}

function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig,
  isFailedAttempt: boolean = false,
  isSuccess: boolean = false
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSizeMinutes * 60 * 1000;
  const lockoutMs = config.lockoutDurationMinutes * 60 * 1000;
  
  const current = memoryStore.get(key) || { count: 0, resetTime: now + windowMs };

  // Check if currently locked out
  if (current.lockoutUntil && current.lockoutUntil > now) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: current.lockoutUntil,
      retryAfter: Math.ceil((current.lockoutUntil - now) / 1000),
      message: 'Account temporarily locked due to too many failed attempts',
    };
  }

  // Check if window has expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
    current.lockoutUntil = undefined;
  }

  if (isSuccess) {
    // Reset on successful login
    memoryStore.delete(key);
    return {
      allowed: true,
      remainingAttempts: config.maxAttemptsPerEmail,
      resetTime: now + windowMs,
    };
  }

  if (isFailedAttempt) {
    current.count++;
    
    if (current.count >= config.maxAttemptsPerEmail) {
      // Lock out the account
      current.lockoutUntil = now + lockoutMs;
      current.count = 0;
      
      memoryStore.set(key, current);
      
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: current.lockoutUntil,
        retryAfter: config.lockoutDurationMinutes * 60,
        message: 'Account locked due to too many failed attempts',
      };
    }
  }

  // Check if already at limit
  if (current.count >= config.maxAttemptsPerEmail) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000),
      message: 'Rate limit exceeded',
    };
  }

  memoryStore.set(key, current);

  return {
    allowed: true,
    remainingAttempts: config.maxAttemptsPerEmail - current.count,
    resetTime: current.resetTime,
  };
}

export async function checkRateLimit(
  email: string,
  ipAddress: string,
  clientId: string,
  isFailedAttempt: boolean = false,
  isSuccess: boolean = false
): Promise<RateLimitResult> {
  const config = getRateLimitConfig();
  
  // Check both email and IP limits
  const emailKey = `auth:email:${email.toLowerCase()}`;
  const ipKey = `auth:ip:${ipAddress}`;
  
  const emailResult = await checkRedisRateLimit(emailKey, config, isFailedAttempt, isSuccess);
  const ipResult = await checkRedisRateLimit(ipKey, config, isFailedAttempt, isSuccess);
  
  // Return the most restrictive result
  if (!emailResult.allowed || !ipResult.allowed) {
    return emailResult.resetTime < ipResult.resetTime ? emailResult : ipResult;
  }
  
  return {
    allowed: true,
    remainingAttempts: Math.min(emailResult.remainingAttempts, ipResult.remainingAttempts),
    resetTime: Math.min(emailResult.resetTime, ipResult.resetTime),
  };
}
