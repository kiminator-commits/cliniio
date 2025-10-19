/**
 * Enhanced Performance Monitoring Service
 * Provides granular metrics for better performance insights
 */

import { performanceMonitor } from './monitoring/PerformanceMonitor';

export interface GranularMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'ui' | 'api' | 'database' | 'memory' | 'network' | 'user-interaction';
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface PerformanceInsight {
  metric: string;
  insight: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

class EnhancedPerformanceService {
  private metrics: GranularMetric[] = [];
  private insights: PerformanceInsight[] = [];
  private readonly MAX_METRICS = 1000;

  /**
   * Track UI performance metrics
   */
  trackUIMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'ms',
      timestamp: new Date(),
      category: 'ui',
      tags,
    });
  }

  /**
   * Track API performance metrics
   */
  trackAPIMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'ms',
      timestamp: new Date(),
      category: 'api',
      tags,
    });
  }

  /**
   * Track database performance metrics
   */
  trackDatabaseMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'ms',
      timestamp: new Date(),
      category: 'database',
      tags,
    });
  }

  /**
   * Track memory usage metrics
   */
  trackMemoryMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'MB',
      timestamp: new Date(),
      category: 'memory',
      tags,
    });
  }

  /**
   * Track network performance metrics
   */
  trackNetworkMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'ms',
      timestamp: new Date(),
      category: 'network',
      tags,
    });
  }

  /**
   * Track user interaction metrics
   */
  trackUserInteractionMetric(name: string, value: number, tags: Record<string, string> = {}) {
    this.addMetric({
      name,
      value,
      unit: 'ms',
      timestamp: new Date(),
      category: 'user-interaction',
      tags,
    });
  }

  /**
   * Add a metric to the collection
   */
  private addMetric(metric: GranularMetric) {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Generate insights for significant metrics
    this.generateInsights(metric);

    // Also send to main performance monitor
    performanceMonitor.recordMetric(
      metric.name,
      metric.value,
      metric.unit,
      metric.tags,
      metric.metadata
    );
  }

  /**
   * Generate performance insights
   */
  private generateInsights(metric: GranularMetric) {
    const insights: PerformanceInsight[] = [];

    // UI Performance Insights
    if (metric.category === 'ui' && metric.value > 100) {
      insights.push({
        metric: metric.name,
        insight: `UI operation took ${metric.value}ms, exceeding recommended 100ms threshold`,
        recommendation: 'Consider optimizing component rendering or using React.memo',
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    // API Performance Insights
    if (metric.category === 'api' && metric.value > 2000) {
      insights.push({
        metric: metric.name,
        insight: `API call took ${metric.value}ms, exceeding recommended 2000ms threshold`,
        recommendation: 'Consider implementing caching or optimizing database queries',
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Memory Performance Insights
    if (metric.category === 'memory' && metric.value > 100) {
      insights.push({
        metric: metric.name,
        insight: `Memory usage is ${metric.value}MB, approaching recommended limit`,
        recommendation: 'Consider implementing memory cleanup or lazy loading',
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    // Add insights to collection
    this.insights.push(...insights);
    
    // Keep only recent insights
    if (this.insights.length > 100) {
      this.insights = this.insights.slice(-100);
    }
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: GranularMetric['category']): GranularMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get recent insights
   */
  getRecentInsights(limit: number = 10): PerformanceInsight[] {
    return this.insights
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const categories = ['ui', 'api', 'database', 'memory', 'network', 'user-interaction'] as const;
    const summary: Record<string, { count: number; avgValue: number; maxValue: number }> = {};

    categories.forEach(category => {
      const categoryMetrics = this.getMetricsByCategory(category);
      if (categoryMetrics.length > 0) {
        const values = categoryMetrics.map(m => m.value);
        summary[category] = {
          count: categoryMetrics.length,
          avgValue: values.reduce((a, b) => a + b, 0) / values.length,
          maxValue: Math.max(...values),
        };
      }
    });

    return {
      totalMetrics: this.metrics.length,
      totalInsights: this.insights.length,
      categories: summary,
      recentInsights: this.getRecentInsights(5),
    };
  }

  /**
   * Clear old metrics
   */
  clearOldMetrics(olderThanHours: number = 24) {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    this.insights = this.insights.filter(i => i.timestamp > cutoffTime);
  }
}

export const enhancedPerformanceService = new EnhancedPerformanceService();
