export interface MemoryStats {
  current: number;
  limit?: number;
}

export class MemoryTrackingService {
  private static readonly DEFAULT_MAX_MEMORY = 50 * 1024 * 1024; // 50MB

  /**
   * Get current memory usage
   */
  static getMemoryUsage(): number {
    if (
      typeof performance !== 'undefined' &&
      'memory' in performance &&
      (
        performance as {
          memory?: { usedJSHeapSize: number; jsHeapSizeLimit?: number };
        }
      ).memory
    ) {
      const memory = (
        performance as {
          memory: { usedJSHeapSize: number; jsHeapSizeLimit?: number };
        }
      ).memory;
      return memory?.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats(): MemoryStats {
    const current = this.getMemoryUsage();
    let limit: number | undefined;

    if (
      typeof performance !== 'undefined' &&
      'memory' in performance &&
      (
        performance as {
          memory?: { usedJSHeapSize: number; jsHeapSizeLimit?: number };
        }
      ).memory
    ) {
      const memory = (
        performance as {
          memory: { usedJSHeapSize: number; jsHeapSizeLimit?: number };
        }
      ).memory;
      limit = memory?.jsHeapSizeLimit;
    }

    return { current, limit };
  }

  /**
   * Check if memory usage exceeds threshold
   */
  static isMemoryUsageHigh(maxMemoryUsage?: number): boolean {
    const currentUsage = this.getMemoryUsage();
    const threshold = maxMemoryUsage || this.DEFAULT_MAX_MEMORY;
    return currentUsage > threshold;
  }

  /**
   * Force garbage collection if available
   */
  static forceGarbageCollection(): void {
    if (
      typeof window !== 'undefined' &&
      'gc' in window &&
      typeof (window as { gc?: () => void }).gc === 'function'
    ) {
      (window as { gc: () => void }).gc();
    }
  }

  /**
   * Get default max memory usage
   */
  static getDefaultMaxMemory(): number {
    return this.DEFAULT_MAX_MEMORY;
  }
}
