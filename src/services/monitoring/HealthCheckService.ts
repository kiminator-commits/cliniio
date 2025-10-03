import { supabase } from '../../lib/supabaseClient';
import { performanceMonitor } from './PerformanceMonitor';
import { distributedFacilityCache } from '../cache/DistributedFacilityCache';
import { subscriptionManager } from '../realtime/SubscriptionManager';
import { aiMonitoringService } from '../ai/AIMonitoringService';
import { logger } from '../../utils/_core/logger';

export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  score: number; // 0-100
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  timestamp: Date;
  uptime: number;
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private startTime: Date;
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map();

  private constructor() {
    this.startTime = new Date();
    this.initializeChecks();
  }

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const checkResults: HealthCheckResult[] = [];

    // Run all registered checks
    for (const [name, checkFn] of this.checks) {
      try {
        const result = await checkFn();
        checkResults.push(result);
      } catch (error) {
        checkResults.push({
          name,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration: 0,
          timestamp: new Date(),
        });
      }
    }

    // Calculate overall health
    const summary = this.calculateSummary(checkResults);
    const overall = this.determineOverallHealth(summary);
    const score = this.calculateHealthScore(summary);

    const report: SystemHealthReport = {
      overall,
      score,
      checks: checkResults,
      summary,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    };

    // Record performance metrics
    performanceMonitor.recordMetric(
      'health_check_duration',
      Date.now() - startTime,
      'ms',
      {
        status: overall,
      }
    );

    logger.info('Health check completed', { overall, score, summary });

    return report;
  }

  /**
   * Run a specific health check
   */
  async runCheck(name: string): Promise<HealthCheckResult | null> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return null;
    }

    try {
      return await checkFn();
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add a custom health check
   */
  addCheck(name: string, checkFn: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, checkFn);
    logger.info(`Health check added: ${name}`);
  }

  /**
   * Remove a health check
   */
  removeCheck(name: string): void {
    this.checks.delete(name);
    logger.info(`Health check removed: ${name}`);
  }

  /**
   * Get list of available checks
   */
  getAvailableChecks(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Initialize default health checks
   */
  private initializeChecks(): void {
    // Database connectivity
    this.addCheck('database', async () => {
      const start = Date.now();
      try {
        const { error } = await supabase
          .from('facilities')
          .select('id')
          .limit(1);

        const duration = Date.now() - start;

        if (error) {
          return {
            name: 'database',
            status: 'unhealthy',
            message: `Database error: ${error.message}`,
            duration,
            timestamp: new Date(),
          };
        }

        return {
          name: 'database',
          status: 'healthy',
          message: 'Database connection successful',
          duration,
          timestamp: new Date(),
          metadata: { queryTime: duration },
        };
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy',
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });

    // Cache system
    this.addCheck('cache', async () => {
      const start = Date.now();
      try {
        const stats = distributedFacilityCache.getStats();
        const duration = Date.now() - start;

        return {
          name: 'cache',
          status: 'healthy',
          message: `Cache system operational (${stats.isRedis ? 'Redis' : 'Memory'})`,
          duration,
          timestamp: new Date(),
          metadata: stats,
        };
      } catch (error) {
        return {
          name: 'cache',
          status: 'degraded',
          message: `Cache system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });

    // Real-time subscriptions
    this.addCheck('realtime', async () => {
      const start = Date.now();
      try {
        const stats = subscriptionManager.getStats();
        const duration = Date.now() - start;

        const isHealthy = stats.totalSubscriptions < 1000; // Reasonable limit
        const status = isHealthy ? 'healthy' : 'degraded';

        return {
          name: 'realtime',
          status,
          message: `${stats.totalSubscriptions} active subscriptions`,
          duration,
          timestamp: new Date(),
          metadata: stats,
        };
      } catch (error) {
        return {
          name: 'realtime',
          status: 'unhealthy',
          message: `Real-time system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });

    // AI services
    this.addCheck('ai_services', async () => {
      const start = Date.now();
      try {
        const metrics = aiMonitoringService.getMetrics();
        const duration = Date.now() - start;

        const errorRate =
          metrics.totalRequests > 0
            ? (metrics.failedRequests / metrics.totalRequests) * 100
            : 0;
        const isHealthy = errorRate < 10; // Less than 10% error rate
        const status = isHealthy ? 'healthy' : 'degraded';

        return {
          name: 'ai_services',
          status,
          message: `AI services operational (${errorRate.toFixed(1)}% error rate)`,
          duration,
          timestamp: new Date(),
          metadata: metrics,
        };
      } catch (error) {
        return {
          name: 'ai_services',
          status: 'unhealthy',
          message: `AI services error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });

    // Memory usage
    this.addCheck('memory', async () => {
      const start = Date.now();
      try {
        const memoryStats =
          performanceMonitor.getAggregatedMetrics('memory_usage');
        const duration = Date.now() - start;

        const memoryMB = memoryStats.avg / 1024 / 1024;
        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (memoryMB > 500) {
          status = 'unhealthy';
        } else if (memoryMB > 200) {
          status = 'degraded';
        }

        return {
          name: 'memory',
          status,
          message: `Memory usage: ${memoryMB.toFixed(1)}MB`,
          duration,
          timestamp: new Date(),
          metadata: { memoryMB, avg: memoryStats.avg },
        };
      } catch (error) {
        return {
          name: 'memory',
          status: 'unhealthy',
          message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });

    // Response time
    this.addCheck('response_time', async () => {
      const start = Date.now();
      try {
        const responseStats =
          performanceMonitor.getAggregatedMetrics('response_time');
        const duration = Date.now() - start;

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

        if (responseStats.avg > 5000) {
          status = 'unhealthy';
        } else if (responseStats.avg > 1000) {
          status = 'degraded';
        }

        return {
          name: 'response_time',
          status,
          message: `Average response time: ${responseStats.avg.toFixed(0)}ms`,
          duration,
          timestamp: new Date(),
          metadata: responseStats,
        };
      } catch (error) {
        return {
          name: 'response_time',
          status: 'unhealthy',
          message: `Response time check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration: Date.now() - start,
          timestamp: new Date(),
        };
      }
    });
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(checks: HealthCheckResult[]): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  } {
    return {
      total: checks.length,
      healthy: checks.filter((c) => c.status === 'healthy').length,
      degraded: checks.filter((c) => c.status === 'degraded').length,
      unhealthy: checks.filter((c) => c.status === 'unhealthy').length,
    };
  }

  /**
   * Determine overall health status
   */
  private determineOverallHealth(summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  }): 'healthy' | 'degraded' | 'unhealthy' {
    if (summary.unhealthy > 0) {
      return 'unhealthy';
    }
    if (summary.degraded > 0) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Calculate health score (0-100)
   */
  private calculateHealthScore(summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  }): number {
    if (summary.total === 0) return 0;

    const healthyWeight = 1;
    const degradedWeight = 0.5;
    const unhealthyWeight = 0;

    const score =
      ((summary.healthy * healthyWeight +
        summary.degraded * degradedWeight +
        summary.unhealthy * unhealthyWeight) /
        summary.total) *
      100;

    return Math.round(score);
  }
}

// Singleton instance
export const healthCheckService = HealthCheckService.getInstance();
