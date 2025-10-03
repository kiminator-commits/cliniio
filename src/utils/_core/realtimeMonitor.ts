import { RealtimeManager } from '@/services/_core/realtimeManager';

/**
 * Realtime Monitor - Automatically detects and resolves realtime.list_changes overhead
 * This utility helps reduce the 61.2% database time consumption from realtime subscriptions
 */
export class RealtimeMonitor {
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;
  private static lastCleanupTime = Date.now();
  private static cleanupThreshold = 30000; // Cleanup every 30 seconds if needed

  /**
   * Start monitoring realtime subscriptions for performance issues
   */
  static startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('⚠️ Realtime monitoring already active');
      return;
    }

    console.log('🔍 Starting realtime performance monitoring...');
    this.isMonitoring = true;

    // Monitor every 60 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkPerformance();
    }, 60000);
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Realtime monitoring stopped');
  }

  /**
   * Check for performance issues and trigger cleanup if needed
   */
  private static checkPerformance(): void {
    const stats = RealtimeManager.getStats();
    const now = Date.now();

    // Log current stats
    console.log('📊 Realtime Monitor Stats:', {
      channels: stats.totalChannels,
      subscribers: stats.totalSubscribers,
      tables: Object.keys(stats.tableSubscribers),
      isOverloaded: stats.totalChannels > 3,
    });

    // Check if cleanup is needed
    if (
      stats.totalChannels > 3 ||
      now - this.lastCleanupTime > this.cleanupThreshold
    ) {
      console.warn('🚨 Performance issue detected, triggering cleanup...');
      this.performCleanup();
      this.lastCleanupTime = now;
    }

    // Warn if approaching limits
    if (stats.totalChannels > 3) {
      console.warn(`⚠️ High channel count: ${stats.totalChannels}/5`);
    }

    if (stats.totalSubscribers > 6) {
      console.warn(`⚠️ High subscriber count: ${stats.totalSubscribers}/10`);
    }
  }

  /**
   * Perform cleanup based on current state
   */
  private static performCleanup(): void {
    const stats = RealtimeManager.getStats();

    if (stats.totalChannels > 3) {
      console.warn('🚨 CRITICAL: System overloaded, forcing full cleanup');
      RealtimeManager.forceCleanup();
    } else {
      console.log('🧹 Performing periodic cleanup');
      RealtimeManager.globalCleanup();
    }
  }

  /**
   * Get current performance metrics
   */
  static getPerformanceMetrics(): {
    channels: number;
    subscribers: number;
    tables: string[];
    health: 'healthy' | 'warning' | 'critical';
    recommendations: string[];
  } {
    const stats = RealtimeManager.getStats();
    const recommendations: string[] = [];

    let health: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (stats.totalChannels > 3) {
      health = health === 'healthy' ? 'warning' : 'critical';
      recommendations.push('Reduce number of realtime channels');
    }

    if (stats.totalSubscribers > 6) {
      health = health === 'healthy' ? 'warning' : 'critical';
      recommendations.push('Consolidate realtime subscriptions');
    }

    if (stats.totalChannels > 3) {
      health = 'critical';
      recommendations.push('Force cleanup all subscriptions');
      recommendations.push('Review realtime usage patterns');
    }

    return {
      channels: stats.totalChannels,
      subscribers: stats.totalSubscribers,
      tables: Object.keys(stats.tableSubscribers),
      health,
      recommendations,
    };
  }

  /**
   * Emergency cleanup - use when realtime.list_changes is consuming too much DB time
   */
  static emergencyCleanup(): void {
    console.error(
      '🚨 EMERGENCY REALTIME CLEANUP - Reducing realtime.list_changes overhead'
    );

    // Force cleanup all subscriptions
    RealtimeManager.forceCleanup();

    // Reset monitoring state
    this.lastCleanupTime = Date.now();

    console.log('✅ Emergency cleanup completed');
  }

  /**
   * Check if monitoring is active
   */
  static isActive(): boolean {
    return this.isMonitoring;
  }
}

// Auto-start monitoring in development mode
if (import.meta.env.DEV) {
  // Start monitoring after a short delay to allow app initialization
  setTimeout(() => {
    RealtimeMonitor.startMonitoring();
  }, 5000);
}
