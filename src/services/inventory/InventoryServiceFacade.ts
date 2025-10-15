/**
 * Inventory Facade Coordinator - Main coordinator that orchestrates all inventory services
 * Replaces the large InventoryServiceFacadeImpl with a clean, maintainable architecture
 */

import { InventoryItem, LocalInventoryItem } from '../../types/inventoryTypes';
import type {
  InventoryServiceFacade,
  InventoryResponse,
  InventoryDataResponse,
  OperationResult,
  _SearchOptions,
  FilterOptions,
  PaginationOptions,
  SortOptions,
  AdapterType,
  AdapterMetadata,
  CacheStats,
  InventoryUpdateResponse,
  InventoryDeleteResponse,
  InventoryCreateResponse,
  InventorySingleResponse,
  _InventoryFilters,
  InventoryBulkResponse,
} from '../../types/inventoryServiceTypes';
import { InventoryCacheManager } from './facade/cache';
import { InventoryRepository } from './facade/repository';
import { InventoryAdapterManager } from './facade/adapters';
import { cacheInvalidationService } from '../cache/cacheInvalidationCompatibility';
import { AnalyticsTrackingService } from '../shared/analyticsTrackingService';
import { inventorySupabaseService } from './services/inventorySupabaseService';
import { _getItemStatus } from '../../types/inventoryTypes';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

// Import the focused services
import { InventoryCoreService } from './services/inventoryCoreService';
import { InventorySearchService } from './services/InventorySearchService';
import { InventoryBulkService } from './services/InventoryBulkService';
import { InventoryCategoryManagementService } from './services/InventoryCategoryManagementService';
import { InventoryStatsService } from './services/InventoryStatsService';

export class InventoryServiceFacadeImpl implements InventoryServiceFacade {
  // Core components
  private readonly cacheManager = new InventoryCacheManager();
  private readonly repository = new InventoryRepository();
  private readonly adapterManager = new InventoryAdapterManager();
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Focused services
  private coreService: InventoryCoreService;
  private searchService: InventorySearchService;
  private bulkService: InventoryBulkService;
  private categoryManagementService: InventoryCategoryManagementService;
  private statsService: InventoryStatsService;

  // Static instance for true singleton behavior
  private static instance: InventoryServiceFacadeImpl | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
    // Register with centralized cache invalidation service only if not already registered
    if (!cacheInvalidationService.isRegistered('inventory_service')) {
      cacheInvalidationService.registerCacheManager('inventory_service', this);
    }

