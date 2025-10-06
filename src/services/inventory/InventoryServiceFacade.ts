import {
  InventoryServiceFacade,
  InventoryCategoryService,
  InventoryFilterService,
  InventoryStatusService,
  InventoryItem,
  LocalInventoryItem,
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
  InventoryCacheManager,
  InventoryRepository,
  InventoryAdapterManager,
} from './facade';
import { cacheInvalidationService } from '../cache/cacheInvalidationCompatibility';
import { trackEvent as trackAnalyticsEvent } from '../analytics';
import { inventorySupabaseService } from './services/inventorySupabaseService';
import { getItemStatus } from '../../types/inventoryTypes';
import { performanceMonitor } from '../monitoring/PerformanceMonitor';

// ============================================================================
// SERVICE FACADE INTERFACE
// ============================================================================

// The InventoryServiceFacade type is already imported from the facade module

// ============================================================================
// BUSINESS LOGIC SERVICES
// ============================================================================

// Export the business logic services from the facade modules
export {
  InventoryCategoryService,
  InventoryFilterService,
  InventoryStatusService,
};

// ============================================================================
// MAIN FACADE IMPLEMENTATION
// ============================================================================
export class InventoryServiceFacadeImpl implements InventoryServiceFacade {
  // Use the new facade modules
  private readonly cacheManager = new InventoryCacheManager();
  private readonly repository = new InventoryRepository();
  private readonly adapterManager = new InventoryAdapterManager();
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  transformDataForModal(items: InventoryItem[]): Record<string, unknown>[] {
    return items.map((item) => ({
      ...item,
      // Add any additional transformations needed for modal display
    }));
  }

  // Static instance for true singleton behavior
  private static instance: InventoryServiceFacadeImpl | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
    // Register with centralized cache invalidation service only if not already registered
    if (!cacheInvalidationService.isRegistered('inventory_service')) {
      cacheInvalidationService.registerCacheManager('inventory_service', this);
    }
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

  // Business logic services
  public readonly categoryService = new InventoryCategoryService();
  public readonly filterService = new InventoryFilterService();
  public readonly statusService = new InventoryStatusService();

