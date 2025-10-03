import {
  InventoryItem,
  LocalInventoryItem,
  getItemStatus,
} from '@/types/inventoryTypes';
import { TabType } from '@/pages/Inventory/types';
import { handleCategoryChange } from '@/utils/inventoryHelpers';
import { getStatusBadge, getStatusText } from '@/utils/Inventory/statusUtils';
import { InventoryDataProvider } from './data/inventoryDataProvider';
import { inventoryServiceFacade } from './InventoryServiceFacade';

// ============================================================================
// CORE DATA INTERFACES
// ============================================================================

export interface InventoryDataResponse {
  tools: LocalInventoryItem[];
  supplies: LocalInventoryItem[];
  equipment: LocalInventoryItem[];
  officeHardware: LocalInventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

export interface FilterOptions {
  category?: string;
  location?: string;
  status?: string;
}

// ============================================================================
// MAIN SERVICE INTERFACE
// ============================================================================

export interface InventoryDataService {
  // Core data fetching methods
  fetchAllInventoryData(): Promise<InventoryDataResponse>;
  fetchInventoryItems(): Promise<InventoryItem[]>;
  fetchCategories(): Promise<string[]>;

  // CRUD operations
  addInventoryItem(item: InventoryItem): Promise<InventoryItem>;
  updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  addCategory(category: string): Promise<string>;
  deleteCategory(category: string): Promise<void>;

  // Data transformation and filtering
  getFilteredData(
    data: LocalInventoryItem[],
    searchQuery: string,
    filters?: FilterOptions
  ): LocalInventoryItem[];
  /**
   * @deprecated Use InventoryDataTransformer.transformForModal() instead
   */
  transformDataForModal(items: LocalInventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
    location: string;
    lastUpdated: string;
  }>;

  // Cache management
  clearCache(): void;
  refreshData(): Promise<InventoryDataResponse>;
}

// ============================================================================
// BUSINESS LOGIC SERVICES
// ============================================================================

/**
 * Service for handling inventory category logic
 * Extracted from main Inventory page component
 */
export class InventoryCategoryService {
  /**
   * Handle category change with memoization
   * Extracted from memoizedCategoryChange in main page
   */
  static createCategoryChangeHandler(setActiveTab: (tab: TabType) => void) {
    return (tab: TabType) => {
      handleCategoryChange(setActiveTab, tab);
    };
  }

  /**
   * Handle tracked filter toggle
   * Extracted from handleToggleTrackedFilter in main page
   */
  static createTrackedFilterHandler(
    showTrackedOnly: boolean,
    setShowTrackedOnly: (show: boolean) => void
  ) {
    return () => {
      setShowTrackedOnly(!showTrackedOnly);
    };
  }

  /**
   * Handle favorites filter toggle
   * Extracted from handleToggleFavoritesFilter in main page
   */
  static createFavoritesFilterHandler(
    showFavoritesOnly: boolean,
    setShowFavoritesOnly: (show: boolean) => void
  ) {
    return () => {
      setShowFavoritesOnly(!showFavoritesOnly);
    };
  }
}

/**
 * Service for handling inventory filtering logic
 * Extracted from main Inventory page component
 */
export class InventoryFilterService {
  /**
   * Get filtered tools data
   * Extracted from filteredTools useMemo in main page
   */
  static getFilteredTools() {
    // This method should be updated to use actual data from Supabase
    // For now, return empty array since we're removing mock data
    return [];
  }
}

/**
 * Service for handling inventory item status logic
 * Extracted from main Inventory page component
 */
export class InventoryStatusService {
  /**
   * Get CSS classes for status badge styling
   */
  static getStatusBadge(phase: string): string {
    return getStatusBadge(phase);
  }

  /**
   * Get display text for status
   */
  static getStatusText(phase: string): string {
    return getStatusText(phase);
  }
}

// ============================================================================
// MAIN SERVICE IMPLEMENTATION
// ============================================================================

export class UnifiedInventoryDataServiceImpl implements InventoryDataService {
  private cache: {
    data: InventoryDataResponse | null;
    timestamp: number;
    ttl: number;
  } = {
    data: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000, // 5 minutes
  };

  private isLoading = false;
  private error: string | null = null;

