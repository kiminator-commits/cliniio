import {
  PerformanceMetric,
  PerformanceThreshold,
  PerformanceTrend,
} from '../../../types/performanceMonitorTypes';

/**
 * Calculate aggregated metrics from a list of performance metrics
 */
export function calculateAggregatedMetrics(
  metrics: PerformanceMetric[],
  period: number = 300000
): {
  avg: number;
  min: number;
  max: number;
  count: number;
  p95: number;
  p99: number;
} {
  const cutoff = new Date(Date.now() - period);
  const recentMetrics = metrics.filter((m) => m.timestamp > cutoff);

  if (recentMetrics.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0, p95: 0, p99: 0 };
  }

  const values = recentMetrics.map((m) => m.value).sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);

  return {
    avg: sum / values.length,
    min: values[0],
    max: values[values.length - 1],
    count: values.length,
    p95: values[Math.floor(values.length * 0.95)],
    p99: values[Math.floor(values.length * 0.99)],
  };
}

/**
 * Check if a metric value should trigger an alert based on threshold
 */
export function shouldTriggerAlert(
  metric: PerformanceMetric,
  threshold: PerformanceThreshold
): { shouldAlert: boolean; severity: 'warning' | 'critical' } {
  let shouldAlert = false;
  let severity: 'warning' | 'critical' = 'warning';

  switch (threshold.operator) {
    case 'gt':
      shouldAlert = metric.value > threshold.warning;
      severity = metric.value > threshold.critical ? 'critical' : 'warning';
      break;
    case 'lt':
      shouldAlert = metric.value < threshold.warning;
      severity = metric.value < threshold.critical ? 'critical' : 'warning';
      break;
    case 'gte':
      shouldAlert = metric.value >= threshold.warning;
      severity =
        metric.value >= threshold.critical ? 'critical' : 'warning';
      break;
    case 'lte':
      shouldAlert = metric.value <= threshold.warning;
      severity =
        metric.value <= threshold.critical ? 'critical' : 'warning';
      break;
    case 'eq':
      shouldAlert = metric.value === threshold.warning;
      severity =
        metric.value === threshold.critical ? 'critical' : 'warning';
      break;
  }

  return { shouldAlert, severity };
}

/**
 * Calculate performance trends from metrics
 */
export function calculatePerformanceTrends(
  metrics: PerformanceMetric[],
  period: number = 300000
): PerformanceTrend[] {
  const trends: PerformanceTrend[] = [];
  const cutoff = new Date(Date.now() - period);
  const recentMetrics = metrics.filter((m) => m.timestamp > cutoff);

  if (recentMetrics.length < 2) {
    return trends;
  }

  const values = recentMetrics.map((m) => m.value);
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  if (Math.abs(changePercent) > 10) {
    trend = changePercent < 0 ? 'improving' : 'degrading';
  }

  trends.push({
    metric: recentMetrics[0].name,
    trend,
    changePercent: Math.round(changePercent * 100) / 100,
    period: `${Math.round(period / 60000)} minutes`,
  });

  return trends;
}

/**
 * Calculate system health score based on metrics
 */
export function calculateHealthScore(
  responseTime: number,
  errorRate: number,
  memory: number
): { score: number; status: 'healthy' | 'degraded' | 'critical' } {
  let score = 100;
  if (responseTime > 1000) score -= 20;
  if (errorRate > 5) score -= 30;
  if (memory > 500 * 1024 * 1024) score -= 20;

  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (score < 50) status = 'critical';
  else if (score < 80) status = 'degraded';

  return {
    score: Math.max(0, score),
    status,
  };
}

/**
 * Calculate health status from check results
 */
export function calculateHealthStatusFromChecks(
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
  }>
): { status: 'healthy' | 'degraded' | 'critical'; score: number } {
  const failedChecks = checks.filter((c) => c.status === 'fail').length;
  const warningChecks = checks.filter((c) => c.status === 'warn').length;
  const totalChecks = checks.length;

  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (failedChecks > 0) {
    status = failedChecks > totalChecks / 2 ? 'critical' : 'degraded';
  } else if (warningChecks > 0) {
    status = 'degraded';
  }

  const score = Math.max(0, 100 - failedChecks * 50 - warningChecks * 25);

  return { status, score };
}

/**
 * Generate alert ID
 */
export function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create alert message
 */
export function createAlertMessage(
  metricName: string,
  operator: string,
  threshold: number,
  currentValue: number
): string {
  return `${metricName} ${operator} ${threshold} (current: ${currentValue})`;
}

/**
 * Check if alert is recent (within 5 minutes)
 */
export function isAlertRecent(alertTimestamp: Date): boolean {
  return Date.now() - alertTimestamp.getTime() < 300000; // 5 minutes
}

/**
 * Calculate throughput rate
 */
export function calculateThroughputRate(count: number, period: number = 60): number {
  return count / period;
}

/**
 * Format period in minutes
 */
export function formatPeriodInMinutes(periodMs: number): string {
  return `${Math.round(periodMs / 60000)} minutes`;
}

/**
 * Truncate string for storage
 */
export function truncateString(str: string, maxLength: number = 50): string {
  return str.substring(0, maxLength);
}

/**
 * Convert bytes to MB
 */
export function bytesToMB(bytes: number): number {
  return Math.round(bytes / 1024 / 1024);
}

/**
 * Check if memory usage is healthy
 */
export function isMemoryUsageHealthy(memoryBytes: number, thresholdMB: number = 200): boolean {
  return memoryBytes < thresholdMB * 1024 * 1024;
}
