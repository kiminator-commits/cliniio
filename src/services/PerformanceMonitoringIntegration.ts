import { performanceMonitor } from './monitoring/PerformanceMonitor';
import { performanceAlertingService } from './PerformanceAlertingService';
import { performanceAnalyticsService } from './PerformanceAnalyticsService';
import { ConsoleNotificationChannel } from './ConsoleNotificationChannel';

/**
 * Performance Monitoring Integration
 * Integrates all performance monitoring services
 */
export class PerformanceMonitoringIntegration {
  private static instance: PerformanceMonitoringIntegration | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PerformanceMonitoringIntegration {
    if (!PerformanceMonitoringIntegration.instance) {
      PerformanceMonitoringIntegration.instance =
        new PerformanceMonitoringIntegration();
    }
    return PerformanceMonitoringIntegration.instance;
  }

  /**
   * Initialize all performance monitoring services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Add console notification channel
      const consoleChannel = new ConsoleNotificationChannel();
      performanceAlertingService.addNotificationChannel(consoleChannel);

      // Enable alerting
      performanceAlertingService.enable();

      this.isInitialized = true;
      console.log(
        '[PerformanceMonitoringIntegration] All services initialized successfully'
      );
    } catch (error) {
      console.error(
        '[PerformanceMonitoringIntegration] Failed to initialize:',
        error
      );
      throw error;
    }
  }

  /**
   * Get comprehensive performance status
   */
  getPerformanceStatus(): PerformanceStatus {
    const health = performanceMonitor.getSystemHealthSync();
    const alerts = performanceMonitor.getActiveAlerts();
    const alertStats = performanceAlertingService.getAlertStatistics();
    const insights = performanceMonitor.getPerformanceInsights();

    return {
      health,
      alerts,
      alertStats,
      insights,
      isInitialized: this.isInitialized,
      timestamp: new Date(),
    };
  }

  /**
   * Generate performance report
   */
  generateReport(period: number = 3600000): unknown {
    return performanceAnalyticsService.generatePerformanceReport(period);
  }

  /**
   * Get performance trends
   */
  getTrends(metricName: string, period: number = 300000): unknown[] {
    return performanceMonitor.getPerformanceTrends(metricName, period);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): unknown[] {
    return performanceAlertingService.getAlertHistory(limit);
  }

  /**
   * Clear all performance data
   */
  clearAllData(): void {
    performanceAlertingService.clearHistory();
    // Note: PerformanceMonitor doesn't have a clear method, but this could be added
    console.log('[PerformanceMonitoringIntegration] Performance data cleared');
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    if (enabled) {
      performanceAlertingService.enable();
    } else {
      performanceAlertingService.disable();
    }
  }
}

// Types
interface PerformanceStatus {
  health: unknown;
  alerts: unknown[];
  alertStats: unknown;
  insights: unknown[];
  isInitialized: boolean;
  timestamp: Date;
}

// Export singleton instance
export const performanceMonitoringIntegration =
  PerformanceMonitoringIntegration.getInstance();