    // Initialize focused services
    this.coreService = new InventoryCoreService(
      this.repository,
      this.adapterManager
    );
    this.searchService = new InventorySearchService(
      this.repository,
      this.adapterManager
    );
    this.bulkService = new InventoryBulkService(
      this.repository,
      this.adapterManager
    );
    this.categoryManagementService = new InventoryCategoryManagementService(
      this.repository,
      this.adapterManager
    );
    this.statsService = new InventoryStatsService(
      this.repository,
      this.adapterManager
    );
  }

  // Static getInstance method for true singleton
  static getInstance(): InventoryServiceFacadeImpl {
    if (!InventoryServiceFacadeImpl.instance) {
      InventoryServiceFacadeImpl.instance = new InventoryServiceFacadeImpl();
    }
    return InventoryServiceFacadeImpl.instance;
  }

  // Debug method to check instance identity
  getInstanceId(): string {
    return `instance_${this === InventoryServiceFacadeImpl.instance ? 'SINGLETON' : 'NEW'}`;
  }

  async initialize(): Promise<void> {
    const startTime = performance.now();

    if (this.isInitialized) {
      return; // Already initialized, prevent multiple initializations
    }

    // If initialization is already in progress, wait for it to complete
    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    // Create the initialization promise
    this.initializationPromise = (async () => {
      try {
        await this.adapterManager.initialize();
        await this.repository.initialize(
          this.adapterManager.getAdapter(),
          this.adapterManager.getCurrentAdapterType()
        );
        this.isInitialized = true;

        const duration = performance.now() - startTime;
        performanceMonitor.recordResponseTime(
          'inventory_service_initialization',
          duration,
          {
            service: 'InventoryServiceFacade',
            operation: 'initialize',
          }
        );
      } finally {
        // Clear the promise reference
        this.initializationPromise = null;
      }
    })();

    await this.initializationPromise;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  // Delegate to focused services
  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    return await this.searchService.fetchInventoryItems();
  }

  async fetchAllInventoryData(): Promise<InventoryDataResponse> {
    const startTime = performance.now();

    try {
      const items = await this.searchService.fetchInventoryItems();
      const stats = await this.statsService.getInventoryStats();

      const result: InventoryDataResponse = {
        items,
        stats,
        lastUpdated: new Date(),
      };

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_fetch_all_data',
        duration,
        { itemCount: items.length }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_fetch_all_data_error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          adapterType: this.adapterManager.getCurrentAdapterType(),
        }
      );
      throw error;
    }
  }

  async getAllItems(): Promise<LocalInventoryItem[]> {
    return await this.searchService.getAllItems();
  }

  async getItemById(id: string): Promise<InventorySingleResponse> {
    return await this.coreService.getItemById(id);
  }

  async createItem(item: LocalInventoryItem): Promise<InventoryCreateResponse> {
    return await this.coreService.createItem(item);
  }

  async updateItem(
    id: string,
    updates: Partial<LocalInventoryItem>
  ): Promise<InventoryUpdateResponse> {
    return await this.coreService.updateItem(id, updates);
  }

  async deleteItem(id: string): Promise<InventoryDeleteResponse> {
    return await this.coreService.deleteItem(id);
  }

  async addInventoryItem(item: LocalInventoryItem): Promise<InventoryItem> {
    return await this.coreService.addInventoryItem(item);
  }

  async addCategory(category: string): Promise<OperationResult> {
    return await this.categoryManagementService.addCategory(category);
  }

  async deleteCategory(category: string): Promise<OperationResult> {
    return await this.categoryManagementService.deleteCategory(category);
  }

  async bulkCreateItems(
    items: LocalInventoryItem[]
  ): Promise<InventoryBulkResponse> {
    return await this.bulkService.bulkCreateItems(items);
  }

  async bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<LocalInventoryItem> }>
  ): Promise<InventoryBulkResponse> {
    return await this.bulkService.bulkUpdateItems(updates);
  }

  async bulkDeleteItems(ids: string[]): Promise<InventoryBulkResponse> {
    return await this.bulkService.bulkDeleteItems(ids);
  }

  async searchItems(query: string): Promise<InventoryResponse> {
    return await this.searchService.searchItems(query);
  }

  async getFilteredItems(
    filters: FilterOptions,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<InventoryResponse> {
    return await this.searchService.getFilteredItems(filters, pagination, sort);
  }

  async getCategories(): Promise<{ data: string[]; error: string | null }> {
    return await this.categoryManagementService.getCategories();
  }

  async getLocations(): Promise<{ data: string[]; error: string | null }> {
    return await this.categoryManagementService.getLocations();
  }

  async getInventoryStats(): Promise<{
    totalItems: number;
    categoriesCount: number;
    locationsCount: number;
    lowStockItems: number;
    expiredItems: number;
    lastUpdated: Date;
  }> {
    return await this.statsService.getInventoryStats();
  }

  async refresh(): Promise<{ success: boolean; error: string | null }> {
    return await this.statsService.refresh();
  }

  async validateItem(
    item: Partial<LocalInventoryItem>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return await this.coreService.validateItem(item);
  }

  async getItemHistory(): Promise<Record<string, unknown>[]> {
    return await this.statsService.getItemHistory();
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<LocalInventoryItem>
  ): Promise<InventoryItem> {
    const result = await this.coreService.updateItem(id, updates);
    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.error || 'Failed to update item');
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const result = await this.coreService.deleteItem(id);
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete item');
    }
  }

  async refreshData(): Promise<InventoryResponse> {
    return await this.searchService.refreshData();
  }

  async switchAdapter(type: AdapterType): Promise<OperationResult> {
    const startTime = performance.now();

    try {
      const result = await this.adapterManager.switchAdapter(type);

      if (result.success) {
        await this.repository.initialize(
          this.adapterManager.getAdapter(),
          this.adapterManager.getCurrentAdapterType()
        );
      }

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_adapter_switch',
        duration,
        { adapterType: type }
      );

      return result;
    } catch (error) {
      await AnalyticsTrackingService.trackEvent(
        'inventory_adapter_switch_error',
        {
          adapterType: type,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
      throw error;
    }
  }

  // Utility methods
  transformDataForModal(items: InventoryItem[]): Record<string, string | number | boolean | null>[] {
    return items.map((item) => ({
      ...item,
      // Add any additional transformations needed for modal display
    }));
  }

  // Cache management
  clearCache(): void {
    this.cacheManager.clearCache();
  }

  getCacheStats(): CacheStats {
    return this.cacheManager.getCacheStats();
  }

  // Adapter management
  getCurrentAdapterType(): AdapterType {
    return this.adapterManager.getCurrentAdapterType();
  }

  getAdapterMetadata(): AdapterMetadata {
    return this.adapterManager.getAdapterMetadata();
  }

  // Real-time subscriptions
  subscribeToChanges(callback: (payload: Record<string, string | number | boolean | null>) => void): () => void {
    return inventorySupabaseService.subscribeToChanges((payload: Record<string, string | number | boolean | null>) => {
      // Clear cache when inventory changes
      this.clearCache();

      // Track the real-time update event
      AnalyticsTrackingService.trackEvent('inventory_realtime_update', {
        source: 'facade',
        payload_type: typeof payload,
        adapter_type: this.adapterManager.getCurrentAdapterType(),
      });

      callback(payload);
    });
  }
}

// Export the singleton instance
export const inventoryServiceFacade = InventoryServiceFacadeImpl.getInstance();
export default inventoryServiceFacade;
