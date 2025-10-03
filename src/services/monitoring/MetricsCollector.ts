// import { performanceMonitor } from './PerformanceMonitor';
import { logger } from '../../utils/_core/logger';

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  tags: Record<string, string>;
}

export interface AggregatedMetric {
  name: string;
  timeRange: {
    start: number;
    end: number;
  };
  aggregation: {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  tags: Record<string, string>;
}

export interface MetricsQuery {
  metric: string;
  timeRange: {
    start: number;
    end: number;
  };
  tags?: Record<string, string>;
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count' | 'p95' | 'p99';
  groupBy?: string[];
  interval?: number; // seconds
}

export interface MetricsResponse {
  metric: string;
  dataPoints: MetricDataPoint[];
  aggregated?: AggregatedMetric;
  metadata: {
    queryTime: number;
    dataPointsCount: number;
    timeRange: {
      start: number;
      end: number;
    };
  };
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricDataPoint[]> = new Map();
  private readonly MAX_DATA_POINTS = 10000;
  private readonly DEFAULT_RETENTION = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.startCleanupTimer();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Record a metric data point
   */
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ): void {
    const dataPoint: MetricDataPoint = {
      timestamp: Date.now(),
      value,
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricList = this.metrics.get(name)!;
    metricList.push(dataPoint);

    // Keep only recent data points
    if (metricList.length > this.MAX_DATA_POINTS) {
      metricList.splice(0, metricList.length - this.MAX_DATA_POINTS);
    }

    logger.debug(`Metric recorded: ${name}=${value}`, { tags });
  }

  /**
   * Query metrics
   */
  queryMetrics(query: MetricsQuery): MetricsResponse {
    const startTime = Date.now();
    const metricList = this.metrics.get(query.metric) || [];

    // Filter by time range
    const filteredData = metricList.filter(
      (dp) =>
        dp.timestamp >= query.timeRange.start &&
        dp.timestamp <= query.timeRange.end
    );

    // Filter by tags if specified
    let filteredByTags = filteredData;
    if (query.tags) {
      filteredByTags = filteredData.filter((dp) => {
        return Object.entries(query.tags!).every(
          ([key, value]) => dp.tags[key] === value
        );
      });
    }

    // Group by specified fields
    let groupedData = filteredByTags;
    if (query.groupBy && query.groupBy.length > 0) {
      const groups = new Map<string, MetricDataPoint[]>();

      filteredByTags.forEach((dp) => {
        const groupKey = query
          .groupBy!.map((field) => dp.tags[field] || 'unknown')
          .join(':');
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(dp);
      });

      // For now, return the first group (in a real implementation, you'd return all groups)
      groupedData = groups.values().next().value || [];
    }

    // Apply interval if specified
    let finalData = groupedData;
    if (query.interval && query.interval > 0) {
      finalData = this.applyInterval(groupedData, query.interval);
    }

    // Calculate aggregation if requested
    let aggregated: AggregatedMetric | undefined;
    if (query.aggregation || query.interval) {
      aggregated = this.calculateAggregation(
        query.metric,
        finalData,
        query.timeRange
      );
    }

    const response: MetricsResponse = {
      metric: query.metric,
      dataPoints: finalData,
      aggregated,
      metadata: {
        queryTime: Date.now() - startTime,
        dataPointsCount: finalData.length,
        timeRange: query.timeRange,
      },
    };

    return response;
  }

  /**
   * Get available metrics
   */
  getAvailableMetrics(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get metric statistics
   */
  getMetricStats(metricName: string): {
    totalDataPoints: number;
    timeRange: { start: number; end: number } | null;
    latestValue: number | null;
    tags: Set<string>;
  } {
    const metricList = this.metrics.get(metricName) || [];

    if (metricList.length === 0) {
      return {
        totalDataPoints: 0,
        timeRange: null,
        latestValue: null,
        tags: new Set(),
      };
    }

    const timestamps = metricList.map((dp) => dp.timestamp);
    const allTags = new Set<string>();
    metricList.forEach((dp) => {
      Object.keys(dp.tags).forEach((tag) => allTags.add(tag));
    });

    return {
      totalDataPoints: metricList.length,
      timeRange: {
        start: Math.min(...timestamps),
        end: Math.max(...timestamps),
      },
      latestValue: metricList[metricList.length - 1]?.value || null,
      tags: allTags,
    };
  }

  /**
   * Export metrics data
   */
  exportMetrics(metricNames?: string[]): Record<string, MetricDataPoint[]> {
    const exportData: Record<string, MetricDataPoint[]> = {};

    const metricsToExport = metricNames || Array.from(this.metrics.keys());

    metricsToExport.forEach((name) => {
      if (this.metrics.has(name)) {
        exportData[name] = [...this.metrics.get(name)!];
      }
    });

    return exportData;
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(maxAge: number = this.DEFAULT_RETENTION): void {
    const cutoff = Date.now() - maxAge;

    for (const [name, dataPoints] of this.metrics.entries()) {
      const filtered = dataPoints.filter((dp) => dp.timestamp > cutoff);
      this.metrics.set(name, filtered);
    }

    logger.info('Old metrics cleared', { maxAge });
  }

  /**
   * Apply time interval to data points
   */
  private applyInterval(
    dataPoints: MetricDataPoint[],
    intervalSeconds: number
  ): MetricDataPoint[] {
    if (dataPoints.length === 0) return [];

    const intervalMs = intervalSeconds * 1000;
    const grouped = new Map<number, MetricDataPoint[]>();

    dataPoints.forEach((dp) => {
      const intervalStart = Math.floor(dp.timestamp / intervalMs) * intervalMs;
      if (!grouped.has(intervalStart)) {
        grouped.set(intervalStart, []);
      }
      grouped.get(intervalStart)!.push(dp);
    });

    // Calculate average for each interval
    const result: MetricDataPoint[] = [];
    for (const [intervalStart, points] of grouped.entries()) {
      const avgValue =
        points.reduce((sum, p) => sum + p.value, 0) / points.length;
      const tags = points[0].tags; // Use tags from first point

      result.push({
        timestamp: intervalStart,
        value: avgValue,
        tags,
      });
    }

    return result.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculate aggregation for data points
   */
  private calculateAggregation(
    metricName: string,
    dataPoints: MetricDataPoint[],
    timeRange: { start: number; end: number }
  ): AggregatedMetric {
    if (dataPoints.length === 0) {
      return {
        name: metricName,
        timeRange,
        aggregation: {
          count: 0,
          sum: 0,
          avg: 0,
          min: 0,
          max: 0,
          p50: 0,
          p95: 0,
          p99: 0,
        },
        tags: {},
      };
    }

    const values = dataPoints.map((dp) => dp.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const count = values.length;

    return {
      name: metricName,
      timeRange,
      aggregation: {
        count,
        sum,
        avg: sum / count,
        min: values[0],
        max: values[values.length - 1],
        p50: values[Math.floor(count * 0.5)],
        p95: values[Math.floor(count * 0.95)],
        p99: values[Math.floor(count * 0.99)],
      },
      tags: dataPoints[0]?.tags || {},
    };
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    // Clean up old metrics every hour
    setInterval(
      () => {
        this.clearOldMetrics();
      },
      60 * 60 * 1000
    );
  }
}

// Singleton instance
export const metricsCollector = MetricsCollector.getInstance();
