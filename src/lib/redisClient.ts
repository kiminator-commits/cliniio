import { logger } from '../utils/_core/logger';

// Define interface for Redis client events
interface RedisClient {
  on: (event: string, callback: (data?: unknown) => void) => void;
  off: (event: string, callback: (data?: unknown) => void) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  get: (key: string) => Promise<string | null>;
  set: (
    key: string,
    value: string,
    options?: { EX?: number }
  ) => Promise<string>;
  del: (key: string) => Promise<number>;
  exists: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
}

// Optional Redis import - will fallback to in-memory if not available
let createClient: ((config: unknown) => RedisClient) | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Initialize Redis client dynamically - only in server environments
const initializeRedisClient = async (): Promise<void> => {
  // Skip Redis initialization in browser environments
  if (isBrowser) {
    return;
  }

  try {
    // Import server-only Redis client
    const { createClient: serverCreateClient } = await import(
      './redisClient.server'
    );
    createClient = serverCreateClient as (config: unknown) => RedisClient;
  } catch {
    // Redis package not available, will use in-memory fallback
    // This is expected in environments without Redis
  }
};

// Only initialize Redis in server environments
if (!isBrowser) {
  initializeRedisClient();
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

class RedisManager {
  private client: RedisClient | null = null;
  private config: RedisConfig;
  private isConnected = false;

  constructor(config: RedisConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    // In browser environments, Redis is not available
    if (isBrowser) {
      logger.warn(
        'Redis not available in browser environment, using in-memory fallback'
      );
      return;
    }

    // Wait for Redis client to be initialized
    if (!createClient) {
      // Wait a bit for the async initialization to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!createClient) {
      logger.warn('Redis not available, using in-memory fallback');
      return;
    }

    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          },
        },
        password: this.config.password,
        database: this.config.db || 0,
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  getClient(): unknown {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  isHealthy(): boolean {
    // In browser environments, Redis is never healthy
    if (isBrowser) {
      return false;
    }
    return this.isConnected && this.client !== null;
  }
}

// Default configuration - can be overridden by environment variables
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

const defaultConfig: RedisConfig = {
  host: getEnvVar('REDIS_HOST', 'localhost'),
  port: parseInt(getEnvVar('REDIS_PORT', '6379')),
  password: getEnvVar('REDIS_PASSWORD', ''),
  db: parseInt(getEnvVar('REDIS_DB', '0')),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

export const redisManager = new RedisManager(defaultConfig);

// Initialize Redis connection
export const initializeRedis = async (): Promise<void> => {
  try {
    await redisManager.connect();
    logger.info('Redis initialized successfully');
  } catch (error) {
    logger.warn(
      'Redis initialization failed, falling back to in-memory cache:',
      error
    );
  }
};

// Graceful shutdown
export const shutdownRedis = async (): Promise<void> => {
  try {
    await redisManager.disconnect();
    logger.info('Redis disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};
