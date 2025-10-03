import { initializeRedis, shutdownRedis } from '../../lib/redisClient';
import { memoryMonitor } from '../monitoring/MemoryMonitor';
import { subscriptionManager } from '../realtime/SubscriptionManager';
import { distributedFacilityCache } from '../cache/DistributedFacilityCache';
import { logger } from '../../utils/_core/logger';

export interface SystemConfig {
  enableRedis: boolean;
  enableMemoryMonitoring: boolean;
  memoryMonitoringInterval: number;
  memoryThresholds: {
    warning: number;
    critical: number;
    max: number;
  };
}

export class SystemInitializer {
  private static instance: SystemInitializer;
  private isInitialized = false;
  private config: SystemConfig;

  private constructor() {
    const isProduction = import.meta.env.PROD;
    this.config = {
      enableRedis: isProduction,
      enableMemoryMonitoring: true,
      memoryMonitoringInterval: 60000, // 1 minute
      memoryThresholds: {
        warning: 100, // 100MB
        critical: 200, // 200MB
        max: 500, // 500MB
      },
    };
  }

  static getInstance(): SystemInitializer {
    if (!SystemInitializer.instance) {
      SystemInitializer.instance = new SystemInitializer();
    }
    return SystemInitializer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('System already initialized');
      return;
    }

    try {
      logger.info('Initializing system services...');

      // Initialize Redis if enabled
      if (this.config.enableRedis) {
        await this.initializeRedis();
      } else {
        logger.info('Redis disabled, using in-memory fallback');
      }

      // Initialize memory monitoring
      if (this.config.enableMemoryMonitoring) {
        this.initializeMemoryMonitoring();
      }

      // Set up graceful shutdown handlers
      this.setupGracefulShutdown();

      this.isInitialized = true;
      logger.info('System initialization completed successfully');
    } catch (error) {
      logger.error('System initialization failed:', error);
      throw error;
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      await initializeRedis();
      logger.info('Redis initialized successfully');
    } catch (error) {
      logger.warn(
        'Redis initialization failed, continuing with in-memory fallback:',
        error
      );
    }
  }

  private initializeMemoryMonitoring(): void {
    try {
      memoryMonitor.setThresholds(this.config.memoryThresholds);
      memoryMonitor.startMonitoring(this.config.memoryMonitoringInterval);
      logger.info('Memory monitoring initialized');
    } catch (error) {
      logger.error('Memory monitoring initialization failed:', error);
    }
  }

  private setupGracefulShutdown(): void {
    // Only set up process handlers in Node.js environment
    if (typeof process === 'undefined') {
      return;
    }

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Stop memory monitoring
        memoryMonitor.stopMonitoring();

        // Cleanup subscriptions
        subscriptionManager.shutdown();

        // Shutdown Redis
        await shutdownRedis();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      shutdown('unhandledRejection');
    });
  }

  async getSystemStatus(): Promise<{
    initialized: boolean;
    redis: boolean;
    memoryMonitoring: boolean;
    memoryStats: unknown;
    subscriptionStats: unknown;
    cacheStats: unknown;
  }> {
    const memoryStats = memoryMonitor.getMemoryStats();
    const subscriptionStats = subscriptionManager.getStats();
    const cacheStats = distributedFacilityCache.getStats();

    return {
      initialized: this.isInitialized,
      redis: this.config.enableRedis,
      memoryMonitoring: this.config.enableMemoryMonitoring,
      memoryStats,
      subscriptionStats,
      cacheStats,
    };
  }

  updateConfig(newConfig: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.memoryThresholds) {
      memoryMonitor.setThresholds(newConfig.memoryThresholds);
    }

    if (newConfig.enableMemoryMonitoring !== undefined) {
      if (newConfig.enableMemoryMonitoring) {
        memoryMonitor.startMonitoring(this.config.memoryMonitoringInterval);
      } else {
        memoryMonitor.stopMonitoring();
      }
    }
  }

  getConfig(): SystemConfig {
    return { ...this.config };
  }

  async performMaintenance(): Promise<void> {
    logger.info('Performing system maintenance...');

    try {
      // Cleanup memory
      await memoryMonitor.performCleanup();

      // Log system status
      const status = await this.getSystemStatus();
      logger.info('System status:', status);

      logger.info('System maintenance completed');
    } catch (error) {
      logger.error('Error during system maintenance:', error);
    }
  }
}

// Export singleton instance
export const systemInitializer = SystemInitializer.getInstance();
