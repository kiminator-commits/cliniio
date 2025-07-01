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
}

export class InventoryDataServiceImpl implements InventoryDataService {
  async fetchAllInventoryData(): Promise<InventoryDataResponse> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async fetchCategories(): Promise<string[]> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async addInventoryItem(): Promise<InventoryItem> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async updateInventoryItem(): Promise<InventoryItem> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async deleteInventoryItem(): Promise<void> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async addCategory(): Promise<string> {
    throw new Error('Method not implemented. Use concrete implementation.');
  }

  async deleteCategory(): Promise<void> {
    throw new Error('Method not implemented. Use concrete implementation.');
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

      // Additional filters
      if (filters) {
        if (filters.category && item.category !== filters.category) return false;
        if (filters.location && item.location !== filters.location) return false;
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
      name: item.item,
      barcode: item.barcode || '',
      currentPhase: this.getItemStatus(item),
      category: item.category,
    }));
  }

  protected getItemId(item: LocalInventoryItem): string {
    return item.id || item.barcode || item.item;
  }

  protected getItemStatus(item: LocalInventoryItem): string {
    return item.currentPhase || item.status || 'Unknown';
  }
}
