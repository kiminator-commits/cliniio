/**
 * Inventory Bulk Service - Bulk operations
 * Extracted from InventoryServiceFacade for better maintainability
 */

import { LocalInventoryItem } from '../../../types/inventoryTypes';
import {
  InventoryBulkResponse,
  OperationResult,
} from '../../../types/inventoryServiceTypes';
import { InventoryRepository } from '../facade/repository';
import { InventoryAdapterManager } from '../facade/adapters';
import { AnalyticsTrackingService } from '../../shared/analyticsTrackingService';
import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

export class InventoryBulkService {
  constructor(
    private repository: InventoryRepository,
    private adapterManager: InventoryAdapterManager
  ) {}

  async bulkCreateItems(
    items: LocalInventoryItem[]
  ): Promise<InventoryBulkResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.bulkCreateItems(items);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_bulk_create', {
        itemCount: items.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_bulk_create', duration, {
        itemCount: items.length.toString(),
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_bulk_create_error', {
        itemCount: items.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<LocalInventoryItem> }>
  ): Promise<InventoryBulkResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.bulkUpdateItems(updates);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_bulk_update', {
        updateCount: updates.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_bulk_update', duration, {
        updateCount: updates.length.toString(),
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_bulk_update_error', {
        updateCount: updates.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async bulkDeleteItems(ids: string[]): Promise<InventoryBulkResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.bulkDeleteItems(ids);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_bulk_delete', {
        itemCount: ids.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_bulk_delete', duration, {
        itemCount: ids.length.toString(),
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_bulk_delete_error', {
        itemCount: ids.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }
}
