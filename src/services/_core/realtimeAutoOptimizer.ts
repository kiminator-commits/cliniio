import { RealtimeOptimizer } from './realtimeOptimizer';
import { RealtimeManager } from './realtimeManager';
import { logger } from '../../utils/_core/logger';

/**
 * CRITICAL: Auto-starts realtime optimization to prevent database overload
 * This service automatically initializes when imported and ensures
 * realtime subscriptions are kept under control.
 */
export class RealtimeAutoOptimizer {
  private static isInitialized = false;
  private static initializationTimeout: NodeJS.Timeout | null = null;

  /**
   * CRITICAL: Immediate nuclear cleanup on initialization
   */
  static immediateNuclearCleanup() {
    logger.realtime(
      '☢️ IMMEDIATE NUCLEAR CLEANUP - Force disconnecting all existing connections'
    );

    try {
      // Call nuclear cleanup immediately
      RealtimeManager.nuclearCleanup();

      logger.realtime('☢️ Immediate nuclear cleanup completed');
    } catch (error) {
      logger.error('❌ Immediate nuclear cleanup failed:', error);
    }
  }

  /**
   * Initialize the auto-optimizer
   */
  static initialize() {
    if (this.isInitialized) {
      logger.realtime('🔄 RealtimeAutoOptimizer already initialized');
      return;
    }

    logger.realtime('🚀 RealtimeAutoOptimizer: Initializing...');

    // Clear any existing timeout
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
    }

    // Start optimization after a short delay to allow app to initialize
    this.initializationTimeout = setTimeout(() => {
      try {
        logger.realtime(
          '🚀 RealtimeAutoOptimizer: Starting CRITICAL optimization...'
        );
        RealtimeOptimizer.startOptimization();
        this.isInitialized = true;

        // Schedule periodic health checks
        this.scheduleHealthChecks();

        logger.realtime('✅ RealtimeAutoOptimizer: Initialization complete');
      } catch (error) {
        logger.error('❌ RealtimeAutoOptimizer: Failed to initialize:', error);
        // Retry after 10 seconds
        setTimeout(() => this.initialize(), 10000);
      }
    }, 3000); // 3 second delay
  }

  /**
   * Schedule periodic health checks
   */
  private static scheduleHealthChecks() {
    // Check every 30 seconds
    setInterval(() => {
      try {
        const status = RealtimeOptimizer.getStatus();

        if (!status.isRunning) {
          logger.realtime(
            '🚨 RealtimeAutoOptimizer: Optimization stopped, restarting...'
          );
          RealtimeOptimizer.startOptimization();
        }
      } catch (error) {
        logger.error('❌ RealtimeAutoOptimizer: Health check failed:', error);
      }
    }, 30000);
  }

  /**
   * Force restart optimization
   */
  static forceRestart() {
    logger.realtime(
      '🚨 RealtimeAutoOptimizer: Force restarting optimization...'
    );
    this.isInitialized = false;
    RealtimeOptimizer.stopOptimization();

    // Restart after a short delay
    setTimeout(() => {
      this.initialize();
    }, 1000);
  }

  /**
   * Get initialization status
   */
  static getStatus() {
    return {
      isInitialized: this.isInitialized,
      optimizationStatus: RealtimeOptimizer.getStatus(),
    };
  }
}

// CRITICAL: Auto-initialize when this module is imported
RealtimeAutoOptimizer.initialize();

// CRITICAL: Immediate nuclear cleanup to force-disconnect existing connections
setTimeout(() => {
  RealtimeAutoOptimizer.immediateNuclearCleanup();
}, 1000); // 1 second delay to ensure imports are ready
