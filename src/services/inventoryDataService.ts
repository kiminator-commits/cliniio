import {
  inventoryData as staticInventoryData,
  suppliesData as staticSuppliesData,
  equipmentData as staticEquipmentData,
  officeHardwareData as staticOfficeHardwareData,
} from '@/utils/Inventory/inventoryData';
import { InventoryItem, LocalInventoryItem } from '@/types/inventoryTypes';

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

export interface InventoryDataService {
  // Core data fetching methods
  fetchAllInventoryData(): Promise<InventoryDataResponse>;
  fetchInventoryItems(): Promise<InventoryItem[]>;
  fetchCategories(): Promise<string[]>;

  // CRUD operations
  addInventoryItem(item: InventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  addCategory(category: string): Promise<string>;
  deleteCategory(category: string): Promise<void>;

  // Data transformation and filtering
  getFilteredData(
    data: LocalInventoryItem[],
    searchQuery: string,
    filters?: FilterOptions
  ): LocalInventoryItem[];
  transformDataForModal(items: LocalInventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;

  // Cache management
  clearCache(): void;
  refreshData(): Promise<InventoryDataResponse>;
}

class InventoryDataServiceImpl implements InventoryDataService {
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
      // For now, just return static data since we're not connected to any backend
      const response: InventoryDataResponse = {
        tools: staticInventoryData,
        supplies: staticSuppliesData,
        equipment: staticEquipmentData,
        officeHardware: staticOfficeHardwareData,
        categories: this.getDefaultCategories(),
        isLoading: false,
        error: null,
      };

      // Update cache
      this.cache.data = response;
      this.cache.timestamp = Date.now();

      return response;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch inventory data';

      // Return cached data if available, otherwise return static data
      if (this.cache.data) {
        return { ...this.cache.data, error: this.error };
      }

      return {
        tools: staticInventoryData,
        supplies: staticSuppliesData,
        equipment: staticEquipmentData,
        officeHardware: staticOfficeHardwareData,
        categories: this.getDefaultCategories(),
        isLoading: false,
        error: this.error,
      };
    } finally {
      this.isLoading = false;
    }
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    // Return empty array for now since we're not connected to backend
    return [];
  }

  async fetchCategories(): Promise<string[]> {
    // Return default categories since we're not connected to backend
    return this.getDefaultCategories();
  }

  async addInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    // For now, just return the item as-is since we're not persisting to backend
    this.clearCache(); // Invalidate cache after adding item
    return item;
  }

  async updateInventoryItem(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    // For now, just return the updated item since we're not persisting to backend
    const updatedItem = { ...item } as InventoryItem;
    this.clearCache(); // Invalidate cache after updating item
    return updatedItem;
  }

  async deleteInventoryItem(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _id: string
  ): Promise<void> {
    // For now, just clear cache since we're not persisting to backend
    this.clearCache(); // Invalidate cache after deleting item
  }

  async addCategory(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _category: string
  ): Promise<string> {
    // For now, just return the category since we're not persisting to backend
    this.clearCache(); // Invalidate cache after adding category
    return _category;
  }

  async deleteCategory(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _category: string
  ): Promise<void> {
    // For now, just clear cache since we're not persisting to backend
    this.clearCache(); // Invalidate cache after deleting category
  }

  getFilteredData(
    data: LocalInventoryItem[],
    searchQuery: string,
    filters?: FilterOptions
  ): LocalInventoryItem[] {
    if (!searchQuery.trim() && !filters) return data;

    return data.filter(item => {
      // Search filtering
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableFields = ['item', 'category', 'location'];
        const matchesSearch = searchableFields.some(field => {
          const value = item[field as keyof LocalInventoryItem];
          return value?.toString().toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // Additional filters can be added here
      if (filters) {
        // Apply category filter
        if (filters.category && item.category !== filters.category) return false;

        // Apply location filter
        if (filters.location && item.location !== filters.location) return false;

        // Apply status filter - handle different status fields for different item types
        if (filters.status) {
          const status = this.getItemStatus(item);
          if (status !== filters.status) return false;
        }
      }

      return true;
    });
  }

  transformDataForModal(items: LocalInventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }> {
    return items.map(item => ({
      id: this.getItemId(item),
      name: item.item || '',
      barcode: this.getItemId(item),
      currentPhase: this.getItemStatus(item),
      category: item.category || '',
    }));
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
    if ('toolId' in item) return item.toolId;
    if ('supplyId' in item) return item.supplyId;
    if ('equipmentId' in item) return item.equipmentId;
    if ('hardwareId' in item) return item.hardwareId;
    return '';
  }

  private getItemStatus(item: LocalInventoryItem): string {
    if ('p2Status' in item) return item.p2Status;
    if ('status' in item) return item.status;
    return 'unknown';
  }

  private getDefaultCategories(): string[] {
    return ['Surgical', 'Dental', 'Supplies', 'Equipment', 'Office Hardware'];
  }
}

// Export singleton instance
export const inventoryDataService = new InventoryDataServiceImpl();
