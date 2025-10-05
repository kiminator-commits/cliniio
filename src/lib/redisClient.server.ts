// Server-only Redis client - this file should never be imported in browser
import { logger } from '../utils/_core/logger';

let createClient: ((config: unknown) => unknown) | null = null;

// Initialize Redis client for server environments only
const initializeRedisClient = async (): Promise<void> => {
  try {
    const redisModule = await import('redis');
    createClient = redisModule.createClient;
  } catch {
    // Redis package not available
    logger.warn('Redis package not available');
  }
};

// Initialize immediately
initializeRedisClient();

export { createClient };
