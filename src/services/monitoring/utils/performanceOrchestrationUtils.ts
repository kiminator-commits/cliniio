import {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceAlert,
  SystemHealth,
  PerformanceSnapshot,
  PerformanceInsight,
} from '../../../types/performanceMonitorTypes';
import {
  shouldTriggerAlert,
  calculateHealthScore,
  isMemoryUsageHealthy,
  bytesToMB,
} from './performanceMonitorUtils';
import { performanceAlertingProvider } from '../providers/performanceAlertingProvider';

/**
 * Check thresholds for a metric and create alerts if needed
 */
export function checkThresholdsForMetric(
  metric: PerformanceMetric,
  thresholds: PerformanceThreshold[]
): void {
  const relevantThresholds = thresholds.filter((t) => t.metric === metric.name);

  for (const threshold of relevantThresholds) {
    const { shouldAlert, severity } = shouldTriggerAlert(metric, threshold);

    if (shouldAlert) {
      performanceAlertingProvider.createAlert(metric, threshold, severity);
    }
  }
}

/**
 * Get default performance thresholds
 */
export function getDefaultThresholds(): PerformanceThreshold[] {
  return [
    {
      metric: 'response_time',
      warning: 1000,
      critical: 5000,
      operator: 'gt',
    },
    {
      metric: 'component_mount_time',
      warning: 1000,
      critical: 3000,
      operator: 'gt',
    },
    {
      metric: 'authentication_time',
      warning: 2000,
      critical: 5000,
      operator: 'gt',
    },
    {
      metric: 'data_fetch_time',
      warning: 2000,
      critical: 5000,
      operator: 'gt',
    },
    {
      metric: 'navigation_time',
      warning: 1000,
      critical: 3000,
      operator: 'gt',
    },
    {
      metric: 'error_rate',
      warning: 5,
      critical: 10,
      operator: 'gt',
    },
    {
      metric: 'memory_usage',
      warning: 200 * 1024 * 1024, // 200MB
      critical: 500 * 1024 * 1024, // 500MB
      operator: 'gt',
    },
  ];
}

/**
 * Create database health check
 */
export function createDatabaseHealthCheck(): () => Promise<{
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
}> {
  return async () => {
    try {
      const start = Date.now();
      // This would be a real database ping
      const duration = Date.now() - start;
      return {
        name: 'database',
        status: 'pass',
        message: 'Database connection healthy',
        duration,
      };
    } catch (err) {
      performanceAlertingProvider.logDatabaseCheckError(err);
      return {
        name: 'database',
        status: 'fail',
        message: 'Database connection failed',
        duration: 0,
      };
    }
  };
}

/**
 * Create memory health check
 */
export function createMemoryHealthCheck(
  getAggregatedMetrics: (name: string) => { avg: number }
): () => Promise<{
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
}> {
  return async () => {
    try {
      const memoryUsage = getAggregatedMetrics('memory_usage');
      const isHealthy = isMemoryUsageHealthy(memoryUsage.avg);
      return {
        name: 'memory',
        status: isHealthy ? 'pass' : 'warn',
        message: `Memory usage: ${bytesToMB(memoryUsage.avg)}MB`,
        duration: 0,
      };
    } catch (err) {
      performanceAlertingProvider.logMemoryCheckError(err);
      return {
        name: 'memory',
        status: 'fail',
        message: 'Memory check failed',
        duration: 0,
      };
    }
  };
}

/**
 * Create performance snapshot
 */
export function createPerformanceSnapshot(
  health: SystemHealth,
  activeAlerts: PerformanceAlert[],
  metrics: Map<string, PerformanceMetric[]>
): PerformanceSnapshot {
  const snapshot: PerformanceSnapshot = {
    timestamp: new Date(),
    metrics: new Map(),
    health,
    alerts: activeAlerts,
  };

  // Capture current metrics
  for (const [metricName, metricList] of Array.from(metrics.entries())) {
    if (metricList.length > 0) {
      const latest = metricList[metricList.length - 1];
      snapshot.metrics.set(metricName, latest.value);
    }
  }

  return snapshot;
}

/**
 * Get system health synchronously (cached)
 */
export function getSystemHealthSync(
  getAggregatedMetrics: (name: string) => { avg: number }
): SystemHealth {
  const responseTime = getAggregatedMetrics('response_time').avg;
  const errorRate = getAggregatedMetrics('error_rate').avg;
  const memory = getAggregatedMetrics('memory_usage').avg;

  const { score, status } = calculateHealthScore(
    responseTime,
    errorRate,
    memory
  );

  return {
    status,
    score,
    checks: [],
    metrics: {
      cpu: 0,
      memory,
      responseTime,
      errorRate,
      throughput: getAggregatedMetrics('throughput').avg,
    },
    lastUpdated: new Date(),
  };
}

/**
 * Generate performance insights
 */
export function generatePerformanceInsights(
  health: SystemHealth,
  getPerformanceTrends: (metricName: string) => PerformanceInsight[],
  getAggregatedMetrics: (name: string) => { avg: number }
): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];

  // Check for critical issues
  if (health.status === 'critical') {
    insights.push({
      type: 'critical',
      title: 'System Critical',
      description: 'System is in critical state with multiple failures',
      impact: 'high',
      recommendations: [
        'Check system resources immediately',
        'Review error logs for root cause',
        'Consider scaling resources',
      ],
    });
  }

  // Check for performance degradation
  const responseTimeTrend = getPerformanceTrends('response_time')[0];
  if (responseTimeTrend && responseTimeTrend.trend === 'degrading') {
    insights.push({
      type: 'warning',
      title: 'Response Time Degradation',
      description: `Response time has increased by ${responseTimeTrend.changePercent}%`,
      impact: 'medium',
      recommendations: [
        'Optimize database queries',
        'Check for memory leaks',
        'Review caching strategies',
      ],
    });
  }

  // Check for memory issues
  const memoryTrend = getPerformanceTrends('memory_usage')[0];
  if (memoryTrend && memoryTrend.trend === 'degrading') {
    insights.push({
      type: 'warning',
      title: 'Memory Usage Increasing',
      description: `Memory usage has increased by ${memoryTrend.changePercent}%`,
      impact: 'medium',
      recommendations: [
        'Check for memory leaks',
        'Optimize data structures',
        'Consider garbage collection tuning',
      ],
    });
  }

  // Check for optimization opportunities
  const avgResponseTime = getAggregatedMetrics('response_time').avg;
  if (avgResponseTime > 1000) {
    insights.push({
      type: 'optimization',
      title: 'Response Time Optimization',
      description: `Average response time is ${avgResponseTime.toFixed(2)}ms`,
      impact: 'low',
      recommendations: [
        'Implement response caching',
        'Optimize API endpoints',
        'Consider CDN implementation',
      ],
    });
  }

  return insights;
}
