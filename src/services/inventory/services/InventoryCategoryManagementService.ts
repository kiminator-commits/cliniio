/**
 * Inventory Category Service - Category management operations
 * Extracted from InventoryServiceFacade for better maintainability
 */

import { OperationResult } from '../../types/inventoryServiceTypes';
import { InventoryRepository } from './facade/repository';
import { InventoryAdapterManager } from './facade/adapters';
import { AnalyticsTrackingService } from '../../shared/analyticsTrackingService';
import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

export class InventoryCategoryManagementService {
  constructor(
    private repository: InventoryRepository,
    private adapterManager: InventoryAdapterManager
  ) {}

  async addCategory(category: string): Promise<OperationResult> {
    const startTime = performance.now();

    try {
      const result = await this.repository.addCategory(category);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_category_added', {
        category,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_category_add',
        duration,
        { category }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_category_add_error',
        {
          category,
          error: error instanceof Error ? error.message : 'Unknown error',
          adapterType: this.adapterManager.getCurrentAdapterType(),
        }
      );
      throw error;
    }
  }

  async deleteCategory(category: string): Promise<OperationResult> {
    const startTime = performance.now();

    try {
      const result = await this.repository.deleteCategory(category);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_category_deleted', {
        category,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_category_delete',
        duration,
        { category }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_category_delete_error',
        {
          category,
          error: error instanceof Error ? error.message : 'Unknown error',
          adapterType: this.adapterManager.getCurrentAdapterType(),
        }
      );
      throw error;
    }
  }

  async getCategories(): Promise<{ data: string[]; error: string | null }> {
    const startTime = performance.now();

    try {
      const result = await this.repository.getCategories();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_categories_fetch',
        duration,
        { categoryCount: result.data?.length || 0 }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_categories_fetch_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          adapterType: this.adapterManager.getCurrentAdapterType(),
        }
      );
      throw error;
    }
  }

  async getLocations(): Promise<{ data: string[]; error: string | null }> {
    const startTime = performance.now();

    try {
      const result = await this.repository.getLocations();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_locations_fetch',
        duration,
        { locationCount: result.data?.length || 0 }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_locations_fetch_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          adapterType: this.adapterManager.getCurrentAdapterType(),
        }
      );
      throw error;
    }
  }
}
