import { logger } from '../../utils/_core/logger';

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
  usagePercentage: number;
  timestamp: Date;
}

export interface MemoryThresholds {
  warning: number; // MB
  critical: number; // MB
  max: number; // MB
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly thresholds: MemoryThresholds = {
    warning: 100, // 100MB
    critical: 200, // 200MB
    max: 500, // 500MB
  };

  private constructor() {}

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, intervalMs);

    logger.info('Memory monitoring started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Memory monitoring stopped');
    }
  }

  getMemoryStats(): MemoryStats {
    // Browser environment - return mock stats
    if (typeof process === 'undefined') {
      return {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        arrayBuffers: 0,
        usagePercentage: 0,
        timestamp: new Date(),
      };
    }

    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const usagePercentage = (heapUsedMB / heapTotalMB) * 100;

    return {
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      external: usage.external / 1024 / 1024,
      rss: usage.rss / 1024 / 1024,
      arrayBuffers: usage.arrayBuffers / 1024 / 1024,
      usagePercentage,
      timestamp: new Date(),
    };
  }

  private checkMemoryUsage(): void {
    const stats = this.getMemoryStats();
    const heapUsedMB = stats.heapUsed;

    if (heapUsedMB >= this.thresholds.max) {
      logger.error(
        `CRITICAL: Memory usage exceeded maximum threshold: ${heapUsedMB.toFixed(2)}MB`
      );
      this.triggerGarbageCollection();
    } else if (heapUsedMB >= this.thresholds.critical) {
      logger.warn(`CRITICAL: Memory usage is high: ${heapUsedMB.toFixed(2)}MB`);
      this.triggerGarbageCollection();
    } else if (heapUsedMB >= this.thresholds.warning) {
      logger.warn(
        `WARNING: Memory usage is elevated: ${heapUsedMB.toFixed(2)}MB`
      );
    }

    // Log memory stats every 5 minutes
    if (stats.timestamp.getMinutes() % 5 === 0) {
      logger.info('Memory stats:', {
        heapUsed: `${heapUsedMB.toFixed(2)}MB`,
        heapTotal: `${stats.heapTotal.toFixed(2)}MB`,
        rss: `${stats.rss.toFixed(2)}MB`,
        usagePercentage: `${stats.usagePercentage.toFixed(1)}%`,
      });
    }
  }

  private triggerGarbageCollection(): void {
    try {
      // Only available in Node.js with --expose-gc flag
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
        logger.info('Garbage collection triggered');
      } else {
        logger.warn('Garbage collection not available (run with --expose-gc)');
      }
    } catch (error) {
      logger.error('Error triggering garbage collection:', error);
    }
  }

  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds.warning = thresholds.warning ?? this.thresholds.warning;
    this.thresholds.critical = thresholds.critical ?? this.thresholds.critical;
    this.thresholds.max = thresholds.max ?? this.thresholds.max;
  }

  getThresholds(): MemoryThresholds {
    return { ...this.thresholds };
  }

  // Force cleanup of various caches and subscriptions
  async performCleanup(): Promise<void> {
    try {
      logger.info('Performing memory cleanup...');

      // Import and cleanup subscription manager
      const { subscriptionManager } = await import(
        '../realtime/SubscriptionManager'
      );
      subscriptionManager.forceCleanup();

      // Import and cleanup facility cache
      const { distributedFacilityCache } = await import(
        '../cache/DistributedFacilityCache'
      );
      distributedFacilityCache.cleanup();

      // Trigger garbage collection
      this.triggerGarbageCollection();

      logger.info('Memory cleanup completed');
    } catch (error) {
      logger.error('Error during memory cleanup:', error);
    }
  }

  // Get memory health status
  getHealthStatus(): 'healthy' | 'warning' | 'critical' | 'critical-max' {
    const stats = this.getMemoryStats();
    const heapUsedMB = stats.heapUsed;

    if (heapUsedMB >= this.thresholds.max) {
      return 'critical-max';
    } else if (heapUsedMB >= this.thresholds.critical) {
      return 'critical';
    } else if (heapUsedMB >= this.thresholds.warning) {
      return 'warning';
    }

    return 'healthy';
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();
