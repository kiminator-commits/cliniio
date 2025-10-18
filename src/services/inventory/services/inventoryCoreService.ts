/**
 * Inventory Core Service - Basic CRUD operations
 * Extracted from InventoryServiceFacade for better maintainability
 */

import { InventoryItem } from '../types/supabaseTypes';
import {
  InventorySingleResponse,
  InventoryCreateResponse,
  InventoryUpdateResponse,
  InventoryDeleteResponse,
} from '../types/inventoryServiceTypes';
import { InventoryRepository } from '../facade/repository';
import { InventoryAdapterManager } from '../facade/adapters';
import { AnalyticsTrackingService } from '../../shared/analyticsTrackingService';
import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

export class InventoryCoreService {
  constructor(
    private repository: InventoryRepository,
    private adapterManager: InventoryAdapterManager
  ) {}

  async getItemById(id: string): Promise<InventorySingleResponse> {
    return await this.repository.getItemById(id);
  }

  async createItem(item: Record<string, unknown>): Promise<InventoryCreateResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.createItem(item as unknown as any);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_item_created', {
        itemId: result.data?.id,
        category: item.category as string,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_item_create', duration, {
        itemId: result.data?.id,
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_item_create_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async updateItem(
    id: string,
    updates: Record<string, unknown>
  ): Promise<InventoryUpdateResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.updateItem(id, updates);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_item_updated', {
        itemId: id,
        updatedFields: Object.keys(updates).join(','),
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_item_update', duration, {
        itemId: id,
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_item_update_error', {
        itemId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async deleteItem(id: string): Promise<InventoryDeleteResponse> {
    const startTime = performance.now();

    try {
      const result = await this.repository.deleteItem(id);

      // Track analytics
      await AnalyticsTrackingService.trackEvent('inventory_item_deleted', {
        itemId: id,
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_item_delete', duration, {
        itemId: id,
      });

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_item_delete_error', {
        itemId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async addInventoryItem(item: Record<string, unknown>): Promise<InventoryItem> {
    return await this.repository.addInventoryItem(item as unknown as any) as unknown as InventoryItem;
  }

  async validateItem(
    item: Record<string, unknown>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!item.name || (item.name as string).trim() === '') {
      errors.push('Item name is required');
    }

    if (!item.category || (item.category as string).trim() === '') {
      errors.push('Category is required');
    }

    if (!item.location || (item.location as string).trim() === '') {
      errors.push('Location is required');
    }

    if (item.quantity !== undefined && (item.quantity as number) < 0) {
      errors.push('Quantity must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
