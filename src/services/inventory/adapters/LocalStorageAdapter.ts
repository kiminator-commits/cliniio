import { InventoryItem } from '../../../types/inventoryTypes';
import { InventoryResponse } from '../types/inventoryServiceTypes';
import {
  BaseInventoryDataAdapter,
  DataSourceConfig,
  AdapterCapabilities,
} from './InventoryDataAdapter';

interface LocalStorageInventoryData {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEYS = {
  INVENTORY_DATA: 'inventory_data',
  CATEGORIES: 'inventory_categories',
  LAST_SYNC: 'inventory_last_sync',
  PENDING_CHANGES: 'inventory_pending_changes',
} as const;

export class LocalStorageAdapter extends BaseInventoryDataAdapter {
  private storage: Storage;

  constructor(config: DataSourceConfig = { type: 'localStorage' }) {
    const capabilities: AdapterCapabilities = {
      supportsRead: true,
      supportsWrite: true,
      supportsDelete: true,
      supportsRealTime: false,
      supportsOffline: true,
      supportsBatch: true,
    };

    super(config, {
      name: 'LocalStorageAdapter',
      version: '1.0.0',
      description: 'Adapter for localStorage-based inventory data',
      capabilities,
    });

    this.storage = window.localStorage;
  }

  async initialize(): Promise<void> {
    try {
      // Check if localStorage is available
      if (!this.storage) {
        throw new Error('localStorage is not available');
      }

      // Initialize with default data if empty
      if (!this.storage.getItem(STORAGE_KEYS.INVENTORY_DATA)) {
        await this.initializeDefaultData();
      }

      this.isInitialized = true;
      this.lastSyncTime = this.getLastSyncTimeFromStorage();
      this.pendingChanges = this.getPendingChangesFromStorage();
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.isInitialized && !!this.storage;
  }

  async fetchAllInventoryData(): Promise<InventoryResponse> {
    this.validateInitialization();

    const data = this.getInventoryDataFromStorage();
    const allItems: InventoryItem[] = [];

    allItems.push(...data.tools);
    allItems.push(...data.supplies);
    allItems.push(...data.equipment);
    allItems.push(...data.officeHardware);

    return {
      data: allItems,
      error: null,
      count: allItems.length,
    };
  }

  async fetchInventoryItems(): Promise<any[]> {
    this.validateInitialization();

    const data = this.getInventoryDataFromStorage();
    const allItems: any[] = [];

    allItems.push(...data.tools);
    allItems.push(...data.supplies);
    allItems.push(...data.equipment);
    allItems.push(...data.officeHardware);

    return allItems;
  }

  async fetchCategories(): Promise<string[]> {
    this.validateInitialization();

    const categories = this.storage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : this.getDefaultCategories();
  }

  async addInventoryItem(item: any): Promise<any> {
    this.validateInitialization();

    const data = this.getInventoryDataFromStorage();
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    // Add to appropriate category
    const category = (newItem.category || '').toLowerCase();
    if (category.includes('tool') || category.includes('instrument')) {
      data.tools.push(newItem);
    } else if (category.includes('supply') || category.includes('consumable')) {
      data.supplies.push(newItem);
    } else if (category.includes('equipment') || category.includes('device')) {
      data.equipment.push(newItem);
    } else {
      data.officeHardware.push(newItem);
    }

    this.saveInventoryDataToStorage(data);
    this.setPendingChanges();
    this.updateLastSyncTime();

    return newItem;
  }

  async updateInventoryItem(
    id: string,
    item: Partial<any>
  ): Promise<any> {
    this.validateInitialization();

    const data = this.getInventoryDataFromStorage();
    const updatedItem = { ...item, id, lastUpdated: new Date().toISOString() };

    // Find and update item in appropriate category
    const categories = [
      data.tools,
      data.supplies,
      data.equipment,
      data.officeHardware,
    ];
    let found = false;

    for (const category of categories) {
      const index = category.findIndex(
        (catItem: InventoryItem) => this.getItemId(catItem) === id
      );
      if (index !== -1) {
        category[index] = { ...category[index], ...updatedItem };
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.saveInventoryDataToStorage(data);
    this.setPendingChanges();
    this.updateLastSyncTime();

    return updatedItem as InventoryItem;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    this.validateInitialization();

    const data = this.getInventoryDataFromStorage();
    const categories = [
      data.tools,
      data.supplies,
      data.equipment,
      data.officeHardware,
    ];
    let found = false;

    for (const category of categories) {
      const index = category.findIndex(
        (catItem: InventoryItem) => this.getItemId(catItem) === id
      );
      if (index !== -1) {
        category.splice(index, 1);
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.saveInventoryDataToStorage(data);
    this.setPendingChanges();
    this.updateLastSyncTime();
  }

  async addCategory(category: string): Promise<string> {
    this.validateInitialization();

    const categories = await this.fetchCategories();
    if (!categories.includes(category)) {
      categories.push(category);
      this.storage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.setPendingChanges();
      this.updateLastSyncTime();
    }

    return category;
  }

  async deleteCategory(category: string): Promise<void> {
    this.validateInitialization();

    const categories = await this.fetchCategories();
    const index = categories.indexOf(category);
    if (index !== -1) {
      categories.splice(index, 1);
      this.storage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      this.setPendingChanges();
      this.updateLastSyncTime();
    }
  }

  private getInventoryDataFromStorage(): LocalStorageInventoryData {
    const data = this.storage.getItem(STORAGE_KEYS.INVENTORY_DATA);
    if (data) {
      return JSON.parse(data);
    }

    return {
      tools: [],
      supplies: [],
      equipment: [],
      officeHardware: [],
      categories: this.getDefaultCategories(),
      isLoading: false,
      error: null,
    };
  }

  private saveInventoryDataToStorage(data: LocalStorageInventoryData): void {
    this.storage.setItem(STORAGE_KEYS.INVENTORY_DATA, JSON.stringify(data));
  }

  private getLastSyncTimeFromStorage(): Date | null {
    const lastSync = this.storage.getItem(STORAGE_KEYS.LAST_SYNC);
    return lastSync ? new Date(lastSync) : null;
  }

  private getPendingChangesFromStorage(): boolean {
    const pending = this.storage.getItem(STORAGE_KEYS.PENDING_CHANGES);
    return pending ? JSON.parse(pending) : false;
  }

  private updateLastSyncTime(): void {
    this.lastSyncTime = new Date();
    this.storage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      this.lastSyncTime.toISOString()
    );
  }

  protected setPendingChanges(): void {
    this.pendingChanges = true;
    this.storage.setItem(STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(true));
  }

  private async initializeDefaultData(): Promise<void> {
    const defaultData: LocalStorageInventoryData = {
      tools: [],
      supplies: [],
      equipment: [],
      officeHardware: [],
      categories: this.getDefaultCategories(),
      isLoading: false,
      error: null,
    };

    this.saveInventoryDataToStorage(defaultData);
    this.storage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(this.getDefaultCategories())
    );
    this.storage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    this.storage.setItem(STORAGE_KEYS.PENDING_CHANGES, JSON.stringify(false));
  }

  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getItemId(item: InventoryItem): string {
    if (item.data && typeof item.data === 'object' && item.data !== null) {
      const data = item.data as Record<string, unknown>;
      
      if (data.toolId && typeof data.toolId === 'string') {
        return data.toolId;
      }
      if (data.supplyId && typeof data.supplyId === 'string') {
        return data.supplyId;
      }
      if (data.equipmentId && typeof data.equipmentId === 'string') {
        return data.equipmentId;
      }
      if (data.hardwareId && typeof data.hardwareId === 'string') {
        return data.hardwareId;
      }
    }
    
    return item.id || this.generateId();
  }

  private getDefaultCategories(): string[] {
    return [
      'Surgical Instruments',
      'Medical Supplies',
      'Equipment',
      'Office Hardware',
      'Consumables',
      'Disposables',
      'Tools',
      'Devices',
    ];
  }
}
