import { performanceMonitor } from './PerformanceMonitor';
import { healthCheckService } from './HealthCheckService';
import { metricsCollector } from './MetricsCollector';
import { alertingService } from './AlertingService';
import { enhancedLoggingService } from './EnhancedLoggingService';
import { logger } from '../../utils/_core/logger';

export interface DashboardOverview {
  systemHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    uptime: number;
  };
  performance: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
  };
  alerts: {
    active: number;
    critical: number;
    warning: number;
  };
  logs: {
    total: number;
    errors: number;
    warnings: number;
  };
  lastUpdated: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  details: string;
}

export interface PerformanceChart {
  metric: string;
  timeRange: {
    start: number;
    end: number;
  };
  dataPoints: Array<{
    timestamp: number;
    value: number;
  }>;
  aggregation: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
}

export interface MonitoringConfig {
  refreshInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
}

export class MonitoringDashboard {
  private static instance: MonitoringDashboard;
  private config: MonitoringConfig;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      refreshInterval: 30000, // 30 seconds
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      alertThresholds: {
        responseTime: 1000, // 1 second
        errorRate: 5, // 5%
        memoryUsage: 200 * 1024 * 1024, // 200MB
      },
    };

    this.initializeAlertRules();
    this.startRefreshTimer();
  }

  static getInstance(): MonitoringDashboard {
    if (!MonitoringDashboard.instance) {
      MonitoringDashboard.instance = new MonitoringDashboard();
    }
    return MonitoringDashboard.instance;
  }

  /**
   * Get dashboard overview
   */
  async getOverview(): Promise<DashboardOverview> {
    try {
      // Get system health
      const healthReport = await healthCheckService.getSystemHealth();

      // Get performance metrics
      const responseTime =
        performanceMonitor.getAggregatedMetrics('response_time');
      const errorRate = performanceMonitor.getAggregatedMetrics('error_rate');
      const throughput = performanceMonitor.getAggregatedMetrics('throughput');
      const memoryUsage =
        performanceMonitor.getAggregatedMetrics('memory_usage');

      // Get alerts
      const activeAlerts = alertingService.getActiveAlerts();
      const criticalAlerts = activeAlerts.filter(
        (a) => a.severity === 'critical'
      );
      const warningAlerts = activeAlerts.filter(
        (a) => a.severity === 'warning'
      );

      // Get log statistics
      const logStats = enhancedLoggingService.getLogStats();

      return {
        systemHealth: {
          status: healthReport.overall,
          score: healthReport.score,
          uptime: healthReport.uptime,
        },
        performance: {
          responseTime: responseTime.avg,
          errorRate: errorRate.avg,
          throughput: throughput.avg,
          memoryUsage: memoryUsage.avg,
        },
        alerts: {
          active: activeAlerts.length,
          critical: criticalAlerts.length,
          warning: warningAlerts.length,
        },
        logs: {
          total: logStats.totalLogs,
          errors: logStats.levelCounts.error || 0,
          warnings: logStats.levelCounts.warn || 0,
        },
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(): Promise<ServiceStatus[]> {
    try {
      const healthReport = await healthCheckService.getSystemHealth();

      return healthReport.checks.map((check) => ({
        name: check.name,
        status:
          check.status === 'healthy'
            ? 'healthy'
            : check.status === 'degraded'
              ? 'degraded'
              : 'unhealthy',
        responseTime: check.duration,
        errorRate: 0, // Would be calculated from metrics
        lastCheck: check.timestamp,
        details: check.message,
      }));
    } catch (error) {
      logger.error('Error getting service status:', error);
      throw error;
    }
  }

  /**
   * Get performance chart data
   */
  getPerformanceChart(
    metric: string,
    timeRange: { start: number; end: number },
    interval: number = 300000 // 5 minutes
  ): PerformanceChart {
    try {
      const query = {
        metric,
        timeRange,
        interval: interval / 1000, // Convert to seconds
      };

      const response = metricsCollector.queryMetrics(query);
      const dataPoints = response.dataPoints.map((dp) => ({
        timestamp: dp.timestamp,
        value: dp.value,
      }));

      const values = dataPoints.map((dp) => dp.value);
      const aggregation = {
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        min: Math.min(...values) || 0,
        max: Math.max(...values) || 0,
        p95:
          values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)] || 0,
      };

      return {
        metric,
        timeRange,
        dataPoints,
        aggregation,
      };
    } catch (error) {
      logger.error('Error getting performance chart:', error);
      throw error;
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(
    level?: string[],
    limit: number = 100
  ): Array<{
    timestamp: string;
    level: string;
    message: string;
    context: unknown;
  }> {
    try {
      const filter = level ? { level } : {};
      const logs = enhancedLoggingService.queryLogs(filter);

      return logs.slice(-limit).map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        context: log.context,
      }));
    } catch (error) {
      logger.error('Error getting recent logs:', error);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Array<{
    id: string;
    title: string;
    message: string;
    severity: string;
    triggeredAt: string;
    value: unknown;
  }> {
    try {
      return alertingService.getActiveAlerts().map((alert) => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        triggeredAt: alert.triggeredAt.toISOString(),
        value: alert.value,
      }));
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    try {
      alertingService.resolveAlert(alertId);
      logger.info(`Alert resolved: ${alertId}`);
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Get monitoring configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...updates };

    // Restart refresh timer if interval changed
    if (updates.refreshInterval) {
      this.stopRefreshTimer();
      this.startRefreshTimer();
    }

    logger.info('Monitoring configuration updated', this.config);
  }

  /**
   * Export monitoring data
   */
  exportData(timeRange?: { start: number; end: number }): {
    overview: DashboardOverview;
    serviceStatus: ServiceStatus[];
    logs: unknown[];
    metrics: unknown;
  } {
    try {
      const filter = timeRange
        ? {
            timeRange: {
              start: timeRange.start,
              end: timeRange.end,
            },
          }
        : {};

      return {
        overview: {} as DashboardOverview, // Would be populated by getOverview()
        serviceStatus: [], // Would be populated by getServiceStatus()
        logs: enhancedLoggingService.exportLogs(filter),
        metrics: metricsCollector.exportMetrics(),
      };
    } catch (error) {
      logger.error('Error exporting monitoring data:', error);
      throw error;
    }
  }

  /**
   * Initialize alert rules
   */
  private initializeAlertRules(): void {
    // Response time alert
    alertingService.addRule({
      id: 'high_response_time',
      name: 'High Response Time',
      description: 'Response time exceeds threshold',
      metric: 'response_time',
      condition: {
        operator: 'gt',
        threshold: this.config.alertThresholds.responseTime,
        timeWindow: 300, // 5 minutes
      },
      severity: 'warning',
      enabled: true,
    });

    // Error rate alert
    alertingService.addRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Error rate exceeds threshold',
      metric: 'error_rate',
      condition: {
        operator: 'gt',
        threshold: this.config.alertThresholds.errorRate,
        timeWindow: 300,
      },
      severity: 'critical',
      enabled: true,
    });

    // Memory usage alert
    alertingService.addRule({
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      description: 'Memory usage exceeds threshold',
      metric: 'memory_usage',
      condition: {
        operator: 'gt',
        threshold: this.config.alertThresholds.memoryUsage,
        timeWindow: 300,
      },
      severity: 'warning',
      enabled: true,
    });

    logger.info('Alert rules initialized');
  }

  /**
   * Start refresh timer
   */
  private startRefreshTimer(): void {
    this.refreshTimer = setInterval(() => {
      this.refreshMetrics();
    }, this.config.refreshInterval);

    logger.info('Monitoring refresh timer started');
  }

  /**
   * Stop refresh timer
   */
  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      logger.info('Monitoring refresh timer stopped');
    }
  }

  /**
   * Refresh metrics
   */
  private async refreshMetrics(): Promise<void> {
    try {
      // Record current metrics
      const healthReport = await healthCheckService.getSystemHealth();

      performanceMonitor.recordMetric(
        'system_health_score',
        healthReport.score,
        'percent',
        {
          status: healthReport.overall,
        }
      );

      // Record performance metrics
      const responseTime =
        performanceMonitor.getAggregatedMetrics('response_time');
      const errorRate = performanceMonitor.getAggregatedMetrics('error_rate');
      const memoryUsage =
        performanceMonitor.getAggregatedMetrics('memory_usage');

      metricsCollector.recordMetric('response_time', responseTime.avg, {});
      metricsCollector.recordMetric('error_rate', errorRate.avg, {});
      metricsCollector.recordMetric('memory_usage', memoryUsage.avg, {});
    } catch (error) {
      logger.error('Error refreshing metrics:', error);
    }
  }
}

// Singleton instance
export const monitoringDashboard = MonitoringDashboard.getInstance();
