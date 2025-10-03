import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Performance monitoring types
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errorRate: number;
  operationsByType: Record<string, number>;
  recentOperations: PerformanceMetric[];
}

interface PerformanceMonitor {
  metrics: PerformanceMetric[];
  stats: PerformanceStats;
  isEnabled: boolean;
  maxMetrics: number;
  startTime: number;
}

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  MAX_METRICS: 1000,
  ENABLED: true,
  SLOW_OPERATION_THRESHOLD: 1000, // 1 second
  ERROR_THRESHOLD: 0.1, // 10% error rate
  METRICS_RETENTION_MS: 24 * 60 * 60 * 1000, // 24 hours
};

// Performance monitoring helper functions
const createPerformanceMonitor = (): PerformanceMonitor => ({
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

const calculatePerformanceStats = (
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

const cleanupOldMetrics = (
  metrics: PerformanceMetric[]
): PerformanceMetric[] => {
  const cutoffTime = Date.now() - PERFORMANCE_CONFIG.METRICS_RETENTION_MS;
  return metrics.filter((metric) => metric.timestamp > cutoffTime);
};

const detectPerformanceAlerts = (
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

// Performance State interface
interface PerformanceState {
  performanceMonitor: PerformanceMonitor;
  performanceAlerts: {
    slowOperations: PerformanceMetric[];
    highErrorRate: boolean;
    performanceDegraded: boolean;
  };
}

// Performance Actions interface
interface PerformanceActions {
  recordPerformanceMetric: (
    metric: Omit<PerformanceMetric, 'timestamp'>
  ) => void;
  clearPerformanceMetrics: () => void;
  updatePerformanceStats: () => void;
  setPerformanceMonitoring: (enabled: boolean) => void;
  getPerformanceReport: () => PerformanceStats;
}

// Combined performance store type
type PerformanceStore = PerformanceState & PerformanceActions;

// Create the performance store
export const usePerformanceStore = create<PerformanceStore>()(
  devtools((set, get) => ({
    // Initial state
    performanceMonitor: createPerformanceMonitor(),
    performanceAlerts: {
      slowOperations: [],
      highErrorRate: false,
      performanceDegraded: false,
    },

    // Performance monitoring actions
    recordPerformanceMetric: (metric: Omit<PerformanceMetric, 'timestamp'>) => {
      const { performanceMonitor } = get();

      if (!performanceMonitor.isEnabled) return;

      const fullMetric: PerformanceMetric = {
        ...metric,
        timestamp: Date.now(),
      };

      let updatedMetrics = [...performanceMonitor.metrics, fullMetric];

      // Clean up old metrics
      updatedMetrics = cleanupOldMetrics(updatedMetrics);

      // Limit the number of stored metrics
      if (updatedMetrics.length > performanceMonitor.maxMetrics) {
        updatedMetrics = updatedMetrics.slice(-performanceMonitor.maxMetrics);
      }

      const updatedStats = calculatePerformanceStats(updatedMetrics);
      const updatedAlerts = detectPerformanceAlerts(updatedStats);

      set({
        performanceMonitor: {
          ...performanceMonitor,
          metrics: updatedMetrics,
          stats: updatedStats,
        },
        performanceAlerts: updatedAlerts,
      });
    },

    clearPerformanceMetrics: () => {
      const resetMonitor = createPerformanceMonitor();

      set({
        performanceMonitor: resetMonitor,
        performanceAlerts: {
          slowOperations: [],
          highErrorRate: false,
          performanceDegraded: false,
        },
      });
    },

    updatePerformanceStats: () => {
      const { performanceMonitor } = get();
      const updatedStats = calculatePerformanceStats(
        performanceMonitor.metrics
      );
      const updatedAlerts = detectPerformanceAlerts(updatedStats);

      set({
        performanceMonitor: {
          ...performanceMonitor,
          stats: updatedStats,
        },
        performanceAlerts: updatedAlerts,
      });
    },

    setPerformanceMonitoring: (enabled: boolean) => {
      const { performanceMonitor } = get();

      set({
        performanceMonitor: {
          ...performanceMonitor,
          isEnabled: enabled,
        },
      });
    },

    getPerformanceReport: () => {
      const { performanceMonitor } = get();
      return performanceMonitor.stats;
    },
  }))
);

// Selector hooks for performance state
export const usePerformanceMonitor = () =>
  usePerformanceStore((state) => state.performanceMonitor);
export const usePerformanceStats = () =>
  usePerformanceStore((state) => state.performanceMonitor.stats);
export const usePerformanceAlerts = () =>
  usePerformanceStore((state) => state.performanceAlerts);
export const usePerformanceMetrics = () =>
  usePerformanceStore((state) => state.performanceMonitor.metrics);

// Action hooks for performance
export const useRecordPerformanceMetric = () =>
  usePerformanceStore((state) => state.recordPerformanceMetric);
export const useClearPerformanceMetrics = () =>
  usePerformanceStore((state) => state.clearPerformanceMetrics);
export const useUpdatePerformanceStats = () =>
  usePerformanceStore((state) => state.updatePerformanceStats);
export const useSetPerformanceMonitoring = () =>
  usePerformanceStore((state) => state.setPerformanceMonitoring);
export const useGetPerformanceReport = () =>
  usePerformanceStore((state) => state.getPerformanceReport);

// Performance monitoring computed selectors
export const useIsPerformanceMonitoringEnabled = () =>
  usePerformanceStore((state) => state.performanceMonitor.isEnabled);
export const useSlowOperations = () =>
  usePerformanceStore((state) => state.performanceAlerts.slowOperations);
export const useHasHighErrorRate = () =>
  usePerformanceStore((state) => state.performanceAlerts.highErrorRate);
export const useIsPerformanceDegraded = () =>
  usePerformanceStore((state) => state.performanceAlerts.performanceDegraded);
