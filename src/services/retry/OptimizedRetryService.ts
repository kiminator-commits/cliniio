import { performanceMonitor } from '../monitoring/PerformanceMonitor';
import { RETRY_PRESETS } from '../../constants/retryConfig';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

/**
 * Optimized retry service with configurable strategies
 * Replaces exponential backoff with more efficient linear backoff for better performance
 */
export class OptimizedRetryService {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 100, // Reduced from 1000ms
    maxDelay: 1000, // Cap maximum delay
    backoffStrategy: 'linear', // Use linear instead of exponential
    jitter: true,
  };

  /**
   * Execute operation with optimized retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const startTime = performance.now();
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: Error;
    let attempts = 0;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      attempts = attempt + 1;

      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        // Record successful operation
        performanceMonitor.recordResponseTime(
          'retry_operation_success',
          duration,
          {
            service: 'OptimizedRetryService',
            operation: 'executeWithRetry',
            attempts: attempts.toString(),
            strategy: finalConfig.backoffStrategy,
          }
        );

        return {
          success: true,
          data: result,
          attempts,
          totalDuration: duration,
        };
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry this error
        if (
          attempt === finalConfig.maxRetries ||
          (finalConfig.retryCondition && !finalConfig.retryCondition(lastError))
        ) {
          break;
        }

        // Calculate delay based on strategy
        const delay = this.calculateDelay(attempt, finalConfig);

        // Add jitter to prevent thundering herd
        const jitteredDelay = finalConfig.jitter
          ? delay + Math.random() * 100
          : delay;

        console.warn(
          `[OptimizedRetryService] Operation failed (attempt ${attempts}/${finalConfig.maxRetries + 1}): ${lastError.message}. Retrying in ${jitteredDelay.toFixed(0)}ms...`
        );

        await this.sleep(jitteredDelay);
      }
    }

    const duration = performance.now() - startTime;

    // Record failed operation
    performanceMonitor.recordErrorRate('retry_operation_failure', 100, {
      service: 'OptimizedRetryService',
      operation: 'executeWithRetry',
      attempts: attempts.toString(),
      strategy: finalConfig.backoffStrategy,
      error: lastError.message,
    });

    return {
      success: false,
      error: lastError,
      attempts,
      totalDuration: duration,
    };
  }

  /**
   * Calculate delay based on strategy
   */
  private static calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.backoffStrategy) {
      case 'linear':
        delay = config.baseDelay * (attempt + 1);
        break;
      case 'exponential':
        delay = config.baseDelay * Math.pow(2, attempt);
        break;
      case 'fixed':
        delay = config.baseDelay;
        break;
      default:
        delay = config.baseDelay;
    }

    // Cap the maximum delay
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Sleep utility
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Quick retry for simple operations (1 retry, 100ms delay)
   */
  static async quickRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.executeWithRetry(
      operation,
      RETRY_PRESETS.UI_OPERATION
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  /**
   * Standard retry for most operations (3 retries, linear backoff)
   */
  static async standardRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.executeWithRetry(
      operation,
      RETRY_PRESETS.DATA_FETCH
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  /**
   * Network retry for network operations (5 retries, exponential backoff)
   */
  static async networkRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.executeWithRetry(
      operation,
      RETRY_PRESETS.API_CALL
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  /**
   * Authentication retry for auth operations
   */
  static async authRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.executeWithRetry(operation, RETRY_PRESETS.AUTH);

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }

  /**
   * Background retry for background tasks
   */
  static async backgroundRetry<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.executeWithRetry(
      operation,
      RETRY_PRESETS.BACKGROUND_TASK
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data!;
  }
}

// Export convenience functions
export const quickRetry = OptimizedRetryService.quickRetry;
export const standardRetry = OptimizedRetryService.standardRetry;
export const networkRetry = OptimizedRetryService.networkRetry;
export const authRetry = OptimizedRetryService.authRetry;
export const backgroundRetry = OptimizedRetryService.backgroundRetry;
