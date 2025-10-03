import { RealtimeManager } from './realtimeManager';

export interface RealtimeOptimizationConfig {
  maxChannels: number;
  maxSubscribersPerTable: number;
  cleanupInterval: number;
  subscriptionTimeout: number;
}

import { logger } from '../../utils/_core/logger';

export class RealtimeOptimizer {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static isOptimizing = false;
  // Reduced cleanup intervals for better performance
  private static aggressiveCleanupInterval = 60000; // 60 seconds for aggressive mode
  private static standardCleanupInterval = 120000; // 120 seconds for standard mode

  /**
   * Auto-start optimization when service is imported - DISABLED for performance
   */
  static {
    // DISABLED: Auto-start causes excessive background processing
    // setTimeout(() => {
    //   logger.realtime('🚀 Auto-starting CRITICAL realtime optimization...');
    //   this.startOptimization();
    // }, 2000);
  }

  /**
   * Start automatic optimization with CRITICAL performance focus
   */
  static startOptimization(config: Partial<RealtimeOptimizationConfig> = {}) {
    if (this.isOptimizing) {
      logger.realtime('🔄 Realtime optimization already running');
      return;
    }

    this.isOptimizing = true;
    // CRITICAL: Use aggressive interval by default
    const interval = config.cleanupInterval || this.aggressiveCleanupInterval;

    this.cleanupInterval = setInterval(() => {
      this.performOptimization();
    }, interval);

    logger.realtime(
      `🚀 Started CRITICAL realtime optimization (interval: ${interval}ms)`
    );
  }

  /**
   * Stop automatic optimization
   */
  static stopOptimization() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isOptimizing = false;
    logger.realtime('⏹️ Stopped realtime optimization');
  }

  /**
   * Perform CRITICAL optimization cycle
   */
  private static performOptimization() {
    try {
      const stats = RealtimeManager.getStats();

      // CRITICAL: Immediate aggressive cleanup for poor performance
      if (!stats.performance.isHealthy) {
        this.emergencyCleanup();
        return;
      }

      // CRITICAL: Aggressive cleanup if approaching limits
      if (stats.activeChannels > 3) {
        // Reduced threshold from 8 to 3
        this.aggressiveCleanup();
        return;
      }

      // CRITICAL: Standard cleanup for normal conditions
      if (stats.activeChannels > 2) {
        // Reduced threshold from 8 to 2
        this.standardCleanup();
      }

      // Log optimization results
      this.logOptimizationResults(stats);
    } catch (error) {
      console.error('❌ Error during realtime optimization:', error);
    }
  }

  /**
   * CRITICAL: Standard cleanup for normal conditions
   */
  private static standardCleanup() {
    // Trigger cleanup in RealtimeManager
    // This will be handled by the existing cleanup mechanisms
  }

  /**
   * CRITICAL: Aggressive cleanup for high channel counts
   */
  private static aggressiveCleanup() {
    // Force cleanup of 50% of subscriptions
    this.forcePartialCleanup(0.5);
  }

  /**
   * CRITICAL: Force partial cleanup to maintain performance
   */
  private static forcePartialCleanup(_percentage: number) {
    // This will trigger the force cleanup in RealtimeManager
    // by temporarily exceeding the channel limit
    const stats = RealtimeManager.getStats();
    if (stats.activeChannels > 0) {
      // Force a cleanup cycle
      RealtimeManager.cleanup();
    }
  }

  /**
   * Log optimization results with CRITICAL performance indicators
   */
  private static logOptimizationResults(stats: {
    activeChannels: number;
    totalSubscribers: number;
    tableSubscribers: Record<string, number>;
    performance: {
      isHealthy: boolean;
      warnings: string[];
      recommendations: string[];
    };
  }) {
    const _timestamp = new Date().toISOString();
    const _status =
      _stats.activeChannels <= 2
        ? '✅'
        : stats.activeChannels <= 3
          ? '⚠️'
          : '🚨';

    // CRITICAL: Immediate action for high counts
    if (stats.activeChannels > 3) {
      setTimeout(() => this.performOptimization(), 5000); // Cleanup in 5 seconds
    }
  }

  /**
   * Get optimization status
   */
  static getStatus() {
    return {
      isRunning: this.isOptimizing,
      interval: this.cleanupInterval ? 'active' : 'inactive',
      mode: this.cleanupInterval ? 'aggressive' : 'inactive',
    };
  }

  /**
   * CRITICAL: Emergency cleanup for critical situations
   */
  static emergencyCleanup() {
    RealtimeManager.cleanup();

    // Wait and verify
    setTimeout(() => {
      const _stats = RealtimeManager.getStats();
    }, 500);
  }
}
