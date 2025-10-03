import { BulkOperationConfig, BulkProgress, PerformanceMetrics } from './types';

// Re-export types for external use
export type { BulkOperationConfig, BulkProgress, PerformanceMetrics };
import { PerformanceMetricsService } from './performance';
import { OperationCacheService } from './caching';
import { WorkerPoolService } from './workerPool';
import { ProgressTrackingService } from './progress';
import { RetryService } from './retry';
import { BulkOperationValidationService } from './validation';
import { ProgressFormatterService } from './formatter';

/**
 * Service for handling bulk operation progress tracking and batch processing
 * Enhanced with performance optimizations and modular architecture
 */
export class InventoryBulkProgressService {
  private static readonly DEFAULT_BATCH_SIZE = 50;
  private static readonly DEFAULT_DELAY = 100; // ms
  private static readonly DEFAULT_MAX_WORKERS = 4;
  private static readonly DEFAULT_CACHE_SIZE = 1000;
  private static readonly DEFAULT_MEMORY_LIMIT = 100 * 1024 * 1024; // 100MB
  private static readonly MEMORY_WARNING_THRESHOLD = 0.8; // 80%

  /**
   * Process items in batches with progress tracking and performance optimizations
   */
  static async processBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    config: BulkOperationConfig = {}
  ): Promise<{
    results: R[];
    failed: T[];
    errors: string[];
    metrics: PerformanceMetrics;
  }> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      delayBetweenBatches = this.DEFAULT_DELAY,
      maxConcurrentWorkers = this.DEFAULT_MAX_WORKERS,
      enableCaching = true,
      cacheSize = this.DEFAULT_CACHE_SIZE,
      memoryLimit = this.DEFAULT_MEMORY_LIMIT,
      onProgress,
      onError,
      onSuccess,
      onMemoryWarning,
    } = config;

    // Validate inputs
    const itemsValidation = BulkOperationValidationService.validateItems(items);
    if (!itemsValidation.isValid) {
      throw new Error(itemsValidation.errors.join(', '));
    }

    const configValidation =
      BulkOperationValidationService.validateConfig(config);
    if (!configValidation.isValid) {
      throw new Error(configValidation.errors.join(', '));
    }

    const operationValidation =
      BulkOperationValidationService.validateOperation(operation);
    if (!operationValidation.isValid) {
      throw new Error(operationValidation.errors.join(', '));
    }

    // Initialize performance metrics
    const operationId = PerformanceMetricsService.generateOperationId();
    const metrics = PerformanceMetricsService.initializeMetrics(operationId, {
      totalItems: items.length,
      maxConcurrentWorkers,
    });

    // Initialize cache if enabled
    if (enableCaching) {
      OperationCacheService.initializeCache(cacheSize);
    }

    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    const startTime = Date.now();

    // Create worker pool for concurrent processing
    const workerPool = WorkerPoolService.createWorkerPool(maxConcurrentWorkers);

    try {
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        // Check memory usage and warn if necessary
        const currentMemoryUsage = PerformanceMetricsService.getMemoryUsage();
        if (
          ProgressTrackingService.isMemoryUsageHigh(
            currentMemoryUsage,
            memoryLimit,
            this.MEMORY_WARNING_THRESHOLD
          )
        ) {
          ProgressTrackingService.notifyMemoryWarning(
            onMemoryWarning,
            currentMemoryUsage,
            memoryLimit
          );
        }

        const batchStart = batchIndex * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, items.length);
        const batch = items.slice(batchStart, batchEnd);

        // Process batch with concurrent workers
        await WorkerPoolService.processBatchConcurrent(
          batch,
          operation,
          workerPool,
          enableCaching,
          {
            onError: (error, item) => {
              errors.push(`Item ${batch.indexOf(item) + 1}: ${error}`);
              failed.push(item);
              PerformanceMetricsService.updateMetrics(operationId, {
                failedItems: metrics.failedItems + 1,
              });
              ProgressTrackingService.notifyError(
                onError,
                error,
                ((item as Record<string, unknown>).id as string) || 'unknown'
              );
            },
            onSuccess: (result, item) => {
              results.push(result);
              PerformanceMetricsService.updateMetrics(operationId, {
                processedItems: metrics.processedItems + 1,
              });
              ProgressTrackingService.notifySuccess(
                onSuccess,
                result,
                ((item as Record<string, unknown>).id as string) || 'unknown'
              );
            },
          }
        );

        // Update progress with enhanced metrics
        const completed = results.length;
        const failedCount = failed.length;
        const inProgress = batch.length;
        const total = items.length;

        const progress = ProgressTrackingService.createProgress(
          total,
          completed,
          failedCount,
          inProgress,
          batchIndex + 1,
          totalBatches,
          startTime,
          maxConcurrentWorkers
        );

        const progressWithErrors =
          ProgressTrackingService.updateProgressWithErrors(progress, errors);
        ProgressTrackingService.notifyProgress(onProgress, progressWithErrors);

        // Add delay between batches (except for the last batch)
        if (batchIndex < totalBatches - 1 && delayBetweenBatches > 0) {
          await RetryService.delay(delayBetweenBatches);
        }
      }

      // Finalize metrics
      PerformanceMetricsService.finalizeMetrics(operationId);

      return {
        results,
        failed,
        errors,
        metrics: PerformanceMetricsService.getPerformanceMetrics(operationId)!,
      };
    } finally {
      // Cleanup
      WorkerPoolService.cleanupWorkerPool(workerPool);
      OperationCacheService.clearCache();
      PerformanceMetricsService.clearMemoryHistory();
    }
  }

  /**
   * Simple wrapper for basic bulk operations with Promise.allSettled
   * Use this for simple operations that don't need advanced progress tracking
   */
  static async simpleBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>
  ): Promise<{ results: R[]; failed: T[]; errors: string[] }> {
    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];

    const operationPromises = items.map(async (item, index) => {
      try {
        const result = await operation(item);
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

  /**
   * Enhanced simple bulk operation with retry support
   * Use this for basic operations that need retry capability
   */
  static async simpleBulkOperationWithRetry<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    retryConfig?: {
      maxRetries?: number;
      delay?: number;
      enableRetry?: boolean;
    }
  ): Promise<{ results: R[]; failed: T[]; errors: string[] }> {
    return RetryService.processItemsWithRetry(items, operation, retryConfig);
  }

  /**
   * Standardized bulk operation with consistent error handling
   * Use this for operations that need progress tracking but not advanced features
   */
  static async standardBulkOperation<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ results: R[]; failed: T[]; errors: string[] }> {
    const results: R[] = [];
    const failed: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const result = await operation(items[i]);
        results.push(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Item ${i + 1}: ${errorMessage}`);
        failed.push(items[i]);
      }

      onProgress?.(i + 1, items.length);
    }

    return { results, failed, errors };
  }

  /**
   * Validate bulk operation configuration
   */
  static validateConfig(config: BulkOperationConfig): {
    isValid: boolean;
    errors: string[];
  } {
    return BulkOperationValidationService.validateConfig(config);
  }

  /**
   * Create a progress formatter for UI display
   */
  static formatProgress(progress: BulkProgress): {
    status: string;
    details: string;
    timeRemaining?: string;
    performance?: string;
  } {
    return ProgressFormatterService.formatProgress(progress);
  }

  /**
   * Get performance metrics for an operation
   */
  static getPerformanceMetrics(
    operationId: string
  ): PerformanceMetrics | undefined {
    return PerformanceMetricsService.getPerformanceMetrics(operationId);
  }

  /**
   * Get all performance metrics
   */
  static getAllPerformanceMetrics(): PerformanceMetrics[] {
    return PerformanceMetricsService.getAllPerformanceMetrics();
  }

  /**
   * Clear performance metrics
   */
  static clearPerformanceMetrics(): void {
    PerformanceMetricsService.clearPerformanceMetrics();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; hitRate: number } {
    return OperationCacheService.getCacheStats();
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    OperationCacheService.clearCache();
  }

  /**
   * Get default batch size
   */
  static getDefaultBatchSize(): number {
    return this.DEFAULT_BATCH_SIZE;
  }

  /**
   * Get default delay
   */
  static getDefaultDelay(): number {
    return this.DEFAULT_DELAY;
  }

  /**
   * Get default max workers
   */
  static getDefaultMaxWorkers(): number {
    return this.DEFAULT_MAX_WORKERS;
  }

  /**
   * Get default cache size
   */
  static getDefaultCacheSize(): number {
    return this.DEFAULT_CACHE_SIZE;
  }

  /**
   * Get default memory limit
   */
  static getDefaultMemoryLimit(): number {
    return this.DEFAULT_MEMORY_LIMIT;
  }
}
