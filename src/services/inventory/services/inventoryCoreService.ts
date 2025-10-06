import { isSupabaseConfigured as _isSupabaseConfigured } from '@/lib/supabase';
import {
  // InventoryResponse,
  InventoryFilters,
} from '../types/inventoryServiceTypes';
import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryCrudOperations } from '../utils/inventoryCrudOperations';
import { InventoryCacheManager } from '../utils/inventoryCache';

export class InventoryCoreService {
  private cacheManager: InventoryCacheManager;

  constructor() {
    this.cacheManager = new InventoryCacheManager();
  }

  async getFilteredItems(filters: InventoryFilters): Promise<InventoryItem[]> {
    const response = await InventoryCrudOperations.getItems(filters);
    return response.data;
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    const response = await InventoryCrudOperations.getItems();
    return response.data;
  }

  async refresh(): Promise<void> {
    this.cacheManager.clearCache();
  }

  clearCache(): void {
    this.cacheManager.clearCache();
  }

  getCacheManager(): InventoryCacheManager {
    return this.cacheManager;
  }
}
