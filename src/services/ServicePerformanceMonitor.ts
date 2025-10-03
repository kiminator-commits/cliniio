import { performanceMonitor } from './monitoring/PerformanceMonitor';
import { serviceRegistry } from './ServiceRegistry';

/**
 * Service Performance Monitor
 * Tracks performance metrics for all services
 */
export class ServicePerformanceMonitor {
  private static instance: ServicePerformanceMonitor | null = null;
  private serviceMetrics: Map<string, ServiceMetrics> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): ServicePerformanceMonitor {
    if (!ServicePerformanceMonitor.instance) {
      ServicePerformanceMonitor.instance = new ServicePerformanceMonitor();
    }
    return ServicePerformanceMonitor.instance;
  }

  /**
   * Start monitoring services
   */
  private startMonitoring(): void {
    // Only start monitoring in production or when explicitly enabled
    const isDevelopment = import.meta.env.DEV;
    const enableMonitoring =
      import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (isDevelopment && !enableMonitoring) {
      console.log(
        'Service performance monitoring disabled in development mode'
      );
      return;
    }

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect metrics for all services
   */
  private collectMetrics(): void {
    const serviceNames = serviceRegistry.getServiceNames();

    for (const serviceName of serviceNames) {
      try {
        const service = serviceRegistry.get(serviceName);
        this.updateServiceMetrics(serviceName, service);
      } catch (error) {
        console.warn(
          `[ServicePerformanceMonitor] Failed to collect metrics for '${serviceName}':`,
          error
        );
      }
    }
  }

  /**
   * Update metrics for a specific service
   */
  private updateServiceMetrics(serviceName: string, service: unknown): void {
    const metrics = this.serviceMetrics.get(serviceName) || {
      serviceName,
      instanceCount: 0,
      memoryUsage: 0,
      lastAccessed: Date.now(),
      accessCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
    };

    // Update instance count
    metrics.instanceCount = this.countInstances(service);

    // Update memory usage (simplified calculation)
    metrics.memoryUsage = this.estimateMemoryUsage(service);

    // Update access count
    metrics.accessCount++;
    metrics.lastAccessed = Date.now();

    this.serviceMetrics.set(serviceName, metrics);

    // Record performance metrics
    performanceMonitor.recordMetric(
      'service_instance_count',
      metrics.instanceCount,
      'count',
      {
        service: serviceName,
      }
    );

    performanceMonitor.recordMetric(
      'service_memory_usage',
      metrics.memoryUsage,
      'bytes',
      {
        service: serviceName,
      }
    );
  }

  /**
   * Count service instances (simplified)
   */
  private countInstances(_service: unknown): number {
    // This is a simplified implementation
    // In practice, you'd need more sophisticated instance counting
    // Could analyze the service object to determine instance count
    return 1;
  }

  /**
   * Estimate memory usage (simplified)
   */
  private estimateMemoryUsage(service: unknown): number {
    // This is a simplified implementation
    // In practice, you'd use more sophisticated memory estimation
    if (typeof service === 'object' && service !== null) {
      return JSON.stringify(service).length * 2; // Rough estimate
    }
    return 0;
  }

  /**
   * Get service metrics
   */
  getServiceMetrics(serviceName: string): ServiceMetrics | undefined {
    return this.serviceMetrics.get(serviceName);
  }

  /**
   * Get all service metrics
   */
  getAllServiceMetrics(): Map<string, ServiceMetrics> {
    return new Map(this.serviceMetrics);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): PerformanceSummary {
    const metrics = Array.from(this.serviceMetrics.values());

    return {
      totalServices: metrics.length,
      totalInstances: metrics.reduce((sum, m) => sum + m.instanceCount, 0),
      totalMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      averageResponseTime:
        metrics.reduce((sum, m) => sum + m.averageResponseTime, 0) /
        metrics.length,
      servicesWithIssues: metrics.filter((m) => m.errorCount > 0).length,
    };
  }

  /**
   * Get services with performance issues
   */
  getServicesWithIssues(): ServiceMetrics[] {
    return Array.from(this.serviceMetrics.values()).filter(
      (metrics) =>
        metrics.errorCount > 0 ||
        metrics.instanceCount > 1 ||
        metrics.memoryUsage > 1000000 // > 1MB
    );
  }
}

// Types
interface ServiceMetrics {
  serviceName: string;
  instanceCount: number;
  memoryUsage: number;
  lastAccessed: number;
  accessCount: number;
  errorCount: number;
  averageResponseTime: number;
}

interface PerformanceSummary {
  totalServices: number;
  totalInstances: number;
  totalMemoryUsage: number;
  averageResponseTime: number;
  servicesWithIssues: number;
}

// Export singleton instance
export const servicePerformanceMonitor =
  ServicePerformanceMonitor.getInstance();
