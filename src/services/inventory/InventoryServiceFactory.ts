import { InventoryServiceFacadeImpl } from './InventoryServiceFacade';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

/**
 * Factory for creating and managing inventory service instances
 * Ensures proper singleton behavior and performance monitoring
 */
export class InventoryServiceFactory {
  private static instance: InventoryServiceFacadeImpl | null = null;
  private static initializationPromise: Promise<InventoryServiceFacadeImpl> | null =
    null;

  /**
   * Get the singleton inventory service instance
   */
  static async getInstance(): Promise<InventoryServiceFacadeImpl> {
    if (this.instance) {
      return this.instance;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.createInstance();
    return this.initializationPromise;
  }

  /**
   * Create and initialize the inventory service instance
   */
  private static async createInstance(): Promise<InventoryServiceFacadeImpl> {
    const startTime = performance.now();

    try {
      // Create the instance
      this.instance = InventoryServiceFacadeImpl.getInstance();

      // Initialize the service
      await this.instance.initialize();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_service_factory_creation',
        duration,
        {
          service: 'InventoryServiceFactory',
          operation: 'createInstance',
        }
      );

      return this.instance;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordErrorRate('inventory_service_factory', 100, {
        service: 'InventoryServiceFactory',
        operation: 'createInstance',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error(
        `[InventoryServiceFactory] Failed to create instance after ${duration.toFixed(2)}ms:`,
        error
      );
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Check if the service is ready
   */
  static isReady(): boolean {
    return this.instance?.isReady() ?? false;
  }

  /**
   * Reset the factory (for testing purposes)
   */
  static reset(): void {
    this.instance = null;
    this.initializationPromise = null;
  }
}

// Export a convenience function
export const getInventoryService = () => InventoryServiceFactory.getInstance();
