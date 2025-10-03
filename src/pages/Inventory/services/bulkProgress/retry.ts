import { OptimizedRetryService } from '@/services/retry/OptimizedRetryService';

export class RetryService {
  /**
   * Optimized retry wrapper for operations
   * Use this to handle transient failures with improved performance
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 100, // Reduced from 1000ms
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    const result = await OptimizedRetryService.executeWithRetry(operation, {
      maxRetries,
      baseDelay: delay,
      backoffStrategy: 'linear', // Use linear instead of exponential
      retryCondition: (error) => {
        // Call the onRetry callback
        onRetry?.(result.attempts, error);
        return true; // Retry all errors by default
      },
    });

    if (!result.success) {
      throw result.error!;
    }

    return result.data!;
  }

  /**
   * Utility function to add delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Process items with retry support
   */
  static async processItemsWithRetry<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    retryConfig: {
      maxRetries?: number;
      delay?: number;
      enableRetry?: boolean;
    } = {}
  ): Promise<{ results: R[]; failed: T[]; errors: string[] }> {
    const { maxRetries = 3, delay = 1000, enableRetry = true } = retryConfig;

    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];

    const operationPromises = items.map(async (item, index) => {
      try {
        let result: R;

        if (enableRetry) {
          result = await this.withRetry(
            () => operation(item),
            maxRetries,
            delay,
            (attempt, error) => {
              console.warn(
                `Retrying item ${index + 1} (attempt ${attempt}): ${error.message}`
              );
            }
          );
        } else {
          result = await operation(item);
        }

        results.push(result);
        return { success: true, result, item };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Item ${index + 1}: ${errorMessage}`);
        failed.push(item);
        return { success: false, error: errorMessage, item };
      }
    });

    await Promise.allSettled(operationPromises);

    return { results, failed, errors };
  }
}
