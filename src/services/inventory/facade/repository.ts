import { InventoryItem, LocalInventoryItem } from './types';
import { InventoryDataAdapter } from '../adapters/InventoryDataAdapter';
// import { inventoryAdapterFactory } from '../adapters/InventoryAdapterFactory';
import { InventoryErrorHandler } from '../InventoryErrorHandler';
import { InventoryCategoryProvider, categorizeItems, withNormalizedCategory } from './providers/InventoryCategoryProvider';
import { InventoryItemCrudProvider } from './providers/InventoryItemCrudProvider';
import { InventoryBulkOperationsProvider } from './providers/InventoryBulkOperationsProvider';
import { InventorySearchFilterProvider } from './providers/InventorySearchFilterProvider';
import { InventoryAnalyticsProvider } from './providers/InventoryAnalyticsProvider';
import { InventoryStatsProvider } from './providers/InventoryStatsProvider';

// Re-export utility functions for backward compatibility
export { normalizeCategory, categorizeItems, withNormalizedCategory };

export class InventoryRepository {
  private currentAdapter: InventoryDataAdapter | null = null;
  private adapterType: string = 'static';
  private initialized = false;

  // Provider instances
  private categoryProvider: InventoryCategoryProvider | null = null;
  private itemCrudProvider: InventoryItemCrudProvider | null = null;
  private bulkOperationsProvider: InventoryBulkOperationsProvider | null = null;
  private searchFilterProvider: InventorySearchFilterProvider | null = null;
  private analyticsProvider: InventoryAnalyticsProvider | null = null;
  private statsProvider: InventoryStatsProvider | null = null;

  constructor() {
    // Adapter will be initialized by the facade
  }

  get isInitialized() {
    return this.initialized;
  }

  async initialize(
    adapter: InventoryDataAdapter,
    adapterType: string
  ): Promise<void> {
    if (!this.initialized) {
      this.currentAdapter = adapter;
      this.adapterType = adapterType;
      if (typeof this.currentAdapter.initialize === 'function') {
        await this.currentAdapter.initialize();
      }
      
      // Initialize providers
      this.categoryProvider = new InventoryCategoryProvider(adapter, adapterType);
      this.itemCrudProvider = new InventoryItemCrudProvider(adapter, adapterType);
      this.bulkOperationsProvider = new InventoryBulkOperationsProvider(adapter, adapterType);
      this.searchFilterProvider = new InventorySearchFilterProvider(adapter);
      this.analyticsProvider = new InventoryAnalyticsProvider(adapterType);
      this.statsProvider = new InventoryStatsProvider(adapter, adapterType);
      
      this.initialized = true;
      console.info('[InventoryRepository] Initialized successfully.');
    }
  }

  private getAdapter(): InventoryDataAdapter {
    if (!this.initialized || !this.currentAdapter) {
      throw new Error(
        'Inventory repository not initialized. Must call initialize() first.'
      );
    }
    return this.currentAdapter;
  }

