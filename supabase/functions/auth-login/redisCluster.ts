// Enhanced Redis cluster manager for distributed rate limiting
interface RedisClusterConfig {
  nodes: Array<{
    host: string;
    port: number;
    password?: string;
  }>;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  maxRedirections: number;
  lazyConnect: boolean;
}

interface RateLimitWindow {
  count: number;
  windowStart: number;
  lockoutUntil?: number;
  lastAttempt: number;
}

interface DistributedRateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: number;
  retryAfter?: number;
  message?: string;
  distributed: boolean;
}

class RedisClusterManager {
  private clients: any[] = [];
  private config: RedisClusterConfig;
  private isConnected = false;
  private currentClientIndex = 0;
  private fallbackStore = new Map<string, RateLimitWindow>();

  constructor(config: RedisClusterConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const { createClient } = await import('https://esm.sh/redis@4.6.12');

      // Create multiple Redis clients for redundancy
      for (const node of this.config.nodes) {
        const client = createClient({
          socket: {
            host: node.host,
            port: node.port,
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                console.error(
                  `Redis connection failed after 10 retries for ${node.host}:${node.port}`
                );
                return new Error('Redis connection failed');
              }
              return Math.min(retries * 100, 3000);
            },
          },
          password: node.password,
          retryDelayOnFailover: this.config.retryDelayOnFailover,
          maxRetriesPerRequest: this.config.maxRetriesPerRequest,
          enableReadyCheck: this.config.enableReadyCheck,
          maxRedirections: this.config.maxRedirections,
          lazyConnect: this.config.lazyConnect,
        });

        client.on('error', (err: Error) => {
          console.error(
            `Redis client error for ${node.host}:${node.port}:`,
            err
          );
        });

        client.on('connect', () => {
          console.log(`Redis client connected to ${node.host}:${node.port}`);
        });

        client.on('disconnect', () => {
          console.warn(
            `Redis client disconnected from ${node.host}:${node.port}`
          );
        });

        await client.connect();
        this.clients.push(client);
      }

      this.isConnected = this.clients.length > 0;
      console.log(`Redis cluster connected with ${this.clients.length} nodes`);
    } catch (error) {
      console.warn(
        'Redis cluster connection failed, using in-memory fallback:',
        error
      );
      this.isConnected = false;
    }
  }

  private getClient(): any {
    if (!this.isConnected || this.clients.length === 0) {
      return null;
    }

    // Round-robin client selection
    const client = this.clients[this.currentClientIndex];
    this.currentClientIndex =
      (this.currentClientIndex + 1) % this.clients.length;
    return client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return this.setFallback(key, value, ttlSeconds);
    }

    try {
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET failed:', error);
      return this.setFallback(key, value, ttlSeconds);
    }
  }

  async get(key: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) {
      return this.getFallback(key);
    }

    try {
      return await client.get(key);
    } catch (error) {
      console.error('Redis GET failed:', error);
      return this.getFallback(key);
    }
  }

  async del(key: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return this.delFallback(key);
    }

    try {
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL failed:', error);
      return this.delFallback(key);
    }
  }

  async incr(key: string): Promise<number> {
    const client = this.getClient();
    if (!client) {
      return this.incrFallback(key);
    }

    try {
      return await client.incr(key);
    } catch (error) {
      console.error('Redis INCR failed:', error);
      return this.incrFallback(key);
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return this.expireFallback(key, seconds);
    }

    try {
      const result = await client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE failed:', error);
      return this.expireFallback(key, seconds);
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    const client = this.getClient();
    if (!client) {
      return keys.map((key) => this.getFallback(key));
    }

    try {
      return await client.mGet(keys);
    } catch (error) {
      console.error('Redis MGET failed:', error);
      return keys.map((key) => this.getFallback(key));
    }
  }

  async mset(keyValuePairs: Record<string, string>): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return this.msetFallback(keyValuePairs);
    }

    try {
      await client.mSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error('Redis MSET failed:', error);
      return this.msetFallback(keyValuePairs);
    }
  }

  // Fallback methods for in-memory storage
  private setFallback(
    key: string,
    value: string,
    ttlSeconds?: number
  ): boolean {
    const window: RateLimitWindow = {
      count: parseInt(value) || 0,
      windowStart: Date.now(),
      lastAttempt: Date.now(),
    };

    if (ttlSeconds) {
      window.windowStart = Date.now() + ttlSeconds * 1000;
    }

    this.fallbackStore.set(key, window);
    return true;
  }

  private getFallback(key: string): string | null {
    const window = this.fallbackStore.get(key);
    if (!window) return null;

    // Check if window has expired
    if (Date.now() > window.windowStart + 15 * 60 * 1000) {
      // 15 minutes default
      this.fallbackStore.delete(key);
      return null;
    }

    return window.count.toString();
  }

  private delFallback(key: string): boolean {
    return this.fallbackStore.delete(key);
  }

  private incrFallback(key: string): number {
    const window = this.fallbackStore.get(key) || {
      count: 0,
      windowStart: Date.now(),
      lastAttempt: Date.now(),
    };

    window.count++;
    window.lastAttempt = Date.now();
    this.fallbackStore.set(key, window);
    return window.count;
  }

  private expireFallback(key: string, seconds: number): boolean {
    const window = this.fallbackStore.get(key);
    if (!window) return false;

    window.windowStart = Date.now() + seconds * 1000;
    this.fallbackStore.set(key, window);
    return true;
  }

  private msetFallback(keyValuePairs: Record<string, string>): boolean {
    for (const [key, value] of Object.entries(keyValuePairs)) {
      this.setFallback(key, value);
    }
    return true;
  }

  isHealthy(): boolean {
    return this.isConnected && this.clients.length > 0;
  }

  async disconnect(): Promise<void> {
    for (const client of this.clients) {
      try {
        await client.disconnect();
      } catch (error) {
        console.error('Error disconnecting Redis client:', error);
      }
    }
    this.clients = [];
    this.isConnected = false;
  }

  getClusterInfo(): {
    connected: boolean;
    nodeCount: number;
    fallbackActive: boolean;
  } {
    return {
      connected: this.isConnected,
      nodeCount: this.clients.length,
      fallbackActive: !this.isConnected,
    };
  }
}

