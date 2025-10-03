import { PerformanceMetrics } from './types';

export class PerformanceMetricsService {
  private static performanceMetrics: Map<string, PerformanceMetrics> =
    new Map();
  private static memoryUsageHistory: number[] = [];

  /**
   * Initialize performance metrics for an operation
   */
  static initializeMetrics(
    operationId: string,
    config: { totalItems: number; maxConcurrentWorkers: number }
  ): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      startTime: Date.now(),
      totalItems: config.totalItems,
      processedItems: 0,
      failedItems: 0,
      averageProcessingTime: 0,
      peakMemoryUsage: 0,
      averageMemoryUsage: 0,
      processingRate: 0,
      cacheHitRate: 0,
      concurrentWorkers: config.maxConcurrentWorkers,
    };

    this.performanceMetrics.set(operationId, metrics);
    return metrics;
  }

  /**
   * Update metrics during operation
   */
  static updateMetrics(
    operationId: string,
    updates: Partial<PerformanceMetrics>
  ): void {
    const metrics = this.performanceMetrics.get(operationId);
    if (metrics) {
      Object.assign(metrics, updates);
      this.performanceMetrics.set(operationId, metrics);
    }
  }

  /**
   * Finalize metrics for an operation
   */
  static finalizeMetrics(operationId: string): PerformanceMetrics | undefined {
    const metrics = this.performanceMetrics.get(operationId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.averageProcessingTime =
        metrics.processedItems > 0
          ? (metrics.endTime - metrics.startTime) / metrics.processedItems
          : 0;
      metrics.peakMemoryUsage = Math.max(...this.memoryUsageHistory);
      metrics.averageMemoryUsage =
        this.memoryUsageHistory.length > 0
          ? this.memoryUsageHistory.reduce((a, b) => a + b, 0) /
            this.memoryUsageHistory.length
          : 0;
      metrics.processingRate = this.calculateProcessingRate(
        metrics.startTime,
        metrics.processedItems
      );
      metrics.cacheHitRate = this.calculateCacheHitRate();

      this.performanceMetrics.set(operationId, metrics);
    }
    return metrics;
  }

  /**
   * Get performance metrics for an operation
   */
  static getPerformanceMetrics(
    operationId: string
  ): PerformanceMetrics | undefined {
    return this.performanceMetrics.get(operationId);
  }

  /**
   * Get all performance metrics
   */
  static getAllPerformanceMetrics(): PerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values());
  }

  /**
   * Clear performance metrics
   */
  static clearPerformanceMetrics(): void {
    this.performanceMetrics.clear();
  }

  /**
   * Get current memory usage and track history
   */
  static getMemoryUsage(): number {
    if (
      typeof performance !== 'undefined' &&
      'memory' in performance &&
      (performance as { memory?: { usedJSHeapSize: number } }).memory
    ) {
      const memory = (performance as { memory: { usedJSHeapSize: number } })
        .memory;
      const usage = memory?.usedJSHeapSize || 0;
      this.memoryUsageHistory.push(usage);
      return usage;
    }
    return 0;
  }

  /**
   * Calculate processing rate (items per second)
   */
  static calculateProcessingRate(startTime: number, completed: number): number {
    if (completed === 0) return 0;
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    return Math.round(completed / elapsed);
  }

  /**
   * Calculate cache hit rate
   */
  static calculateCacheHitRate(): number {
    // This would need to be implemented with cache hit tracking
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate estimated time remaining
   */
  static calculateEstimatedTime(
    startTime: number,
    completed: number,
    total: number
  ): number | undefined {
    if (completed === 0) return undefined;

    const elapsed = Date.now() - startTime;
    const rate = completed / elapsed; // items per millisecond
    const remaining = total - completed;

    return Math.round(remaining / rate);
  }

  /**
   * Clear memory usage history
   */
  static clearMemoryHistory(): void {
    this.memoryUsageHistory = [];
  }

  /**
   * Generate unique operation ID
   */
  static generateOperationId(): string {
    return `bulk-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
