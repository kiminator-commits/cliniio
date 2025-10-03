import { aiRequestQueue } from './AIRequestQueue';
import { aiResponseCache } from './AIResponseCache';
import { aiRequestBatcher } from './AIRequestBatcher';
import { aiMonitoringService } from './AIMonitoringService';
import { aiRateLimiter } from '../rateLimiting/AIRateLimiter';
import { logger } from '../../utils/_core/logger';

export interface AIOperationConfig {
  service: string;
  operation: string;
  priority?: number;
  useCache?: boolean;
  useBatching?: boolean;
  cacheTtl?: number;
  maxRetries?: number;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

export interface AIOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache: boolean;
  responseTime: number;
  metadata?: Record<string, unknown>;
}

export class OptimizedAIService {
  private static instance: OptimizedAIService;

  private constructor() {}

  static getInstance(): OptimizedAIService {
    if (!OptimizedAIService.instance) {
      OptimizedAIService.instance = new OptimizedAIService();
    }
    return OptimizedAIService.instance;
  }

  /**
   * Execute an AI operation with all optimizations
   */
  async execute<T>(
    config: AIOperationConfig,
    operation: () => Promise<T>,
    context?: {
      userId?: string;
      facilityId?: string;
      parameters?: Record<string, unknown>;
    }
  ): Promise<AIOperationResult<T>> {
    const startTime = Date.now();
    let fromCache = false;
    let success = false;
    let data: T | undefined;
    let error: string | undefined;

    try {
      // Check cache first if enabled
      if (config.useCache !== false) {
        const cacheKey = {
          service: config.service,
          operation: config.operation,
          parameters: context?.parameters || {},
          userId: context?.userId,
          facilityId: context?.facilityId,
        };

        const cached = await aiResponseCache.get<T>(cacheKey);
        if (cached !== null) {
          fromCache = true;
          data = cached;
          success = true;

          logger.debug(
            `AI operation served from cache: ${config.service}:${config.operation}`
          );
        }
      }

      // Execute operation if not from cache
      if (!fromCache) {
        if (config.useBatching !== false && (config.priority || 0) < 5) {
          // Use batching for low-priority requests
          data = await aiRequestBatcher.addRequest(operation, {
            priority: config.priority,
            metadata: config.metadata,
          });
        } else {
          // Use queue for high-priority or non-batchable requests
          data = await aiRequestQueue.addRequest(
            config.service,
            context?.userId || 'anonymous',
            operation,
            {
              priority: config.priority,
              maxRetries: config.maxRetries,
              timeout: config.timeout,
              metadata: config.metadata,
            }
          );
        }

        success = true;

        // Cache the result if caching is enabled
        if (config.useCache !== false && data) {
          const cacheKey = {
            service: config.service,
            operation: config.operation,
            parameters: context?.parameters || {},
            userId: context?.userId,
            facilityId: context?.facilityId,
          };

          await aiResponseCache.set(cacheKey, data, {
            ttl: config.cacheTtl,
          });
        }
      }

      // Record metrics
      const responseTime = Date.now() - startTime;
      aiMonitoringService.recordRequest(
        config.service,
        success,
        responseTime,
        fromCache,
        false // rateLimited - would be set by rate limiter
      );

      return {
        success,
        data,
        error,
        fromCache,
        responseTime,
        metadata: config.metadata,
      };
    } catch (err) {
      const responseTime = Date.now() - startTime;
      error = err instanceof Error ? err.message : 'Unknown error';
      success = false;

      // Record metrics
      aiMonitoringService.recordRequest(
        config.service,
        success,
        responseTime,
        fromCache,
        false
      );

      logger.error(
        `AI operation failed: ${config.service}:${config.operation}`,
        err
      );

      return {
        success,
        data,
        error,
        fromCache,
        responseTime,
        metadata: config.metadata,
      };
    }
  }

  /**
   * Execute multiple AI operations in parallel
   */
  async executeBatch<T>(
    operations: Array<{
      config: AIOperationConfig;
      operation: () => Promise<T>;
      context?: {
        userId?: string;
        facilityId?: string;
        parameters?: Record<string, unknown>;
      };
    }>
  ): Promise<AIOperationResult<T>[]> {
    const promises = operations.map(({ config, operation, context }) =>
      this.execute(config, operation, context)
    );

    return Promise.all(promises);
  }

  /**
   * Get AI service statistics
   */
  getStats(): {
    monitoring: unknown;
    queue: unknown;
    cache: unknown;
    batcher: unknown;
    rateLimiter: unknown;
  } {
    return {
      monitoring: aiMonitoringService.getMetrics(),
      queue: aiRequestQueue.getStats(),
      cache: aiResponseCache.getStats(),
      batcher: aiRequestBatcher.getStats(),
      rateLimiter: aiRateLimiter.getConfigs(),
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: unknown;
  } {
    const health = aiMonitoringService.getHealthStatus();
    const metrics = this.getStats();

    return {
      ...health,
      metrics,
    };
  }

  /**
   * Clear all caches and reset metrics
   */
  async reset(): Promise<void> {
    await aiResponseCache.clear();
    aiRequestQueue.clearQueue();
    aiRequestBatcher.clearPending();
    aiMonitoringService.resetMetrics();

    logger.info('AI service reset completed');
  }

  /**
   * Update configuration
   */
  updateConfig(updates: {
    queue?: unknown;
    batcher?: unknown;
    cache?: unknown;
  }): void {
    if (updates.queue) {
      aiRequestQueue.updateConfig(updates.queue);
    }

    if (updates.batcher) {
      aiRequestBatcher.updateConfig(updates.batcher);
    }

    logger.info('AI service configuration updated');
  }

  /**
   * Force process all pending requests
   */
  async forceProcess(): Promise<void> {
    await aiRequestBatcher.forceProcess();
    logger.info('AI service force processing completed');
  }
}

// Singleton instance
export const optimizedAIService = OptimizedAIService.getInstance();
