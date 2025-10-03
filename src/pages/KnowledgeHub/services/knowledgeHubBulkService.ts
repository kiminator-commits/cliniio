/**
 * Standardized bulk operations service for Knowledge Hub
 * Provides consistent patterns for bulk operations across the application
 */

export interface BulkOperationResult<T = unknown> {
  results: T[];
  failed: unknown[];
  errors: string[];
  successCount: number;
  failureCount: number;
  totalCount: number;
}

export interface BulkOperationConfig {
  onProgress?: (completed: number, total: number) => void;
  onError?: (error: string, item: unknown) => void;
  onSuccess?: (result: unknown, item: unknown) => void;
  retryConfig?: {
    maxRetries?: number;
    delay?: number;
    enableRetry?: boolean;
  };
}

export class KnowledgeHubBulkService {
  /**
   * Simple retry wrapper for operations
   * Use this to handle transient failures
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onRetry?.(i + 1, error as Error);

        console.warn(
          `Operation failed (attempt ${i + 1}/${maxRetries}): ${errorMessage}. Retrying in ${delay * (i + 1)}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Simple bulk operation with Promise.allSettled
   * Use this for basic operations that don't need advanced progress tracking
   */
  static async simpleBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    config?: BulkOperationConfig
  ): Promise<BulkOperationResult<R>> {
    const { retryConfig } = config || {};
    const {
      maxRetries = 3,
      delay = 1000,
      enableRetry = true,
    } = retryConfig || {};

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
        config?.onSuccess?.(result, item);
        return { success: true, result, item };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Item ${index + 1}: ${errorMessage}`);
        failed.push(item);
        config?.onError?.(errorMessage, item);
        return { success: false, error: errorMessage, item };
      }
    });

    await Promise.allSettled(operationPromises);

    return {
      results,
      failed,
      errors,
      successCount: results.length,
      failureCount: failed.length,
      totalCount: items.length,
    };
  }

  /**
   * Standardized bulk operation with progress tracking
   * Use this for operations that need progress tracking but not advanced features
   */
  static async standardBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    config?: BulkOperationConfig
  ): Promise<BulkOperationResult<R>> {
    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const result = await operation(items[i]);
        results.push(result);
        config?.onSuccess?.(result, items[i]);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Item ${i + 1}: ${errorMessage}`);
        failed.push(items[i]);
        config?.onError?.(errorMessage, items[i]);
      }

      config?.onProgress?.(i + 1, items.length);
    }

    return {
      results,
      failed,
      errors,
      successCount: results.length,
      failureCount: failed.length,
      totalCount: items.length,
    };
  }

  /**
   * Transaction-like bulk operation for mixed content types
   * Use this for operations that need to maintain consistency across different content types
   */
  static async transactionBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    config?: BulkOperationConfig
  ): Promise<BulkOperationResult<R>> {
    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];

    // Execute operations concurrently for better performance
    const operationPromises = items.map(async (item, index) => {
      try {
        const result = await operation(item);
        return { success: true, result, item, index };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage, item, index };
      }
    });

    const operationResults = await Promise.allSettled(operationPromises);

    // Process results and handle any failures
    operationResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          if (result.value.result) {
            results.push(result.value.result);
          }
        } else if (result.value.error) {
          errors.push(result.value.error);
          config?.onError?.(result.value.error, result.value.item);
        }
      } else {
        const errorMessage =
          result.reason instanceof Error
            ? result.reason.message
            : 'Operation failed';
        errors.push(`Item ${index + 1}: ${errorMessage}`);
        failed.push(items[index]);
        config?.onError?.(errorMessage, items[index]);
      }

      config?.onProgress?.(index + 1, items.length);
    });

    return {
      results,
      failed,
      errors,
      successCount: results.length,
      failureCount: failed.length,
      totalCount: items.length,
    };
  }
}
