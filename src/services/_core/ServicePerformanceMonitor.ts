// ============================================================================
// SERVICE PERFORMANCE MONITOR - Centralized Service Monitoring
// ============================================================================

interface ServiceMetrics {
  serviceName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  lastCallTime: number;
  errorRate: number;
  uptime: number;
}

interface ServiceCall {
  serviceName: string;
  methodName: string;
  startTime: number;
  endTime?: number;
  success?: boolean;
  error?: string;
  responseTime?: number;
}

interface PerformanceThresholds {
  maxResponseTime: number; // milliseconds
  maxErrorRate: number; // percentage (0-100)
  maxCallsPerMinute: number;
}

/**
 * Service Performance Monitor - Tracks and monitors service performance
 */
export class ServicePerformanceMonitor {
  private static instance: ServicePerformanceMonitor;
  private metrics: Map<string, ServiceMetrics> = new Map();
  private callHistory: ServiceCall[] = [];
  private thresholds: PerformanceThresholds = {
    maxResponseTime: 5000, // 5 seconds
    maxErrorRate: 10, // 10%
    maxCallsPerMinute: 100,
  };

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): ServicePerformanceMonitor {
    if (!ServicePerformanceMonitor.instance) {
      ServicePerformanceMonitor.instance = new ServicePerformanceMonitor();
    }
    return ServicePerformanceMonitor.instance;
  }

  // ============================================================================
  // SERVICE CALL TRACKING
  // ============================================================================

  /**
   * Start tracking a service call
   */
  startCall(serviceName: string, methodName: string): string {
    const callId = `${serviceName}.${methodName}.${Date.now()}`;
    const call: ServiceCall = {
      serviceName,
      methodName,
      startTime: Date.now(),
    };

    this.callHistory.push(call);
    return callId;
  }

  /**
   * End tracking a service call
   */
  endCall(callId: string, success: boolean, error?: string): void {
    const call = this.callHistory.find(
      (c) => `${c.serviceName}.${c.methodName}.${c.startTime}` === callId
    );

    if (!call) {
      console.warn(`[ServiceMonitor] Call ${callId} not found`);
      return;
    }

    call.endTime = Date.now();
    call.success = success;
    call.error = error;
    call.responseTime = call.endTime - call.startTime;

    this.updateMetrics(call);
  }

  // ============================================================================
  // METRICS MANAGEMENT
  // ============================================================================

  /**
   * Update service metrics based on call data
   */
  private updateMetrics(call: ServiceCall): void {
    const serviceName = call.serviceName;
    const existingMetrics = this.metrics.get(serviceName) || {
      serviceName,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      lastCallTime: 0,
      errorRate: 0,
      uptime: 0,
    };

    // Update call counts
    existingMetrics.totalCalls++;
    if (call.success) {
      existingMetrics.successfulCalls++;
    } else {
      existingMetrics.failedCalls++;
    }

    // Update response time (rolling average)
    if (call.responseTime) {
      const totalResponseTime =
        existingMetrics.averageResponseTime * (existingMetrics.totalCalls - 1) +
        call.responseTime;
      existingMetrics.averageResponseTime =
        totalResponseTime / existingMetrics.totalCalls;
    }

    // Update error rate
    existingMetrics.errorRate =
      (existingMetrics.failedCalls / existingMetrics.totalCalls) * 100;

    // Update last call time
    existingMetrics.lastCallTime = call.endTime || call.startTime;

    // Update uptime (time since first call)
    const firstCall = this.callHistory.find(
      (c) => c.serviceName === serviceName
    );
    if (firstCall) {
      existingMetrics.uptime = call.endTime! - firstCall.startTime;
    }

    this.metrics.set(serviceName, existingMetrics);

    // Check for performance issues
    this.checkPerformanceIssues(existingMetrics);
  }

  // ============================================================================
  // PERFORMANCE MONITORING
  // ============================================================================

  /**
   * Check for performance issues and alert if necessary
   */
  private checkPerformanceIssues(metrics: ServiceMetrics): void {
    const issues: string[] = [];

    // Check response time
    if (metrics.averageResponseTime > this.thresholds.maxResponseTime) {
      issues.push(
        `High response time: ${metrics.averageResponseTime}ms (threshold: ${this.thresholds.maxResponseTime}ms)`
      );
    }

    // Check error rate
    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      issues.push(
        `High error rate: ${metrics.errorRate.toFixed(2)}% (threshold: ${this.thresholds.maxErrorRate}%)`
      );
    }

    // Check call frequency
    const callsLastMinute = this.getCallsLastMinute(metrics.serviceName);
    if (callsLastMinute > this.thresholds.maxCallsPerMinute) {
      issues.push(
        `High call frequency: ${callsLastMinute} calls/minute (threshold: ${this.thresholds.maxCallsPerMinute})`
      );
    }

    if (issues.length > 0) {
      console.warn(
        `[ServiceMonitor] Performance issues detected for ${metrics.serviceName}:`,
        issues
      );
      this.alertPerformanceIssues(metrics.serviceName, issues);
    }
  }

  /**
   * Get number of calls in the last minute
   */
  private getCallsLastMinute(serviceName: string): number {
    const oneMinuteAgo = Date.now() - 60000;
    return this.callHistory.filter(
      (call) =>
        call.serviceName === serviceName && call.startTime > oneMinuteAgo
    ).length;
  }

  /**
   * Alert about performance issues
   */
  private alertPerformanceIssues(serviceName: string, issues: string[]): void {
    // In a real application, this could send alerts to monitoring systems
    console.error(
      `[ServiceMonitor] ALERT: ${serviceName} has performance issues:`,
      issues
    );

    // Could integrate with external monitoring services here
    // Example: sendToMonitoringService({ serviceName, issues, timestamp: Date.now() });
  }

  // ============================================================================
  // METRICS RETRIEVAL
  // ============================================================================

  /**
   * Get metrics for a specific service
   */
  getServiceMetrics(serviceName: string): ServiceMetrics | null {
    return this.metrics.get(serviceName) || null;
  }

  /**
   * Get all service metrics
   */
  getAllMetrics(): ServiceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get top performing services
   */
  getTopPerformingServices(limit: number = 5): ServiceMetrics[] {
    return this.getAllMetrics()
      .sort((a, b) => a.errorRate - b.errorRate)
      .slice(0, limit);
  }

  /**
   * Get services with performance issues
   */
  getServicesWithIssues(): ServiceMetrics[] {
    return this.getAllMetrics().filter(
      (metrics) =>
        metrics.errorRate > this.thresholds.maxErrorRate ||
        metrics.averageResponseTime > this.thresholds.maxResponseTime
    );
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log(
      '[ServiceMonitor] Performance thresholds updated:',
      this.thresholds
    );
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  // ============================================================================
  // CLEANUP AND MAINTENANCE
  // ============================================================================

  /**
   * Start cleanup interval to remove old call history
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupOldCalls();
    }, 300000); // Clean up every 5 minutes
  }

  /**
   * Remove call history older than 1 hour
   */
  private cleanupOldCalls(): void {
    const oneHourAgo = Date.now() - 3600000;
    const initialLength = this.callHistory.length;

    this.callHistory = this.callHistory.filter(
      (call) => call.startTime > oneHourAgo
    );

    const removedCount = initialLength - this.callHistory.length;
    if (removedCount > 0) {
      console.log(
        `[ServiceMonitor] Cleaned up ${removedCount} old call records`
      );
    }
  }

  /**
   * Reset all metrics (useful for testing)
   */
  resetMetrics(): void {
    this.metrics.clear();
    this.callHistory = [];
    console.log('[ServiceMonitor] All metrics reset');
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(): {
    metrics: ServiceMetrics[];
    callHistory: ServiceCall[];
    thresholds: PerformanceThresholds;
    exportTime: number;
  } {
    return {
      metrics: this.getAllMetrics(),
      callHistory: [...this.callHistory],
      thresholds: this.getThresholds(),
      exportTime: Date.now(),
    };
  }
}

// Export singleton instance
export const servicePerformanceMonitor =
  ServicePerformanceMonitor.getInstance();