  async fetchAllInventoryData(): Promise<InventoryDataResponse> {
    // Check cache first
    if (this.cache.data && Date.now() - this.cache.timestamp < this.cache.ttl) {
      return this.cache.data;
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Fetch actual inventory data from the database
      const inventoryResponse =
        await InventoryDataProvider.getItemsFromSupabase();

      if (inventoryResponse.error) {
        throw new Error(inventoryResponse.error);
      }

      const allItems = inventoryResponse.data || [];

      // Transform flat inventory items into categorized structure
      const tools: InventoryItem[] = [];
      const supplies: InventoryItem[] = [];
      const equipment: InventoryItem[] = [];
      const officeHardware: InventoryItem[] = [];
      const categories: string[] = [];

      allItems.forEach((item) => {
        // Add to categories if not already present
        if (item.category && !categories.includes(item.category)) {
          categories.push(item.category);
        }

        // Categorize items based on their category field
        switch (item.category?.toLowerCase()) {
          case 'tools':
          case 'tool':
            tools.push(item);
            break;
          case 'supplies':
          case 'supply':
            supplies.push(item);
            break;
          case 'equipment':
            equipment.push(item);
            break;
          case 'office hardware':
          case 'office_hardware':
          case 'hardware':
            officeHardware.push(item);
            break;
          default:
            // Default to supplies if category is unclear
            supplies.push(item);
            break;
        }
      });

      const response: InventoryDataResponse = {
        tools,
        supplies,
        equipment,
        officeHardware,
        categories,
        isLoading: false,
        error: null,
      };

      this.cache.data = response;
      this.cache.timestamp = Date.now();
      return response;
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : 'Failed to fetch inventory data';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    const response = await this.fetchAllInventoryData();
    return [
      ...response.tools,
      ...response.supplies,
      ...response.equipment,
      ...response.officeHardware,
    ];
  }

  async fetchCategories(): Promise<string[]> {
    const response = await this.fetchAllInventoryData();
    return response.categories;
  }

  async addInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    try {
      // Ensure the service is initialized
      if (!inventoryServiceFacade.isReady()) {
        await inventoryServiceFacade.initialize();
      }

      // Use the facade to create the item
      const result = await inventoryServiceFacade.createItem(item);

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();

      return result.data as InventoryItem;
    } catch (error) {
      throw new Error(
        `Failed to add inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    try {
      // Ensure the service is initialized
      if (!inventoryServiceFacade.isReady()) {
        await inventoryServiceFacade.initialize();
      }

      // Use the facade to update the item
      const result = await inventoryServiceFacade.updateItem(id, item);

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();

      return result.data as InventoryItem;
    } catch (error) {
      throw new Error(
        `Failed to update inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    try {
      // Ensure the service is initialized
      if (!inventoryServiceFacade.isReady()) {
        await inventoryServiceFacade.initialize();
      }

      // Use the facade to delete the item
      const result = await inventoryServiceFacade.deleteItem(id);

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();
    } catch (error) {
      throw new Error(
        `Failed to delete inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async addCategory(category: string): Promise<string> {
    try {
      // Ensure the service is initialized
      if (!inventoryServiceFacade.isReady()) {
        await inventoryServiceFacade.initialize();
      }

      // Use the facade to add the category
      const result = await inventoryServiceFacade.addCategory(category);

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();

      return category;
    } catch (error) {
      throw new Error(
        `Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteCategory(category: string): Promise<void> {
    try {
      // Ensure the service is initialized
      if (!inventoryServiceFacade.isReady()) {
        await inventoryServiceFacade.initialize();
      }

      // Use the facade to delete the category
      const result = await inventoryServiceFacade.deleteCategory(category);

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear cache to ensure fresh data on next fetch
      this.clearCache();
    } catch (error) {
      throw new Error(
        `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getFilteredData(
    data: LocalInventoryItem[],
    searchQuery: string,
    filters?: FilterOptions
  ): LocalInventoryItem[] {
    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          (item.data?.barcode &&
            typeof item.data.barcode === 'string' &&
            item.data.barcode.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters?.category) {
      filtered = filtered.filter(
        (item) =>
          item.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Apply location filter
    if (filters?.location) {
      filtered = filtered.filter(
        (item) =>
          item.location?.toLowerCase() === filters.location?.toLowerCase()
      );
    }

    // Apply status filter
    if (filters?.status) {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === filters.status?.toLowerCase()
      );
    }

    return filtered;
  }

  /**
   * @deprecated Use InventoryDataTransformer.transformForModal() instead
   */
  transformDataForModal(items: LocalInventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
    location: string;
    lastUpdated: string;
  }> {
    console.warn(
      'UnifiedInventoryDataService.transformDataForModal() is deprecated. Use InventoryDataTransformer.transformForModal() instead.'
    );
    // Convert LocalInventoryItem to InventoryItem for compatibility
    const inventoryItems = items.map((item) => ({
      id: this.getItemId(item),
      name: item.name || '',
      barcode:
        item.data?.barcode && typeof item.data.barcode === 'string'
          ? item.data.barcode
          : '',
      currentPhase: this.getItemStatus(item),
      category: item.category || '',
      location: item.location || 'Unknown',
      lastUpdated:
        (item.data as { updatedAt?: string })?.updatedAt ||
        new Date().toISOString(),
    }));

    // Return the transformed items directly since InventoryDataTransformer.transformForModal expects InventoryItem[]
    return inventoryItems;
  }

  clearCache(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
  }

  async refreshData(): Promise<InventoryDataResponse> {
    this.clearCache();
    return this.fetchAllInventoryData();
  }

  private getItemId(item: LocalInventoryItem): string {
    return (
      item.id ||
      (item.data?.toolId && typeof item.data.toolId === 'string'
        ? item.data.toolId
        : '') ||
      (item.data?.supplyId && typeof item.data.supplyId === 'string'
        ? item.data.supplyId
        : '') ||
      (item.data?.equipmentId && typeof item.data.equipmentId === 'string'
        ? item.data.equipmentId
        : '') ||
      (item.data?.hardwareId && typeof item.data.hardwareId === 'string'
        ? item.data.hardwareId
        : '') ||
      ''
    );
  }

  private getItemStatus(item: LocalInventoryItem): string {
    return getItemStatus(item);
  }

  private getDefaultCategories(): string[] {
    return ['Tools', 'Supplies', 'Equipment', 'Office Hardware'];
  }
}

// ============================================================================
// SERVICE INSTANCE
// ============================================================================

export const unifiedInventoryDataService =
  new UnifiedInventoryDataServiceImpl();