// Enhanced distributed rate limiter
export class DistributedRateLimiter {
  private cluster: RedisClusterManager;
  private config: {
    maxAttemptsPerEmail: number;
    maxAttemptsPerIP: number;
    windowSizeMinutes: number;
    lockoutDurationMinutes: number;
    progressiveDelaySeconds: number;
  };

  constructor(config: any) {
    this.config = config;

    // Initialize Redis cluster
    const clusterConfig: RedisClusterConfig = {
      nodes: [
        {
          host: Deno.env.get('REDIS_HOST_1') || 'localhost',
          port: parseInt(Deno.env.get('REDIS_PORT_1') || '6379'),
          password: Deno.env.get('REDIS_PASSWORD'),
        },
        {
          host: Deno.env.get('REDIS_HOST_2') || 'localhost',
          port: parseInt(Deno.env.get('REDIS_PORT_2') || '6380'),
          password: Deno.env.get('REDIS_PASSWORD'),
        },
        {
          host: Deno.env.get('REDIS_HOST_3') || 'localhost',
          port: parseInt(Deno.env.get('REDIS_PORT_3') || '6381'),
          password: Deno.env.get('REDIS_PASSWORD'),
        },
      ],
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      maxRedirections: 16,
      lazyConnect: false,
    };

    this.cluster = new RedisClusterManager(clusterConfig);
  }

  async initialize(): Promise<void> {
    await this.cluster.connect();
  }

