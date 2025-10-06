import { performanceMonitor } from './monitoring/PerformanceMonitor';
import { servicePerformanceMonitor } from './_core/ServicePerformanceMonitor';
import { createPerformanceTrackedService } from './_core/ServicePerformanceDecorator';

/**
 * Service Registry for centralized service management
 * Prevents duplicate instances and provides unified service access
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry | null = null;
  private services: Map<string, unknown> = new Map();
  private serviceFactories: Map<string, () => unknown> = new Map();

  private constructor() {
    this.registerDefaultServices();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: () => T): void {
    this.serviceFactories.set(name, factory);
  }

  /**
   * Get a service instance (creates if not exists)
   */
  get<T>(name: string): T {
    if (!this.services.has(name)) {
      const factory = this.serviceFactories.get(name);
      if (!factory) {
        throw new Error(`Service '${name}' not registered`);
      }

      const startTime = performance.now();
      try {
        const service = factory();

        // Wrap service with performance tracking
        const trackedService = createPerformanceTrackedService(name, service);
        this.services.set(name, trackedService);

        const duration = performance.now() - startTime;
        performanceMonitor.recordResponseTime('service_creation', duration, {
          service: name,
          operation: 'create',
        });

        // Track service creation in performance monitor
        const callId = servicePerformanceMonitor.startCall(
          'ServiceRegistry',
          'createService'
        );
        servicePerformanceMonitor.endCall(callId, true);
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceMonitor.recordErrorRate('service_creation', 100, {
          service: name,
          operation: 'create',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error(
          `[ServiceRegistry] Failed to create service '${name}' after ${duration.toFixed(2)}ms:`,
          error
        );
        throw error;
      }
    }

    return this.services.get(name) as T;
  }

  /**
   * Check if a service exists
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Remove a service instance
   */
  remove(name: string): boolean {
    return this.services.delete(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get performance metrics for all services
   */
  getPerformanceMetrics() {
    return servicePerformanceMonitor.getAllMetrics();
  }

  /**
   * Get performance metrics for a specific service
   */
  getServicePerformanceMetrics(serviceName: string) {
    return servicePerformanceMonitor.getServiceMetrics(serviceName);
  }

  /**
   * Get services with performance issues
   */
  getServicesWithPerformanceIssues() {
    return servicePerformanceMonitor.getServicesWithIssues();
  }

  /**
   * Get top performing services
   */
  getTopPerformingServices(limit: number = 5) {
    return servicePerformanceMonitor.getTopPerformingServices(limit);
  }

  /**
   * Export all performance data
   */
  exportPerformanceData() {
    return servicePerformanceMonitor.exportMetrics();
  }

  /**
   * Clear all services (for testing)
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * Reset the registry (for testing)
   */
  reset(): void {
    this.services.clear();
    this.serviceFactories.clear();
    ServiceRegistry.instance = null;
  }

  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    // Performance Monitor (already singleton)
    this.register('performanceMonitor', () => performanceMonitor);

    // Inventory Service Factory
    this.register('inventoryService', async () => {
      const { getInventoryService } = await import(
        './inventory/InventoryServiceFactory'
      );
      return getInventoryService();
    });

    // Error Handling Service
    this.register('errorHandling', async () => {
      const { ErrorHandlingService } = await import(
        '../pages/Settings/services/errorHandlingService'
      );
      return ErrorHandlingService.getInstance();
    });

    // Settings Service
    this.register('settings', async () => {
      const { SettingsService } = await import(
        '../pages/Settings/services/settingsService'
      );
      return SettingsService.getInstance();
    });

    // Usage Tracking Service
    this.register('usageTracking', async () => {
      const { usageTrackingService } = await import('./usageTrackingService');
      return usageTrackingService;
    });

    // Learning Progress Service
    this.register('learningProgress', async () => {
      const LearningProgressService = await import('./learningProgressService');
      return LearningProgressService.default.getInstance();
    });

    // Cleaning Schedule Service
    this.register('cleaningSchedule', async () => {
      const { cleaningScheduleService } = await import(
        './cleaningScheduleService'
      );
      return cleaningScheduleService;
    });

    // Duplicate Prevention Service
    this.register('duplicatePrevention', async () => {
      const { duplicatePreventionService } = await import(
        '../pages/KnowledgeHub/services/duplicatePreventionService'
      );
      return duplicatePreventionService;
    });
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Convenience functions
export const getService = <T>(name: string): T => serviceRegistry.get<T>(name);
export const hasService = (name: string): boolean => serviceRegistry.has(name);
export const registerService = <T>(name: string, factory: () => T): void =>
  serviceRegistry.register(name, factory);
