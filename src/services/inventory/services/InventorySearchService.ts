/**
 * Inventory Search Service - Search and filtering operations
 * Extracted from InventoryServiceFacade for better maintainability
 */

import { LocalInventoryItem } from '../../types/inventoryTypes';
import {
  InventoryResponse,
  _SearchOptions,
  FilterOptions,
  PaginationOptions,
  SortOptions,
} from '../../types/inventoryServiceTypes';
import { InventoryRepository } from './facade/repository';
import { InventoryAdapterManager } from './facade/adapters';
import { AnalyticsTrackingService } from '../../shared/analyticsTrackingService';
import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

export class InventorySearchService {
  constructor(
    private repository: InventoryRepository,
    private adapterManager: InventoryAdapterManager
  ) {}

  async searchItems(query: string): Promise<InventoryResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.searchItems(query);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_search', {
        query,
        resultCount: result.data?.length || 0,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_search', duration, {
        query,
        resultCount: result.data?.length || 0,
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_search_error', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async getFilteredItems(
    filters: FilterOptions,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<InventoryResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.getFilteredItems(
        filters,
        pagination,
        sort
      );

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_filter', {
        filterCount: Object.keys(filters).length,
        resultCount: result.data?.length || 0,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_filter', duration, {
        filterCount: Object.keys(filters).length,
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_filter_error', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    return await this.repository.fetchInventoryItems();
  }

  async getAllItems(): Promise<LocalInventoryItem[]> {
    return await this.repository.getAllItems();
  }

  async refreshData(): Promise<InventoryResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.refreshData();

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_refresh', {
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_refresh', duration, {});

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_refresh_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }
}
