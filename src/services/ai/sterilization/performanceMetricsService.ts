import { supabase } from '../../../lib/supabaseClient';

export interface PerformanceMetric {
  id?: string;
  facility_id: string;
  service_name: string;
  operation_name: string;
  processing_time_ms: number;
  success: boolean;
  error_message?: string;
  input_size_bytes?: number;
  output_size_bytes?: number;
  ai_model_used?: string;
  confidence_score?: number;
  user_id?: string;
  created_at?: string;
}

export interface PerformanceSummary {
  totalOperations: number;
  successRate: number;
  averageProcessingTime: number;
  medianProcessingTime: number;
  p95ProcessingTime: number;
  p99ProcessingTime: number;
  totalErrors: number;
  errorRate: number;
  performanceTrend: 'improving' | 'stable' | 'degrading';
  recommendations: string[];
}

export interface ServicePerformance {
  serviceName: string;
  operationCount: number;
  successRate: number;
  averageTime: number;
  totalErrors: number;
  lastOperation: string;
  performanceScore: number;
}

export class PerformanceMetricsService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  /**
   * Record a performance metric
   */
  async recordMetric(
    metric: Omit<PerformanceMetric, 'id' | 'facility_id' | 'created_at'>
  ): Promise<string | null> {
    try {
      const metricData: Partial<PerformanceMetric> = {
        facility_id: this.facilityId,
        ...metric,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .insert(metricData)
        .select('id')
        .single();

      if (error) {
        console.error('Error recording performance metric:', error);
        return null;
      }

      return (data as { id: string }).id;
    } catch (error) {
      console.error('Error recording performance metric:', error);
      return null;
    }
  }

  /**
   * Get performance summary for a specific time period
   */
  async getPerformanceSummary(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
    serviceName?: string
  ): Promise<PerformanceSummary> {
    try {
      const startDate = this.getStartDate(timeRange);

      let query = supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('facility_id', this.facilityId)
        .gte('created_at', startDate.toISOString());

      if (serviceName) {
        query = query.eq('service_name', serviceName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching performance metrics:', error);
        return this.getDefaultPerformanceSummary();
      }

      return this.calculatePerformanceSummary(
        (data || []) as unknown as PerformanceMetric[]
      );
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return this.getDefaultPerformanceSummary();
    }
  }

  /**
   * Get performance metrics by service
   */
  async getServicePerformance(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<ServicePerformance[]> {
    try {
      const startDate = this.getStartDate(timeRange);

      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('facility_id', this.facilityId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching service performance:', error);
        return [];
      }

      return this.calculateServicePerformance(
        (data || []) as unknown as PerformanceMetric[]
      );
    } catch (error) {
      console.error('Error getting service performance:', error);
      return [];
    }
  }

  /**
   * Get detailed performance metrics with filtering
   */
  async getDetailedMetrics(filters: {
    serviceName?: string;
    operationName?: string;
    success?: boolean;
    timeRange?: 'hour' | 'day' | 'week' | 'month';
    limit?: number;
  }): Promise<PerformanceMetric[]> {
    try {
      const startDate = this.getStartDate(filters.timeRange || 'day');

      let query = supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('facility_id', this.facilityId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (filters.serviceName) {
        query = query.eq('service_name', filters.serviceName);
      }

      if (filters.operationName) {
        query = query.eq('operation_name', filters.operationName);
      }

      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching detailed metrics:', error);
        return [];
      }

      return data as unknown as PerformanceMetric[];
    } catch (error) {
      console.error('Error getting detailed metrics:', error);
      return [];
    }
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    timeRange: 'week' | 'month' | 'quarter' = 'month',
    serviceName?: string
  ): Promise<{
    dates: string[];
    processingTimes: number[];
    successRates: number[];
    operationCounts: number[];
  }> {
    try {
      const startDate = this.getStartDate(timeRange);
      const interval = this.getInterval(timeRange);

      let query = supabase
        .from('ai_performance_metrics')
        .select('*')
        .eq('facility_id', this.facilityId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (serviceName) {
        query = query.eq('service_name', serviceName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching performance trends:', error);
        return {
          dates: [],
          processingTimes: [],
          successRates: [],
          operationCounts: [],
        };
      }

      return this.calculateTrends(
        (data || []) as unknown as PerformanceMetric[],
        interval
      );
    } catch (error) {
      console.error('Error getting performance trends:', error);
      return {
        dates: [],
        processingTimes: [],
        successRates: [],
        operationCounts: [],
      };
    }
  }

  /**
   * Get optimization recommendations based on performance data
   */
  async getOptimizationRecommendations(): Promise<string[]> {
    try {
      const summary = await this.getPerformanceSummary('week');
      const recommendations: string[] = [];

      // Processing time recommendations
      if (summary.averageProcessingTime > 5000) {
        recommendations.push(
          'Consider optimizing AI model selection or reducing input complexity'
        );
      }

      if (summary.p95ProcessingTime > 10000) {
        recommendations.push(
          'Investigate performance bottlenecks in AI service calls'
        );
      }

      // Success rate recommendations
      if (summary.successRate < 0.9) {
        recommendations.push(
          'Review error patterns and improve error handling'
        );
      }

      if (summary.errorRate > 0.1) {
        recommendations.push(
          'Implement retry mechanisms and fallback strategies'
        );
      }

      // Performance trend recommendations
      if (summary.performanceTrend === 'degrading') {
        recommendations.push(
          'Monitor system resources and consider scaling AI services'
        );
      }

      // Add general recommendations
      if (recommendations.length === 0) {
        recommendations.push(
          'Performance is within acceptable ranges - continue monitoring'
        );
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }

  /**
   * Clean up old performance metrics
   */
  async cleanupOldMetrics(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(
        Date.now() - retentionDays * 24 * 60 * 60 * 1000
      );

      const { data, error } = await supabase
        .from('ai_performance_metrics')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('facility_id', this.facilityId)
        .select('id');

      if (error) {
        console.error('Error cleaning up old metrics:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
      return 0;
    }
  }

  // Private helper methods

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private getInterval(timeRange: string): number {
    switch (timeRange) {
      case 'week':
        return 24 * 60 * 60 * 1000; // Daily
      case 'month':
        return 24 * 60 * 60 * 1000; // Daily
      case 'quarter':
        return 7 * 24 * 60 * 60 * 1000; // Weekly
      default:
        return 24 * 60 * 60 * 1000; // Daily
    }
  }

  private calculatePerformanceSummary(
    metrics: PerformanceMetric[]
  ): PerformanceSummary {
    if (metrics.length === 0) {
      return this.getDefaultPerformanceSummary();
    }

    const processingTimes = metrics
      .map((m) => m.processing_time_ms)
      .filter((t) => t > 0);
    const successfulOperations = metrics.filter((m) => m.success);
    const errors = metrics.filter((m) => !m.success);

    const sortedTimes = processingTimes.sort((a, b) => a - b);
    const totalOperations = metrics.length;
    const successRate = successfulOperations.length / totalOperations;
    const averageProcessingTime =
      processingTimes.reduce((sum, time) => sum + time, 0) /
      processingTimes.length;
    const medianProcessingTime =
      sortedTimes[Math.floor(sortedTimes.length / 2)];
    const p95ProcessingTime =
      sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99ProcessingTime =
      sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    // Calculate performance trend (simplified)
    const recentMetrics = metrics.slice(-10);
    const recentAvg =
      recentMetrics.reduce((sum, m) => sum + m.processing_time_ms, 0) /
      recentMetrics.length;
    const performanceTrend =
      recentAvg < averageProcessingTime * 0.9
        ? 'improving'
        : recentAvg > averageProcessingTime * 1.1
          ? 'degrading'
          : 'stable';

    return {
      totalOperations,
      successRate,
      averageProcessingTime,
      medianProcessingTime,
      p95ProcessingTime,
      p99ProcessingTime,
      totalErrors: errors.length,
      errorRate: errors.length / totalOperations,
      performanceTrend,
      recommendations: this.generateRecommendations(metrics),
    };
  }

  private calculateServicePerformance(
    metrics: PerformanceMetric[]
  ): ServicePerformance[] {
    const serviceMap = new Map<string, PerformanceMetric[]>();

    // Group metrics by service
    metrics.forEach((metric) => {
      if (!serviceMap.has(metric.service_name)) {
        serviceMap.set(metric.service_name, []);
      }
      serviceMap.get(metric.service_name)!.push(metric);
    });

    return Array.from(serviceMap.entries())
      .map(([serviceName, serviceMetrics]) => {
        const processingTimes = serviceMetrics
          .map((m) => m.processing_time_ms)
          .filter((t) => t > 0);
        const successfulOperations = serviceMetrics.filter((m) => m.success);
        const lastOperation = serviceMetrics[0]?.created_at || '';

        const operationCount = serviceMetrics.length;
        const successRate = successfulOperations.length / operationCount;
        const averageTime =
          processingTimes.length > 0
            ? processingTimes.reduce((sum, time) => sum + time, 0) /
              processingTimes.length
            : 0;

        // Calculate performance score (0-100)
        const timeScore = Math.max(0, 100 - averageTime / 100); // Lower time = higher score
        const successScore = successRate * 100;
        const performanceScore = Math.round((timeScore + successScore) / 2);

        return {
          serviceName,
          operationCount,
          successRate,
          averageTime,
          totalErrors: serviceMetrics.filter((m) => !m.success).length,
          lastOperation,
          performanceScore,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }

  private calculateTrends(
    metrics: PerformanceMetric[],
    interval: number
  ): {
    dates: string[];
    processingTimes: number[];
    successRates: number[];
    operationCounts: number[];
  } {
    const now = new Date();
    const buckets = new Map<
      string,
      { times: number[]; success: number; total: number }
    >();

    // Initialize buckets
    for (let i = 0; i < 10; i++) {
      const bucketDate = new Date(now.getTime() - i * interval);
      const bucketKey = bucketDate.toISOString().split('T')[0];
      buckets.set(bucketKey, { times: [], success: 0, total: 0 });
    }

    // Group metrics into buckets
    metrics.forEach((metric) => {
      const bucketKey = new Date(metric.created_at!)
        .toISOString()
        .split('T')[0];
      const bucket = buckets.get(bucketKey);
      if (bucket) {
        bucket.times.push(metric.processing_time_ms);
        bucket.total++;
        if (metric.success) bucket.success++;
      }
    });

    // Convert buckets to arrays
    const sortedBuckets = Array.from(buckets.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    return {
      dates: sortedBuckets.map(([date]) => date),
      processingTimes: sortedBuckets.map(([, data]) =>
        data.times.length > 0
          ? data.times.reduce((sum, time) => sum + time, 0) / data.times.length
          : 0
      ),
      successRates: sortedBuckets.map(([, data]) =>
        data.total > 0 ? data.success / data.total : 0
      ),
      operationCounts: sortedBuckets.map(([, data]) => data.total),
    };
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    if (metrics.length === 0) {
      return ['No performance data available for recommendations'];
    }

    const avgTime =
      metrics.reduce((sum, m) => sum + m.processing_time_ms, 0) /
      metrics.length;
    const successRate =
      metrics.filter((m) => m.success).length / metrics.length;

    if (avgTime > 5000) {
      recommendations.push(
        'Consider optimizing AI model selection for faster processing'
      );
    }

    if (successRate < 0.9) {
      recommendations.push(
        'Review error patterns and implement better error handling'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable ranges');
    }

    return recommendations;
  }

  private getDefaultPerformanceSummary(): PerformanceSummary {
    return {
      totalOperations: 0,
      successRate: 0,
      averageProcessingTime: 0,
      medianProcessingTime: 0,
      p95ProcessingTime: 0,
      p99ProcessingTime: 0,
      totalErrors: 0,
      errorRate: 0,
      performanceTrend: 'stable',
      recommendations: ['No performance data available'],
    };
  }
}
