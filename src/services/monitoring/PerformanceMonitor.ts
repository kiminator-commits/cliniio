import {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  SystemHealth,
  PerformanceSnapshot,
  PerformanceTrend,
  PerformanceInsight,
} from '../../types/performanceMonitorTypes';
import {
  calculateAggregatedMetrics,
  calculatePerformanceTrends,
  calculateHealthStatusFromChecks,
  calculateThroughputRate,
  truncateString,
} from './utils/performanceMonitorUtils';
import { performanceAlertingProvider } from './providers/performanceAlertingProvider';
import {
  checkThresholdsForMetric,
  getDefaultThresholds,
  createDatabaseHealthCheck,
  createMemoryHealthCheck,
  createPerformanceSnapshot,
  getSystemHealthSync,
  generatePerformanceInsights,
} from './utils/performanceOrchestrationUtils';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: PerformanceThreshold[] = [];
  private healthChecks: Array<
    () => Promise<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      duration: number;
    }>
  > = [];
  private readonly MAX_METRICS_PER_TYPE = 1000;
  private performanceHistory: Map<string, PerformanceSnapshot[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private constructor() {
    this.initializeDefaultThresholds();
    this.initializeHealthChecks();
    this.startContinuousMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {},
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      metadata,
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricList = this.metrics.get(name)!;
    metricList.push(metric);

    // Keep only recent metrics
    if (metricList.length > this.MAX_METRICS_PER_TYPE) {
      metricList.splice(0, metricList.length - this.MAX_METRICS_PER_TYPE);
    }

    // Check thresholds
    checkThresholdsForMetric(metric, this.thresholds);

    performanceAlertingProvider.logMetricRecorded(name, value, unit, tags, metadata);
  }

  /**
   * Record response time
   */
  recordResponseTime(
    operation: string,
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('response_time', duration, 'ms', {
      operation,
      ...tags,
    });
  }

  /**
   * Record error rate
   */
  recordErrorRate(
    service: string,
    rate: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('error_rate', rate, 'percent', {
      service,
      ...tags,
    });
  }

  /**
   * Record throughput
   */
  recordThroughput(
    operation: string,
    count: number,
    period: number = 60, // seconds
    tags: Record<string, string> = {}
  ): void {
    const rate = calculateThroughputRate(count, period);
    this.recordMetric('throughput', rate, 'ops/sec', {
      operation,
      period: period.toString(),
      ...tags,
    });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(
    type: 'heap' | 'rss' | 'external',
    value: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('memory_usage', value, 'bytes', {
      type,
      ...tags,
    });
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(
    query: string,
    duration: number,
    rowsAffected: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('db_query_duration', duration, 'ms', {
      query: truncateString(query), // Truncate for storage
      ...tags,
    });

    this.recordMetric('db_query_rows', rowsAffected, 'count', {
      query: truncateString(query),
      ...tags,
    });
  }

  /**
   * Record component mount time
   */
  recordComponentMount(
    componentName: string,
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('component_mount_time', duration, 'ms', {
      component: componentName,
      ...tags,
    });
  }

  /**
   * Record authentication performance
   */
  recordAuthentication(
    duration: number,
    success: boolean,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('authentication_time', duration, 'ms', {
      success: success.toString(),
      ...tags,
    });
  }

  /**
   * Record data fetch performance
   */
  recordDataFetch(
    operation: string,
    duration: number,
    success: boolean,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('data_fetch_time', duration, 'ms', {
      operation,
      success: success.toString(),
      ...tags,
    });
  }

  /**
   * Record navigation performance
   */
  recordNavigation(
    from: string,
    to: string,
    duration: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric('navigation_time', duration, 'ms', {
      from,
      to,
      ...tags,
    });
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(name: string, limit: number = 100): PerformanceMetric[] {
    const metricList = this.metrics.get(name) || [];
    return metricList.slice(-limit);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetric[]> {
    return new Map(this.metrics);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(
    name: string,
    period: number = 300000
  ): {
    // 5 minutes
    avg: number;
    min: number;
    max: number;
    count: number;
    p95: number;
    p99: number;
  } {
    const metricList = this.metrics.get(name) || [];
    return calculateAggregatedMetrics(metricList, period);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const checks = await Promise.all(
      this.healthChecks.map(async (check) => {
        const checkStart = Date.now();
        try {
          const result = await check();
          return {
            ...result,
            duration: Date.now() - checkStart,
          };
        } catch (error) {
          return {
            name: 'unknown',
            status: 'fail' as const,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration: Date.now() - checkStart,
          };
        }
      })
    );

    const { status, score } = calculateHealthStatusFromChecks(checks);

    // Get current metrics
    const responseTime = this.getAggregatedMetrics('response_time').avg;
    const errorRate = this.getAggregatedMetrics('error_rate').avg;
    const throughput = this.getAggregatedMetrics('throughput').avg;

    return {
      status,
      score,
      checks,
      metrics: {
        cpu: 0, // Would be populated by system monitoring
        memory: this.getAggregatedMetrics('memory_usage').avg,
        responseTime,
        errorRate,
        throughput,
      },
      lastUpdated: new Date(),
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return performanceAlertingProvider.getActiveAlerts();
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    performanceAlertingProvider.resolveAlert(alertId);
  }

  /**
   * Add a health check
   */
  addHealthCheck(
    check: () => Promise<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      duration: number;
    }>
  ): void {
    this.healthChecks.push(check);
  }

  /**
   * Set performance thresholds
   */
  setThresholds(thresholds: PerformanceThreshold[]): void {
    this.thresholds = thresholds;
    performanceAlertingProvider.logThresholdsUpdated(thresholds);
  }


  /**
   * Initialize default thresholds
   */
  private initializeDefaultThresholds(): void {
    this.thresholds = getDefaultThresholds();
  }

  /**
   * Initialize default health checks
   */
  private initializeHealthChecks(): void {
    // Database connectivity check
    this.addHealthCheck(createDatabaseHealthCheck());

    // Memory usage check
    this.addHealthCheck(createMemoryHealthCheck((name) => this.getAggregatedMetrics(name)));
  }

  /**
   * Start continuous monitoring
   */
  private startContinuousMonitoring(): void {
    if (this.isMonitoring) return;

    // Only start monitoring in production or when explicitly enabled
    const isDevelopment = import.meta.env.DEV;
    const enableMonitoring =
      import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (isDevelopment && !enableMonitoring) {
      performanceAlertingProvider.logMonitoringDisabled();
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.capturePerformanceSnapshot();
    }, 30000); // Capture snapshot every 30 seconds
  }

  /**
   * Stop continuous monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Capture a performance snapshot
   */
  private async capturePerformanceSnapshot(): Promise<void> {
    try {
      const health = await this.getSystemHealth();
      const activeAlerts = this.getActiveAlerts();

      const snapshot = createPerformanceSnapshot(health, activeAlerts, this.metrics);

      // Store snapshot
      const key = 'performance_snapshot';
      if (!this.performanceHistory.has(key)) {
        this.performanceHistory.set(key, []);
      }

      const history = this.performanceHistory.get(key)!;
      history.push(snapshot);

      // Keep only last 100 snapshots
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      performanceAlertingProvider.logSnapshotCaptured(
        snapshot.timestamp,
        snapshot.metrics.size,
        activeAlerts.length
      );
    } catch (error) {
      performanceAlertingProvider.logSnapshotError(error);
    }
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(
    metricName: string,
    period: number = 300000
  ): PerformanceTrend[] {
    const metricList = this.metrics.get(metricName) || [];
    return calculatePerformanceTrends(metricList, period);
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): PerformanceInsight[] {
    const health = this.getSystemHealthSync();
    return generatePerformanceInsights(
      health,
      (metricName) => this.getPerformanceTrends(metricName),
      (name) => this.getAggregatedMetrics(name)
    );
  }

  /**
   * Subscribe to performance alerts
   */
  subscribeToAlerts(callback: (alert: PerformanceAlert) => void): () => void {
    return performanceAlertingProvider.subscribeToAlerts(callback);
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(metricName?: string): PerformanceSnapshot[] {
    if (metricName) {
      return this.performanceHistory.get(metricName) || [];
    }
    return this.performanceHistory.get('performance_snapshot') || [];
  }

  /**
   * Get system health synchronously (cached)
   */
  private getSystemHealthSync(): SystemHealth {
    return getSystemHealthSync((name) => this.getAggregatedMetrics(name));
  }

}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