  async checkDistributedRateLimit(
    email: string,
    ipAddress: string,
    clientId: string,
    isFailedAttempt: boolean = false,
    isSuccess: boolean = false
  ): Promise<DistributedRateLimitResult> {
    const now = Date.now();
    const windowMs = this.config.windowSizeMinutes * 60 * 1000;
    const lockoutMs = this.config.lockoutDurationMinutes * 60 * 1000;

    // Create keys for distributed tracking
    const emailKey = `auth:email:${email.toLowerCase()}`;
    const ipKey = `auth:ip:${ipAddress}`;
    const clientKey = `auth:client:${clientId}`;

    try {
      // Check lockout status first
      const lockoutKeys = [
        `${emailKey}:lockout`,
        `${ipKey}:lockout`,
        `${clientKey}:lockout`,
      ];
      const lockoutValues = await this.cluster.mget(lockoutKeys);

      for (let i = 0; i < lockoutValues.length; i++) {
        const lockoutUntil = lockoutValues[i];
        if (lockoutUntil && parseInt(lockoutUntil) > now) {
          return {
            allowed: false,
            remainingAttempts: 0,
            resetTime: parseInt(lockoutUntil),
            retryAfter: Math.ceil((parseInt(lockoutUntil) - now) / 1000),
            message:
              'Account temporarily locked due to too many failed attempts',
            distributed: true,
          };
        }
      }

      if (isSuccess) {
        // Reset all counters on successful login
        await this.cluster.del(emailKey);
        await this.cluster.del(ipKey);
        await this.cluster.del(clientKey);
        await this.cluster.del(`${emailKey}:lockout`);
        await this.cluster.del(`${ipKey}:lockout`);
        await this.cluster.del(`${clientKey}:lockout`);

        return {
          allowed: true,
          remainingAttempts: this.config.maxAttemptsPerEmail,
          resetTime: now + windowMs,
          distributed: true,
        };
      }

      // Get current counts
      const countKeys = [emailKey, ipKey, clientKey];
      const counts = await this.cluster.mget(countKeys);

      const emailCount = parseInt(counts[0] || '0');
      const ipCount = parseInt(counts[1] || '0');
      const clientCount = parseInt(counts[2] || '0');

      if (isFailedAttempt) {
        // Increment counters
        const newEmailCount = await this.cluster.incr(emailKey);
        const newIpCount = await this.cluster.incr(ipKey);
        const newClientCount = await this.cluster.incr(clientKey);

        // Set expiration for counters
        await this.cluster.expire(emailKey, this.config.windowSizeMinutes * 60);
        await this.cluster.expire(ipKey, this.config.windowSizeMinutes * 60);
        await this.cluster.expire(
          clientKey,
          this.config.windowSizeMinutes * 60
        );

        // Check if any limit exceeded
        if (newEmailCount >= this.config.maxAttemptsPerEmail) {
          await this.cluster.set(
            `${emailKey}:lockout`,
            (now + lockoutMs).toString(),
            this.config.lockoutDurationMinutes * 60
          );
          return {
            allowed: false,
            remainingAttempts: 0,
            resetTime: now + lockoutMs,
            retryAfter: this.config.lockoutDurationMinutes * 60,
            message: 'Email rate limit exceeded - account locked',
            distributed: true,
          };
        }

        if (newIpCount >= this.config.maxAttemptsPerIP) {
          await this.cluster.set(
            `${ipKey}:lockout`,
            (now + lockoutMs).toString(),
            this.config.lockoutDurationMinutes * 60
          );
          return {
            allowed: false,
            remainingAttempts: 0,
            resetTime: now + lockoutMs,
            retryAfter: this.config.lockoutDurationMinutes * 60,
            message: 'IP rate limit exceeded - IP blocked',
            distributed: true,
          };
        }

        return {
          allowed: true,
          remainingAttempts: Math.min(
            this.config.maxAttemptsPerEmail - newEmailCount,
            this.config.maxAttemptsPerIP - newIpCount
          ),
          resetTime: now + windowMs,
          distributed: true,
        };
      }

      // Check current limits
      if (
        emailCount >= this.config.maxAttemptsPerEmail ||
        ipCount >= this.config.maxAttemptsPerIP
      ) {
        return {
          allowed: false,
          remainingAttempts: 0,
          resetTime: now + windowMs,
          retryAfter: Math.ceil(windowMs / 1000),
          message: 'Rate limit exceeded',
          distributed: true,
        };
      }

      return {
        allowed: true,
        remainingAttempts: Math.min(
          this.config.maxAttemptsPerEmail - emailCount,
          this.config.maxAttemptsPerIP - ipCount
        ),
        resetTime: now + windowMs,
        distributed: true,
      };
    } catch (error) {
      console.error('Distributed rate limiting failed:', error);

      // Fallback to basic rate limiting
      return {
        allowed: true,
        remainingAttempts: this.config.maxAttemptsPerEmail,
        resetTime: now + windowMs,
        distributed: false,
      };
    }
  }

  async getClusterHealth(): Promise<{
    healthy: boolean;
    info: any;
    fallbackActive: boolean;
  }> {
    const info = this.cluster.getClusterInfo();
    return {
      healthy: info.connected,
      info,
      fallbackActive: info.fallbackActive,
    };
  }

  async disconnect(): Promise<void> {
    await this.cluster.disconnect();
  }
}

// Export singleton instance
let distributedRateLimiter: DistributedRateLimiter | null = null;

export async function getDistributedRateLimiter(): Promise<DistributedRateLimiter> {
  if (!distributedRateLimiter) {
    const config = {
      maxAttemptsPerEmail: parseInt(
        Deno.env.get('RATE_LIMIT_MAX_EMAIL') || '5'
      ),
      maxAttemptsPerIP: parseInt(Deno.env.get('RATE_LIMIT_MAX_IP') || '10'),
      windowSizeMinutes: parseInt(Deno.env.get('RATE_LIMIT_WINDOW') || '15'),
      lockoutDurationMinutes: parseInt(
        Deno.env.get('RATE_LIMIT_LOCKOUT') || '30'
      ),
      progressiveDelaySeconds: parseInt(
        Deno.env.get('RATE_LIMIT_DELAY') || '60'
      ),
    };

    distributedRateLimiter = new DistributedRateLimiter(config);
    await distributedRateLimiter.initialize();
  }

  return distributedRateLimiter;
}
