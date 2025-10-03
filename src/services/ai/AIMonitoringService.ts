import { logger } from '../../utils/_core/logger';

export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
  queueLength: number;
  activeRequests: number;
  lastUpdated: Date;
}

export interface ServiceMetrics {
  [service: string]: {
    requests: number;
    successes: number;
    failures: number;
    avgResponseTime: number;
    lastRequest: Date;
  };
}

export interface PerformanceAlert {
  id: string;
  type:
    | 'high_error_rate'
    | 'slow_response'
    | 'high_queue_length'
    | 'rate_limit_exceeded';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class AIMonitoringService {
  private static instance: AIMonitoringService;
  private metrics: AIMetrics;
  private serviceMetrics: ServiceMetrics = {};
  private alerts: PerformanceAlert[] = [];
  private requestTimes: number[] = [];
  private readonly MAX_REQUEST_TIMES = 1000; // Keep last 1000 request times

  private constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      queueLength: 0,
      activeRequests: 0,
      lastUpdated: new Date(),
    };
  }

  static getInstance(): AIMonitoringService {
    if (!AIMonitoringService.instance) {
      AIMonitoringService.instance = new AIMonitoringService();
    }
    return AIMonitoringService.instance;
  }

  /**
   * Record a request
   */
  recordRequest(
    service: string,
    success: boolean,
    responseTime: number,
    fromCache: boolean = false,
    rateLimited: boolean = false
  ): void {
    const now = new Date();

    // Update overall metrics
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    if (fromCache) {
      this.metrics.cacheHitRate =
        (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1) + 1) /
        this.metrics.totalRequests;
    } else {
      this.metrics.cacheHitRate =
        (this.metrics.cacheHitRate * (this.metrics.totalRequests - 1)) /
        this.metrics.totalRequests;
    }

    if (rateLimited) {
      this.metrics.rateLimitHits++;
    }

    // Update response time
    this.requestTimes.push(responseTime);
    if (this.requestTimes.length > this.MAX_REQUEST_TIMES) {
      this.requestTimes.shift();
    }
    this.metrics.averageResponseTime = this.calculateAverageResponseTime();

    // Update service metrics
    if (!this.serviceMetrics[service]) {
      this.serviceMetrics[service] = {
        requests: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0,
        lastRequest: now,
      };
    }

    const serviceMetric = this.serviceMetrics[service];
    serviceMetric.requests++;
    serviceMetric.lastRequest = now;

    if (success) {
      serviceMetric.successes++;
    } else {
      serviceMetric.failures++;
    }

    // Update service average response time
    serviceMetric.avgResponseTime =
      (serviceMetric.avgResponseTime * (serviceMetric.requests - 1) +
        responseTime) /
      serviceMetric.requests;

    this.metrics.lastUpdated = now;

    // Check for alerts
    this.checkAlerts(service, success, responseTime);
  }

  /**
   * Update queue metrics
   */
  updateQueueMetrics(queueLength: number, activeRequests: number): void {
    this.metrics.queueLength = queueLength;
    this.metrics.activeRequests = activeRequests;
    this.metrics.lastUpdated = new Date();
  }

  /**
   * Get current metrics
   */
  getMetrics(): AIMetrics {
    return { ...this.metrics };
  }

  /**
   * Get service-specific metrics
   */
  getServiceMetrics(): ServiceMetrics {
    return { ...this.serviceMetrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 24 * 60 * 60 * 1000): void {
    // 24 hours
    const cutoff = new Date(Date.now() - maxAge);
    this.alerts = this.alerts.filter((alert) => alert.timestamp > cutoff);
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check error rate
    const errorRate =
      this.metrics.totalRequests > 0
        ? this.metrics.failedRequests / this.metrics.totalRequests
        : 0;
    if (errorRate > 0.1) {
      // 10% error rate
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
      recommendations.push(
        'Investigate failed requests and improve error handling'
      );
    }

    // Check response time
    if (this.metrics.averageResponseTime > 5000) {
      // 5 seconds
      issues.push(
        `Slow response time: ${this.metrics.averageResponseTime.toFixed(0)}ms`
      );
      recommendations.push('Optimize AI operations and consider caching');
    }

    // Check queue length
    if (this.metrics.queueLength > 50) {
      issues.push(`High queue length: ${this.metrics.queueLength}`);
      recommendations.push(
        'Increase processing capacity or optimize request handling'
      );
    }

    // Check cache hit rate
    if (this.metrics.cacheHitRate < 0.3) {
      // 30% cache hit rate
      issues.push(
        `Low cache hit rate: ${(this.metrics.cacheHitRate * 100).toFixed(1)}%`
      );
      recommendations.push('Improve caching strategy and cache more responses');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    if (this.requestTimes.length === 0) return 0;
    return (
      this.requestTimes.reduce((sum, time) => sum + time, 0) /
      this.requestTimes.length
    );
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(
    service: string,
    success: boolean,
    responseTime: number
  ): void {
    // Check for high error rate
    if (!success) {
      const serviceMetric = this.serviceMetrics[service];
      if (serviceMetric && serviceMetric.requests > 10) {
        const errorRate = serviceMetric.failures / serviceMetric.requests;
        if (errorRate > 0.2) {
          // 20% error rate
          this.addAlert({
            type: 'high_error_rate',
            severity: 'critical',
            message: `High error rate for ${service}: ${(errorRate * 100).toFixed(1)}%`,
            metadata: { service, errorRate },
          });
        }
      }
    }

    // Check for slow response time
    if (responseTime > 10000) {
      // 10 seconds
      this.addAlert({
        type: 'slow_response',
        severity: 'warning',
        message: `Slow response time for ${service}: ${responseTime}ms`,
        metadata: { service, responseTime },
      });
    }

    // Check for high queue length
    if (this.metrics.queueLength > 100) {
      this.addAlert({
        type: 'high_queue_length',
        severity: 'critical',
        message: `High queue length: ${this.metrics.queueLength}`,
        metadata: { queueLength: this.metrics.queueLength },
      });
    }

    // Check for rate limit hits
    if (this.metrics.rateLimitHits > 10) {
      this.addAlert({
        type: 'rate_limit_exceeded',
        severity: 'warning',
        message: `Rate limit exceeded ${this.metrics.rateLimitHits} times`,
        metadata: { rateLimitHits: this.metrics.rateLimitHits },
      });
    }
  }

  /**
   * Add a performance alert
   */
  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.alerts.push(newAlert);
    logger.warn(`AI Performance Alert: ${newAlert.message}`, newAlert);
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      queueLength: 0,
      activeRequests: 0,
      lastUpdated: new Date(),
    };

    this.serviceMetrics = {};
    this.alerts = [];
    this.requestTimes = [];

    logger.info('AI monitoring metrics reset');
  }
}

// Singleton instance
export const aiMonitoringService = AIMonitoringService.getInstance();
