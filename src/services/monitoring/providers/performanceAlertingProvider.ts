import { logger } from '../../../utils/_core/logger';
import {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
} from '../../../types/performanceMonitorTypes';
import {
  generateAlertId,
  createAlertMessage,
  isAlertRecent,
} from '../utils/performanceMonitorUtils';

export class PerformanceAlertingProvider {
  private alerts: PerformanceAlert[] = [];
  private alertSubscribers: Array<(alert: PerformanceAlert) => void> = [];

  /**
   * Create a performance alert
   */
  createAlert(
    metric: PerformanceMetric,
    threshold: PerformanceThreshold,
    severity: 'warning' | 'critical'
  ): void {
    const alertId = generateAlertId();

    const alert: PerformanceAlert = {
      id: alertId,
      metric: metric.name,
      value: metric.value,
      threshold: threshold.warning,
      severity,
      message: createAlertMessage(
        metric.name,
        threshold.operator,
        threshold.warning,
        metric.value
      ),
      timestamp: new Date(),
      resolved: false,
    };

    // Check if similar alert already exists
    const existingAlert = this.alerts.find(
      (a) =>
        a.metric === alert.metric &&
        a.severity === alert.severity &&
        !a.resolved &&
        isAlertRecent(a.timestamp)
    );

    if (!existingAlert) {
      this.alerts.push(alert);
      logger.warn(`Performance alert: ${alert.message}`, alert);
      this.notifyAlertSubscribers(alert);
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter((alert) => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      logger.info(`Alert resolved: ${alertId}`, alert);
    }
  }

  /**
   * Subscribe to performance alerts
   */
  subscribeToAlerts(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertSubscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.alertSubscribers.indexOf(callback);
      if (index > -1) {
        this.alertSubscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify alert subscribers
   */
  private notifyAlertSubscribers(alert: PerformanceAlert): void {
    this.alertSubscribers.forEach((callback) => {
      try {
        callback(alert);
      } catch (error) {
        logger.error('Error in alert subscriber:', error);
      }
    });
  }

  /**
   * Log performance metric recording
   */
  logMetricRecorded(
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string>,
    metadata?: Record<string, unknown>
  ): void {
    logger.debug(`Performance metric recorded: ${name}=${value}${unit}`, {
      tags,
      metadata,
    });
  }

  /**
   * Log performance thresholds update
   */
  logThresholdsUpdated(thresholds: PerformanceThreshold[]): void {
    logger.info('Performance thresholds updated', { thresholds });
  }

  /**
   * Log performance snapshot capture (reduced frequency)
   */
  logSnapshotCaptured(
    timestamp: Date,
    metricsCount: number,
    alertsCount: number
  ): void {
    // Only log every 5th snapshot to reduce console noise
    const shouldLog = Math.random() < 0.2; // 20% chance to log
    if (shouldLog) {
      logger.debug('Performance snapshot captured', {
        timestamp,
        metricsCount,
        alertsCount,
      });
    }
  }

  /**
   * Log snapshot capture error
   */
  logSnapshotError(error: unknown): void {
    logger.error('Failed to capture performance snapshot:', error);
  }

  /**
   * Log monitoring disabled message
   */
  logMonitoringDisabled(): void {
    console.log('Performance monitoring disabled in development mode');
  }

  /**
   * Log database check error
   */
  logDatabaseCheckError(error: unknown): void {
    console.error(error);
  }

  /**
   * Log memory check error
   */
  logMemoryCheckError(error: unknown): void {
    console.error(error);
  }
}

// Singleton instance
export const performanceAlertingProvider = new PerformanceAlertingProvider();
