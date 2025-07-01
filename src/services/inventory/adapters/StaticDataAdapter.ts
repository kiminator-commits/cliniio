import {
  inventoryData as staticInventoryData,
  suppliesData as staticSuppliesData,
  equipmentData as staticEquipmentData,
  officeHardwareData as staticOfficeHardwareData,
} from '@/utils/Inventory/inventoryData';
import { InventoryItem, LocalInventoryItem } from '@/types/inventoryTypes';
import { InventoryDataResponse } from '../InventoryDataService';
import {
  BaseInventoryDataAdapter,
  DataSourceConfig,
  AdapterCapabilities,
} from './InventoryDataAdapter';

export class StaticDataAdapter extends BaseInventoryDataAdapter {
  private data: InventoryDataResponse | null = null;

  constructor(config: DataSourceConfig = { type: 'static' }) {
    const capabilities: AdapterCapabilities = {
      supportsRead: true,
      supportsWrite: false, // Static data is read-only
      supportsDelete: false,
      supportsRealTime: false,
      supportsOffline: true,
      supportsBatch: false,
    };

    super(config, {
      name: 'StaticDataAdapter',
      version: '1.0.0',
      description: 'Adapter for static inventory data',
      capabilities,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Load static data
      this.data = {
        tools: staticInventoryData,
        supplies: staticSuppliesData,
        equipment: staticEquipmentData,
        officeHardware: staticOfficeHardwareData,
        categories: this.getDefaultCategories(),
        isLoading: false,
        error: null,
      };

      this.isInitialized = true;
      this.lastSyncTime = new Date();
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.isInitialized && this.data !== null;
  }

  async fetchAllInventoryData(): Promise<InventoryDataResponse> {
    this.validateInitialization();

    if (!this.data) {
      throw new Error('Static data not loaded');
    }

    return { ...this.data };
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    this.validateInitialization();

    // Convert static data to InventoryItem format
    const allItems: InventoryItem[] = [];

    if (this.data) {
      allItems.push(...this.convertToInventoryItems(this.data.tools));
      allItems.push(...this.convertToInventoryItems(this.data.supplies));
      allItems.push(...this.convertToInventoryItems(this.data.equipment));
      allItems.push(...this.convertToInventoryItems(this.data.officeHardware));
    }

    return allItems;
  }

  async fetchCategories(): Promise<string[]> {
    this.validateInitialization();

    if (!this.data) {
      return this.getDefaultCategories();
    }

    return [...this.data.categories];
  }

  async addInventoryItem(): Promise<InventoryItem> {
    throw new Error('Static data adapter does not support write operations');
  }

  async updateInventoryItem(): Promise<InventoryItem> {
    throw new Error('Static data adapter does not support write operations');
  }

  async deleteInventoryItem(): Promise<void> {
    throw new Error('Static data adapter does not support delete operations');
  }

  async addCategory(): Promise<string> {
    throw new Error('Static data adapter does not support write operations');
  }

  async deleteCategory(): Promise<void> {
    throw new Error('Static data adapter does not support delete operations');
  }

  private convertToInventoryItems(localItems: LocalInventoryItem[]): InventoryItem[] {
    return localItems.map(item => ({
      id: this.getItemId(item),
      name: item.item || '',
      category: item.category || '',
      location: item.location || '',
      status: this.getItemStatus(item),
      description: item.description || '',
      quantity: this.getItemQuantity(item),
      unit: item.unit || '',
      minQuantity: item.minQuantity || 0,
      maxQuantity: item.maxQuantity || 0,
      supplier: item.supplier || '',
      cost: item.cost || 0,
      lastUpdated: item.lastUpdated || new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
      barcode: this.getItemId(item),
      notes: item.notes || '',
      tags: item.tags || [],
      imageUrl: item.imageUrl || '',
      isActive: true,
    }));
  }

  private getItemId(item: LocalInventoryItem): string {
    if ('toolId' in item) return item.toolId;
    if ('supplyId' in item) return item.supplyId;
    if ('equipmentId' in item) return item.equipmentId;
    if ('hardwareId' in item) return item.hardwareId;
    return item.id || item.item || '';
  }

  private getItemStatus(item: LocalInventoryItem): string {
    if ('p2Status' in item) return item.p2Status || '';
    if ('status' in item) return item.status || '';
    if ('quantity' in item) return item.quantity?.toString() || '';
    if ('expiration' in item) return item.expiration || '';
    if ('warranty' in item) return item.warranty || '';
    return '';
  }

  private getItemQuantity(item: LocalInventoryItem): number {
    if ('quantity' in item) {
      return typeof item.quantity === 'number' ? item.quantity : 0;
    }
    return 1; // Default quantity for items without quantity field
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
