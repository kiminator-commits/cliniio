import { performanceMonitor } from './monitoring/PerformanceMonitor';
import { PerformanceSnapshot } from './monitoring/PerformanceMonitor';

/**
 * Performance Analytics Service
 * Provides advanced analytics and reporting for performance data
 */
export class PerformanceAnalyticsService {
  private static instance: PerformanceAnalyticsService | null = null;
  private analyticsData: Map<string, AnalyticsData> = new Map();

  private constructor() {}

  static getInstance(): PerformanceAnalyticsService {
    if (!PerformanceAnalyticsService.instance) {
      PerformanceAnalyticsService.instance = new PerformanceAnalyticsService();
    }
    return PerformanceAnalyticsService.instance;
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(period: number = 3600000): PerformanceReport {
    const history = performanceMonitor.getPerformanceHistory();
    const cutoff = new Date(Date.now() - period);
    const recentSnapshots = history.filter((s) => s.timestamp > cutoff);

    if (recentSnapshots.length === 0) {
      return this.getEmptyReport();
    }

    const metrics = this.analyzeMetrics(recentSnapshots);
    const trends = this.analyzeTrends(recentSnapshots);
    const insights = this.generateInsights(metrics, trends);
    const recommendations = this.generateRecommendations(metrics, trends);

    return {
      period: `${Math.round(period / 60000)} minutes`,
      totalSnapshots: recentSnapshots.length,
      metrics,
      trends,
      insights,
      recommendations,
      generatedAt: new Date(),
    };
  }

  /**
   * Analyze metrics from snapshots
   */
  private analyzeMetrics(snapshots: PerformanceSnapshot[]): MetricAnalysis {
    const analysis: MetricAnalysis = {
      responseTime: this.analyzeMetric(snapshots, 'response_time'),
      memoryUsage: this.analyzeMetric(snapshots, 'memory_usage'),
      errorRate: this.analyzeMetric(snapshots, 'error_rate'),
      throughput: this.analyzeMetric(snapshots, 'throughput'),
      componentMountTime: this.analyzeMetric(snapshots, 'component_mount_time'),
      authenticationTime: this.analyzeMetric(snapshots, 'authentication_time'),
      dataFetchTime: this.analyzeMetric(snapshots, 'data_fetch_time'),
      navigationTime: this.analyzeMetric(snapshots, 'navigation_time'),
    };

    return analysis;
  }

  /**
   * Analyze a specific metric
   */
  private analyzeMetric(
    snapshots: PerformanceSnapshot[],
    metricName: string
  ): MetricStats {
    const values = snapshots
      .map((s) => s.metrics.get(metricName))
      .filter((v) => v !== undefined) as number[];

    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0, p95: 0, p99: 0, count: 0 };
    }

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      median: this.calculatePercentile(sorted, 50),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99),
      count: values.length,
    };
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (upper >= sorted.length) return sorted[sorted.length - 1];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  /**
   * Analyze trends
   */
  private analyzeTrends(snapshots: PerformanceSnapshot[]): TrendAnalysis {
    const trends: TrendAnalysis = {};

    const metricNames = [
      'response_time',
      'memory_usage',
      'error_rate',
      'throughput',
    ];

    for (const metricName of metricNames) {
      const values = snapshots
        .map((s) => s.metrics.get(metricName))
        .filter((v) => v !== undefined) as number[];

      if (values.length < 2) continue;

      const trend = this.calculateTrend(values);
      trends[metricName] = trend;
    }

    return trends;
  }

  /**
   * Calculate trend for a series of values
   */
  private calculateTrend(values: number[]): TrendData {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    // Simple linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    let direction: 'improving' | 'stable' | 'degrading' = 'stable';
    if (Math.abs(changePercent) > 10) {
      direction = changePercent < 0 ? 'improving' : 'degrading';
    }

    return {
      direction,
      slope,
      changePercent: Math.round(changePercent * 100) / 100,
      confidence: Math.min(1, Math.abs(slope) * 100),
    };
  }

  /**
   * Generate insights
   */
  private generateInsights(
    metrics: MetricAnalysis,
    trends: TrendAnalysis
  ): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Response time insights
    if (metrics.responseTime.p95 > 2000) {
      insights.push({
        type: 'warning',
        title: 'High Response Time',
        description: `95th percentile response time is ${metrics.responseTime.p95.toFixed(2)}ms`,
        impact: 'medium',
        recommendations: [
          'Optimize API endpoints',
          'Implement caching',
          'Review database queries',
        ],
      });
    }

    // Memory insights
    if (metrics.memoryUsage.avg > 100 * 1024 * 1024) {
      insights.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: `Average memory usage is ${(metrics.memoryUsage.avg / 1024 / 1024).toFixed(1)}MB`,
        impact: 'medium',
        recommendations: [
          'Check for memory leaks',
          'Optimize data structures',
          'Review caching strategy',
        ],
      });
    }

    // Error rate insights
    if (metrics.errorRate.avg > 5) {
      insights.push({
        type: 'critical',
        title: 'High Error Rate',
        description: `Average error rate is ${metrics.errorRate.avg.toFixed(2)}%`,
        impact: 'high',
        recommendations: [
          'Review error logs',
          'Fix critical bugs',
          'Improve error handling',
        ],
      });
    }

    // Trend insights
    for (const [metric, trend] of Object.entries(trends)) {
      if (trend.direction === 'degrading' && trend.confidence > 0.7) {
        insights.push({
          type: 'warning',
          title: `${metric} Degrading`,
          description: `${metric} has degraded by ${trend.changePercent}%`,
          impact: 'medium',
          recommendations: [
            'Investigate root cause',
            'Implement monitoring',
            'Consider optimization',
          ],
        });
      }
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: MetricAnalysis): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime.p95 > 1000) {
      recommendations.push(
        'Implement response caching to reduce response times'
      );
    }

    if (metrics.memoryUsage.avg > 50 * 1024 * 1024) {
      recommendations.push(
        'Review memory usage patterns and optimize data structures'
      );
    }

    if (metrics.errorRate.avg > 1) {
      recommendations.push(
        'Improve error handling and add more comprehensive logging'
      );
    }

    if (metrics.componentMountTime.avg > 500) {
      recommendations.push(
        'Optimize component rendering and reduce initial bundle size'
      );
    }

    if (metrics.authenticationTime.avg > 1000) {
      recommendations.push(
        'Implement authentication caching and optimize auth flows'
      );
    }

    if (metrics.dataFetchTime.avg > 2000) {
      recommendations.push(
        'Implement data caching and optimize database queries'
      );
    }

    return recommendations;
  }

  /**
   * Get empty report
   */
  private getEmptyReport(): PerformanceReport {
    return {
      period: '0 minutes',
      totalSnapshots: 0,
      metrics: {} as MetricAnalysis,
      trends: {},
      insights: [],
      recommendations: [],
      generatedAt: new Date(),
    };
  }
}

// Types
interface PerformanceReport {
  period: string;
  totalSnapshots: number;
  metrics: MetricAnalysis;
  trends: TrendAnalysis;
  insights: PerformanceInsight[];
  recommendations: string[];
  generatedAt: Date;
}

interface MetricAnalysis {
  responseTime?: MetricStats;
  memoryUsage?: MetricStats;
  errorRate?: MetricStats;
  throughput?: MetricStats;
  componentMountTime?: MetricStats;
  authenticationTime?: MetricStats;
  dataFetchTime?: MetricStats;
  navigationTime?: MetricStats;
}

interface MetricStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  p95: number;
  p99: number;
  count: number;
}

interface TrendAnalysis {
  [metric: string]: TrendData;
}

interface TrendData {
  direction: 'improving' | 'stable' | 'degrading';
  slope: number;
  changePercent: number;
  confidence: number;
}

interface PerformanceInsight {
  type: 'optimization' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Export singleton instance
export const performanceAnalyticsService =
  PerformanceAnalyticsService.getInstance();