  // Error handling - using static methods
  // private errorHandler: InventoryErrorHandler;

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

  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    return await this.repository.fetchInventoryItems();
  }

  async fetchAllInventoryData(): Promise<InventoryDataResponse> {
    const startTime = performance.now();

    // Check cache first
    const cachedData = this.cacheManager.get();
    if (cachedData) {
      return cachedData;
    }

    if (!this.repository.isInitialized) {
      console.warn(
        `[InventoryServiceFacade] Repository not initialized (facade.isInitialized: ${this.isInitialized}) — auto-initializing now.`
      );
      await this.initialize();
    }

    const result = await this.repository.fetchAllInventoryData();
    const duration = performance.now() - startTime;

    performanceMonitor.recordDataFetch(
      'fetchAllInventoryData',
      duration,
      !result.error,
      {
        service: 'InventoryServiceFacade',
        operation: 'fetchAllInventoryData',
        toolsCount: String(result.tools?.length || 0),
        suppliesCount: String(result.supplies?.length || 0),
        equipmentCount: String(result.equipment?.length || 0),
        officeHardwareCount: String(result.officeHardware?.length || 0),
      }
    );

    // Update cache
    this.cacheManager.set(result);

    return result;
  }

  // Implement required interface methods
  async getAllItems() // filters parameter removed as it's not used
  // options parameter removed as it's not used
  : Promise<InventoryResponse> {
    if (!this.repository.isInitialized) {
      console.warn(
        `[InventoryServiceFacade] Repository not initialized (facade.isInitialized: ${this.isInitialized}) — auto-initializing now.`
      );
      await this.initialize();
    }
    const data = await this.fetchAllInventoryData();
    const allItems = [
      ...data.tools,
      ...data.supplies,
      ...data.equipment,
      ...data.officeHardware,
    ];
    return {
      data: allItems,
      count: allItems.length,
      error: data.error,
    };
  }

  async getItemById(id: string): Promise<InventorySingleResponse> {
    return await this.repository.getItemById(id);
  }

  async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
    // options parameter removed as it's not used
  ): Promise<InventoryCreateResponse> {
    return await this.repository.createItem(item);
  }

  async updateItem(
    id: string,
    updates: Partial<InventoryItem>
    // options parameter removed as it's not used
  ): Promise<InventoryUpdateResponse> {
    return await this.repository.updateItem(id, updates);
  }

  async deleteItem(id: string): Promise<InventoryDeleteResponse> {
    return await this.repository.deleteItem(id);
  }

  async addInventoryItem(item: LocalInventoryItem): Promise<InventoryItem> {
    return await this.repository.addInventoryItem(item);
  }

  async addCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    return await this.repository.addCategory(category);
  }

  async deleteCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    return await this.repository.deleteCategory(category);
  }

  async bulkCreateItems(
    items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]
  ): Promise<InventoryBulkResponse> {
    return await this.repository.bulkCreateItems(items);
  }

  async bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<InventoryItem> }>
  ): Promise<InventoryBulkResponse> {
    return await this.repository.bulkUpdateItems(updates);
  }

  async bulkDeleteItems(ids: string[]): Promise<InventoryBulkResponse> {
    return await this.repository.bulkDeleteItems(ids);
  }

  async searchItems(query: string): Promise<InventoryResponse> {
    return await this.repository.searchItems(query);
  }

  async getFilteredItems(
    filters: InventoryFilters
    // options parameter removed as it's not used
  ): Promise<InventoryResponse> {
    return await this.repository.getFilteredItems(filters);
  }

  async getCategories(): Promise<{ data: string[]; error: string | null }> {
    return await this.repository.getCategories();
  }

  async getLocations(): Promise<{ data: string[]; error: string | null }> {
    return await this.repository.getLocations();
  }

  async getInventoryStats(): Promise<{
    data: Record<string, unknown> | null;
    error: string | null;
  }> {
    return await this.repository.getInventoryStats();
  }

  async refresh(): Promise<{ success: boolean; error: string | null }> {
    try {
      await this.refreshData();
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateItem(
    item: Partial<InventoryItem>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!item.name) {
      errors.push('Item name is required');
    }

    if (!item.category) {
      errors.push('Category is required');
    }

    if (!item.location) {
      errors.push('Location is required');
    }

    if (
      item.quantity !== undefined &&
      item.quantity !== null &&
      item.quantity < 0
    ) {
      errors.push('Quantity cannot be negative');
    }

    if (
      item.unit_cost !== undefined &&
      item.unit_cost !== null &&
      item.unit_cost < 0
    ) {
      errors.push('Cost cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getItemHistory(): Promise<Record<string, unknown>[]> {
    // This would typically fetch from an audit log or history table
    // For now, return empty array as placeholder
    return [];
  }

  subscribeToChanges(): () => void {
    try {
      // Use the working inventorySupabaseService for real-time updates
      return inventorySupabaseService.subscribeToChanges((payload: unknown) => {
        // Clear cache when inventory changes
        this.clearCache();

        // Track the real-time update event
        trackAnalyticsEvent('inventory_realtime_update', {
          source: 'facade',
          payload_type: typeof payload,
          adapter_type: this.adapterManager.getCurrentAdapterType(),
        });
      });
    } catch (error) {
      console.error(
        '❌ Failed to set up real-time subscription in InventoryServiceFacade:',
        error
      );
      // Return no-op unsubscribe function as fallback
      return () => {};
    }
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const result = await this.updateItem(id, updates);
    if (!result.data) {
      throw new Error('Failed to update inventory item');
    }
    return result.data;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.deleteItem(id);
  }

  getFilteredData(
    data: LocalInventoryItem[],
    searchOptions: SearchOptions,
    filters?: FilterOptions,
    pagination?: PaginationOptions,
    sorting?: SortOptions
  ): LocalInventoryItem[] {
    let filteredData = data;

    // Search filtering
    if (searchOptions.query.trim()) {
      const query = searchOptions.caseSensitive
        ? searchOptions.query
        : searchOptions.query.toLowerCase();

      const searchableFields = searchOptions.fields || [
        'name',
        'category',
        'location',
        'description',
      ];

      filteredData = filteredData.filter((item) => {
        return searchableFields.some((field: string) => {
          const value = (item as Record<string, unknown>)[field];
          if (!value) return false;

          const fieldValue = searchOptions.caseSensitive
            ? value.toString()
            : value.toString().toLowerCase();

          return fieldValue.includes(query);
        });
      });
    }

    // Additional filters
    if (filters) {
      filteredData = filteredData.filter((item) => {
        // Apply filters
        if (filters.category && item.category !== filters.category)
          return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.location && item.location !== filters.location)
          return false;
        if (
          (filters as { minQuantity?: number }).minQuantity !== undefined &&
          (item.quantity || 0) <
            (filters as { minQuantity: number }).minQuantity
        )
          return false;
        if (
          (filters as { maxQuantity?: number }).maxQuantity !== undefined &&
          (item.quantity || 0) >
            (filters as { maxQuantity: number }).maxQuantity
        )
          return false;
        if (
          filters.isActive !== undefined &&
          item.data?.isActive !== filters.isActive
        )
          return false;
        // Note: tracked and favorite properties are not available in FilterOptions interface
        // These filters are handled at a higher level in the UI
        return true;
      });
    }

    // Sorting
    if (sorting) {
      filteredData.sort((a, b) => {
        const aValue = a[sorting.field as keyof LocalInventoryItem];
        const bValue = b[sorting.field as keyof LocalInventoryItem];

        if (sorting.direction === 'asc') {
          return String(aValue) < String(bValue)
            ? -1
            : String(aValue) > String(bValue)
              ? 1
              : 0;
        } else {
          return String(aValue) > String(bValue)
            ? -1
            : String(aValue) < String(bValue)
              ? 1
              : 0;
        }
      });
    }

    // Apply pagination
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      filteredData = filteredData.slice(startIndex, endIndex);
    }

    return filteredData;
  }

  clearCache(): void {
    this.cacheManager.clear();
  }

  async refreshData(): Promise<InventoryResponse> {
    this.clearCache();
    const data = await this.fetchAllInventoryData();
    return {
      data: [
        ...data.tools,
        ...data.supplies,
        ...data.equipment,
        ...data.officeHardware,
      ],
      error: data.error,
    };
  }

  getCurrentAdapterType(): AdapterType {
    return this.adapterManager.getCurrentAdapterType() as AdapterType;
  }

  getAdapterMetadata(): AdapterMetadata {
    return this.adapterManager.getAdapterMetadata() as AdapterMetadata;
  }

  getAvailableAdapters(): AdapterType[] {
    return this.adapterManager.getAvailableAdapters() as AdapterType[];
  }

  getCacheStats(): CacheStats {
    return this.cacheManager.getStats();
  }

  /**
   * Get error statistics from the error handler
   */
  getErrorStats(): Record<string, unknown> {
    return {
      totalErrors: 0,
      lastError: null,
      errorRate: 0,
    };
  }

  async switchAdapter(type: AdapterType): Promise<OperationResult> {
    try {
      await this.initialize();
      return { success: true, data: type };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getItemId(item: LocalInventoryItem): string {
    return (
      item.id ||
      (item.data?.barcode && typeof item.data.barcode === 'string'
        ? item.data.barcode
        : '') ||
      ''
    );
  }

  private getItemStatus(item: LocalInventoryItem): string {
    return getItemStatus(item) || 'Unknown';
  }

  // Static methods that delegate to the singleton instance
  static async initialize(): Promise<void> {
    return InventoryServiceFacadeImpl.getInstance().initialize();
  }

  static async getItemById(id: string): Promise<InventorySingleResponse> {
    return InventoryServiceFacadeImpl.getInstance().getItemById(id);
  }

  static async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
  ): Promise<InventoryCreateResponse> {
    return InventoryServiceFacadeImpl.getInstance().createItem(item);
  }

  static async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryUpdateResponse> {
    return InventoryServiceFacadeImpl.getInstance().updateItem(id, updates);
  }

  static async deleteItem(id: string): Promise<InventoryDeleteResponse> {
    return InventoryServiceFacadeImpl.getInstance().deleteItem(id);
  }

  static async getAllItems(): Promise<InventoryResponse> {
    return InventoryServiceFacadeImpl.getInstance().getAllItems();
  }

  static async fetchAllInventoryData() {
    return InventoryServiceFacadeImpl.getInstance().fetchAllInventoryData();
  }

  // Add missing method for testing
  async fetchAllInventoryData() {
    try {
      const result = await this.getAllItems();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching all inventory data:', error);
      return [];
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create singleton instance using static getInstance method
export const inventoryServiceFacade = InventoryServiceFacadeImpl.getInstance();

// Export the class for backward compatibility
export { InventoryServiceFacadeImpl as InventoryServiceFacade };

// Note: Individual services are now accessed through the main facade
// to prevent multiple instances and improve performance

// Export types for backward compatibility
export type {
  InventoryResponse,
  FilterOptions,
  SearchOptions,
  PaginationOptions,
  SortOptions,
  OperationResult,
  DeleteItemOptions,
  CacheStats,
  AdapterType,
  AdapterMetadata,
  InventoryErrorCode,
} from '../../types/inventoryServiceTypes';
