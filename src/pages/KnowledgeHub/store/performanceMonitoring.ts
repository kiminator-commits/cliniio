// Performance monitoring types
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorRate: number;
  operationsByType: Record<string, number>;
  recentOperations: PerformanceMetric[];
}

export interface PerformanceMonitor {
  metrics: PerformanceMetric[];
  stats: PerformanceStats;
  isEnabled: boolean;
  maxMetrics: number;
  startTime: number;
}

// Performance monitoring configuration
export const PERFORMANCE_CONFIG = {
  MAX_METRICS: 1000,
  ENABLED: true,
  SLOW_OPERATION_THRESHOLD: 1000, // 1 second
  ERROR_THRESHOLD: 0.1, // 10% error rate
  METRICS_RETENTION_MS: 24 * 60 * 60 * 1000, // 24 hours
};

// Performance monitoring helper functions
export const createPerformanceMonitor = (): PerformanceMonitor => ({
  metrics: [],
  stats: {
    totalOperations: 0,
    averageDuration: 0,
    minDuration: Infinity,
    maxDuration: 0,
    successRate: 1,
    errorRate: 0,
    operationsByType: {},
    recentOperations: [],
  },
  isEnabled: PERFORMANCE_CONFIG.ENABLED,
  maxMetrics: PERFORMANCE_CONFIG.MAX_METRICS,
  startTime: Date.now(),
});

export const calculatePerformanceStats = (
  metrics: PerformanceMetric[]
): PerformanceStats => {
  if (metrics.length === 0) {
    return {
      totalOperations: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      successRate: 1,
      errorRate: 0,
      operationsByType: {},
      recentOperations: [],
    };
  }

  const totalOperations = metrics.length;
  const successfulOperations = metrics.filter((m) => m.success).length;
  const durations = metrics.map((m) => m.duration);
  const operationsByType = metrics.reduce(
    (acc, metric) => {
      acc[metric.operation] = (acc[metric.operation] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalOperations,
    averageDuration: durations.reduce((sum, d) => sum + d, 0) / totalOperations,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    successRate: successfulOperations / totalOperations,
    errorRate: (totalOperations - successfulOperations) / totalOperations,
    operationsByType,
    recentOperations: metrics.slice(-10), // Last 10 operations
  };
};

export const cleanupOldMetrics = (
  metrics: PerformanceMetric[]
): PerformanceMetric[] => {
  const cutoffTime = Date.now() - PERFORMANCE_CONFIG.METRICS_RETENTION_MS;
  return metrics.filter((metric) => metric.timestamp > cutoffTime);
};

export const detectPerformanceAlerts = (
  stats: PerformanceStats
): {
  slowOperations: PerformanceMetric[];
  highErrorRate: boolean;
  performanceDegraded: boolean;
} => {
  const slowOperations = stats.recentOperations.filter(
    (op) => op.duration > PERFORMANCE_CONFIG.SLOW_OPERATION_THRESHOLD
  );

  const highErrorRate = stats.errorRate > PERFORMANCE_CONFIG.ERROR_THRESHOLD;
  const performanceDegraded =
    stats.averageDuration > PERFORMANCE_CONFIG.SLOW_OPERATION_THRESHOLD;

  return {
    slowOperations,
    highErrorRate,
    performanceDegraded,
  };
};
