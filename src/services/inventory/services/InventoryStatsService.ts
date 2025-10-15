/**
 * Inventory Stats Service - Statistics and analytics operations
 * Extracted from InventoryServiceFacade for better maintainability
 */

import { _LocalInventoryItem } from '../../types/inventoryTypes';
import { InventoryRepository } from './facade/repository';
import { InventoryAdapterManager } from './facade/adapters';
import { AnalyticsTrackingService } from '../../shared/analyticsTrackingService';
import { performanceMonitor } from '../../monitoring/PerformanceMonitor';

export interface InventoryStats {
  totalItems: number;
  categoriesCount: number;
  locationsCount: number;
  lowStockItems: number;
  expiredItems: number;
  lastUpdated: Date;
}

export class InventoryStatsService {
  constructor(
    private repository: InventoryRepository,
    private adapterManager: InventoryAdapterManager
  ) {}

  async getInventoryStats(): Promise<{
    totalItems: number;
    categoriesCount: number;
    locationsCount: number;
    lowStockItems: number;
    expiredItems: number;
    lastUpdated: Date;
  }> {
    const startTime = performance.now();

    try {
      const items = await this.repository.getAllItems();

      const stats = {
        totalItems: items.length,
        categoriesCount: new Set(items.map((item) => item.category)).size,
        locationsCount: new Set(items.map((item) => item.location)).size,
        lowStockItems: items.filter((item) => (item.quantity || 0) < 10).length,
        expiredItems: items.filter((item) => {
          if (!item.expirationDate) return false;
          return new Date(item.expirationDate) < new Date();
        }).length,
        lastUpdated: new Date(),
      };

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_stats_calculate',
        duration,
        { totalItems: stats.totalItems }
      );

      return stats;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_stats_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async getItemHistory(): Promise<Record<string, unknown>[]> {
    const startTime = performance.now();

    try {
      const result = await this.repository.getItemHistory();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_history_fetch',
        duration,
        { historyCount: result.length }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_history_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });
      throw error;
    }
  }

  async refresh(): Promise<{ success: boolean; error: string | null }> {
    const startTime = performance.now();

    try {
      await this.repository.refreshData();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('inventory_refresh', duration, {});

      return { success: true, error: null };
    } catch (error) {
      await AnalyticsTrackingService.trackEvent('inventory_refresh_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adapterType: this.adapterManager.getCurrentAdapterType(),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