  /**
   * Fetch all inventory items
   */
  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    return this.itemCrudProvider!.fetchInventoryItems();
  }

  /**
   * Fetch all inventory data with category transformation
   */
  async fetchAllInventoryData(): Promise<{
    tools: LocalInventoryItem[];
    supplies: LocalInventoryItem[];
    equipment: LocalInventoryItem[];
    officeHardware: LocalInventoryItem[];
    categories: string[];
    isLoading: boolean;
    error: string | null;
  }> {
    const result = await InventoryErrorHandler.handleOperation(
      'fetchAllInventoryData',
      async () => {
        const adapter = this.getAdapter();
        const response = await adapter.fetchAllInventoryData();

        // Transform InventoryResponse to InventoryDataResponse
        const items = response.data || [];

        // Normalize categories to UI-expected buckets
        const normalized = withNormalizedCategory(items);

        // Use the unified categorization function
        const categorized = categorizeItems(normalized);

        // Ensure no duplicates by checking IDs
        const allItemIds = new Set();
        const duplicateIds = new Set();

        [categorized.tools, categorized.supplies, categorized.equipment, categorized.officeHardware].forEach((category) => {
          category.forEach((item) => {
            if (allItemIds.has(item.id)) {
              duplicateIds.add(item.id);
            }
            allItemIds.add(item.id);
          });
        });

        if (duplicateIds.size > 0) {
          console.warn(
            `Found ${duplicateIds.size} duplicate item IDs:`,
            Array.from(duplicateIds)
          );
        }

        // Get categories from normalized items
        const categories = Array.from(
          new Set(normalized.map((item) => item.category).filter(Boolean))
        ) as string[];

        return {
          tools: categorized.tools as LocalInventoryItem[],
          supplies: categorized.supplies as LocalInventoryItem[],
          equipment: categorized.equipment as LocalInventoryItem[],
          officeHardware: categorized.officeHardware as LocalInventoryItem[],
          categories,
          isLoading: false,
          error: response.error,
        };
      }
    );

    return result;
  }

  /**
   * Get item by ID
   */
  async getItemById(
    id: string
  ): Promise<{ data: LocalInventoryItem | null; error: string | null }> {
    return this.itemCrudProvider!.getItemById(id);
  }

  /**
   * Create new inventory item
   */
  async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
  ): Promise<{ data: InventoryItem; error: string | null }> {
    return this.itemCrudProvider!.createItem(item);
  }

  /**
   * Update inventory item
   */
  async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<{ data: InventoryItem; error: string | null }> {
    return this.itemCrudProvider!.updateItem(id, updates);
  }

  /**
   * Delete inventory item
   */
  async deleteItem(
    id: string
  ): Promise<{ success: boolean; error: string | null }> {
    return this.itemCrudProvider!.deleteItem(id);
  }

  /**
   * Add inventory item
   */
  async addInventoryItem(item: LocalInventoryItem): Promise<InventoryItem> {
    return this.itemCrudProvider!.addInventoryItem(item);
  }

  /**
   * Add category
   */
  async addCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    return this.categoryProvider!.addCategory(category);
  }

  /**
   * Delete category
   */
  async deleteCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }> {
    return this.categoryProvider!.deleteCategory(category);
  }

  /**
   * Bulk create items
   */
  async bulkCreateItems(
    items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]
  ): Promise<{
    success: boolean;
    processedCount: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    data: InventoryItem[];
  }> {
    return this.bulkOperationsProvider!.bulkCreateItems(items);
  }

  /**
   * Bulk update items
   */
  async bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<InventoryItem> }>
  ): Promise<{
    success: boolean;
    processedCount: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    data: InventoryItem[];
  }> {
    return this.bulkOperationsProvider!.bulkUpdateItems(updates);
  }

  /**
   * Bulk delete items
   */
  async bulkDeleteItems(ids: string[]): Promise<{
    success: boolean;
    processedCount: number;
    successCount: number;
    errorCount: number;
    errors: string[];
    data: InventoryItem[];
  }> {
    return this.bulkOperationsProvider!.bulkDeleteItems(ids);
  }

  /**
   * Search items
   */
  async searchItems(
    query: string
  ): Promise<{ data: LocalInventoryItem[]; error: string | null }> {
    return this.searchFilterProvider!.searchItems(query);
  }

  /**
   * Get filtered items
   */
  async getFilteredItems(filters: {
    category?: string;
    status?: string;
    location?: string;
    searchQuery?: string;
  }): Promise<{ data: LocalInventoryItem[]; error: string | null }> {
    return this.searchFilterProvider!.getFilteredItems(filters);
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<{ data: string[]; error: string | null }> {
    return this.categoryProvider!.getCategories();
  }

  /**
   * Get locations
   */
  async getLocations(): Promise<{ data: string[]; error: string | null }> {
    return this.searchFilterProvider!.getLocations();
  }

  /**
   * Get inventory stats
   */
  async getInventoryStats(): Promise<{
    data: Record<string, unknown> | null;
    error: string | null;
  }> {
    return this.statsProvider!.getInventoryStats();
  }

  /**
   * Get current adapter type
   */
  getCurrentAdapterType(): string {
    return this.statsProvider!.getCurrentAdapterType();
  }

  /**
   * Get adapter metadata
   */
  getAdapterMetadata() {
    return this.statsProvider!.getAdapterMetadata();
  }

  /**
   * Get available adapters
   */
  getAvailableAdapters() {
    return this.statsProvider!.getAvailableAdapters();
  }
}
