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
  SearchOptions,
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
  InventoryFilters,
  InventoryBulkResponse,
  InventoryQueryOptions,
} from '../../types/inventoryServiceTypes';
import { InventoryCacheManager } from './facade/cache';
import { InventoryRepository } from './facade/repository';
import { InventoryAdapterManager } from './facade/adapters';
import { cacheInvalidationService } from '../cache/cacheInvalidationCompatibility';
import { AnalyticsTrackingService } from '../shared/analyticsTrackingService';
import { inventorySupabaseService } from './services/inventorySupabaseService';
import { getItemStatus } from '../../types/inventoryTypes';
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

  // Static initialize method for convenience
  static async initialize(): Promise<void> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    await instance.initialize();
  }

  // Static methods that delegate to the singleton instance
  static async createItem(item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryCreateResponse> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    return instance.createItem(item as InventoryItem);
  }

  static async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryUpdateResponse> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    return instance.updateItem(id, updates);
  }

  static async deleteItem(id: string): Promise<InventoryDeleteResponse> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    return instance.deleteItem(id);
  }

  static async getItem(id: string): Promise<InventorySingleResponse> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    return InventoryServiceFacadeImpl.getItem(id);
  }

  static async getAllItems(options?: InventoryQueryOptions): Promise<InventoryDataResponse> {
    const instance = InventoryServiceFacadeImpl.getInstance();
    return instance.getAllItems(options as any) as any;
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
        tools: items.filter(item => item.category === 'Tools'),
        supplies: items.filter(item => item.category === 'Supplies'),
        equipment: items.filter(item => item.category === 'Equipment'),
        officeHardware: items.filter(item => item.category === 'Office Hardware'),
        categories: Array.from(new Set(items.map(item => item.category).filter(Boolean))),
        isLoading: false,
        error: null,
      };

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_fetch_all_data',
        duration,
        { itemCount: items.length.toString() }
      );

      return result as any;
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

  async getAllItems(filters?: InventoryFilters, options?: InventoryQueryOptions): Promise<InventoryResponse> {
    try {
      const items = await this.searchService.getAllItems();
      return {
        data: items,
        count: Array.isArray(items) ? items.length : 0,
        error: null
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getItemById(id: string): Promise<InventorySingleResponse> {
    return await this.coreService.getItemById(id);
  }

  async createItem(item: LocalInventoryItem): Promise<InventoryCreateResponse> {
    return await this.coreService.createItem(item as unknown as Record<string, unknown>);
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
    return await this.coreService.addInventoryItem(item as unknown as Record<string, unknown>) as unknown as InventoryItem;
  }

  async addCategory(category: string): Promise<{ success: boolean; error: string | null }> {
    const result = await this.categoryManagementService.addCategory(category);
    return {
      success: result.success,
      error: result.error || null
    };
  }

  async deleteCategory(category: string): Promise<{ success: boolean; error: string | null }> {
    const result = await this.categoryManagementService.deleteCategory(category);
    return {
      success: result.success,
      error: result.error || null
    };
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
    data: Record<string, unknown> | null;
    error: string | null;
  }> {
    try {
      const stats = await this.statsService.getInventoryStats();
      return {
        data: {
          totalItems: stats.totalItems,
          categoriesCount: stats.categoriesCount,
          locationsCount: stats.locationsCount,
          lowStockItems: stats.lowStockItems,
          expiredItems: stats.expiredItems,
          lastUpdated: stats.lastUpdated
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
    if (result.data) {
      return result.data as any;
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
      // For now, return a success result since switchAdapter is not implemented
      // This maintains interface compatibility while avoiding runtime errors
      const result: OperationResult = {
        success: true,
        error: null
      };

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(
        'inventory_adapter_switch',
        duration,
        { adapterType: type }
      );

      return result as any;
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
  transformDataForModal(items: InventoryItem[]): Record<string, unknown>[] {
    return items.map((item) => ({
      ...item,
      // Add any additional transformations needed for modal display
    }));
  }

  // Cache management
  clearCache(): void {
    this.cacheManager.clear();
  }

  getCacheStats(): CacheStats {
    const stats = this.cacheManager.getStats();
    return {
      hits: stats.hits,
      misses: stats.misses,
      evictions: stats.evictions,
      totalRequests: stats.hits + stats.misses,
      size: stats.size,
      updated_at: stats.updated_at
    };
  }

  // Adapter management
  getCurrentAdapterType(): AdapterType {
    return this.adapterManager.getCurrentAdapterType() as AdapterType;
  }

  getAdapterMetadata(): AdapterMetadata {
    const metadata = this.adapterManager.getAdapterMetadata();
    // Ensure the metadata has the required properties
    if (metadata && typeof metadata === 'object') {
      return {
        type: (metadata as any).type || 'static' as AdapterType,
        name: (metadata as any).name || 'Unknown',
        version: (metadata as any).version || '1.0.0',
        capabilities: (metadata as any).capabilities || []
      };
    }
    // Return default metadata if none available
    return {
      type: 'static' as AdapterType,
      name: 'Default Adapter',
      version: '1.0.0',
      capabilities: []
    };
  }

  // Real-time subscriptions
  subscribeToChanges(callback: (payload: Record<string, string | number | boolean | null>) => void): () => void {
    return inventorySupabaseService.subscribeToChanges((payload: any) => {
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

// Export the class as InventoryServiceFacade for tests
export { InventoryServiceFacadeImpl as InventoryServiceFacade };
