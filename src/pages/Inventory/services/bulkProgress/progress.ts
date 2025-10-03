import { BulkProgress, BulkProgressCallback } from './types';
import { PerformanceMetricsService } from './performance';

export class ProgressTrackingService {
  /**
   * Create progress object for current state
   */
  static createProgress(
    total: number,
    completed: number,
    failed: number,
    inProgress: number,
    currentBatch: number,
    totalBatches: number,
    startTime: number,
    maxConcurrentWorkers: number
  ): BulkProgress {
    const currentMemoryUsage = PerformanceMetricsService.getMemoryUsage();
    const processingRate = PerformanceMetricsService.calculateProcessingRate(
      startTime,
      completed
    );
    const estimatedTimeRemaining =
      PerformanceMetricsService.calculateEstimatedTime(
        startTime,
        completed,
        total
      );

    return {
      total,
      completed,
      failed,
      inProgress,
      percentage: Math.round((completed / total) * 100),
      currentBatch,
      totalBatches,
      estimatedTimeRemaining,
      errors: [], // Will be populated by caller
      memoryUsage: currentMemoryUsage,
      processingRate,
      concurrentWorkers: maxConcurrentWorkers,
    };
  }

  /**
   * Update progress with errors
   */
  static updateProgressWithErrors(
    progress: BulkProgress,
    errors: string[]
  ): BulkProgress {
    return {
      ...progress,
      errors: errors.slice(-10), // Keep last 10 errors
    };
  }

  /**
   * Notify progress callback if provided
   */
  static notifyProgress(
    onProgress: BulkProgressCallback | undefined,
    progress: BulkProgress
  ): void {
    onProgress?.(progress);
  }

  /**
   * Notify error callback if provided
   */
  static notifyError(
    onError: ((error: string, itemId: string) => void) | undefined,
    error: string,
    itemId: string
  ): void {
    onError?.(error, itemId);
  }

  /**
   * Notify success callback if provided
   */
  static notifySuccess(
    onSuccess: ((result: unknown, itemId: string) => void) | undefined,
    result: unknown,
    itemId: string
  ): void {
    onSuccess?.(result, itemId);
  }

  /**
   * Notify memory warning callback if provided
   */
  static notifyMemoryWarning(
    onMemoryWarning: ((usage: number, limit: number) => void) | undefined,
    usage: number,
    limit: number
  ): void {
    onMemoryWarning?.(usage, limit);
  }

  /**
   * Check if memory usage exceeds warning threshold
   */
  static isMemoryUsageHigh(
    currentUsage: number,
    memoryLimit: number,
    threshold: number = 0.8
  ): boolean {
    return currentUsage > memoryLimit * threshold;
  }
}
