import { InventoryItem } from '../types/supabaseTypes';
import { InventoryResponse } from '../types/inventoryServiceTypes';

export interface DataSourceConfig {
  type: 'static' | 'api' | 'localStorage' | 'indexedDB' | 'supabase';
  endpoint?: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface AdapterCapabilities {
  supportsRead: boolean;
  supportsWrite: boolean;
  supportsDelete: boolean;
  supportsRealTime: boolean;
  supportsOffline: boolean;
  supportsBatch: boolean;
}

export interface AdapterMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: AdapterCapabilities;
  config: DataSourceConfig;
}

export interface InventoryDataAdapter {
  // Core adapter methods
  initialize(): Promise<void>;
  isConnected(): boolean;
  getMetadata(): AdapterMetadata;

  // Data access methods
  fetchAllInventoryData(): Promise<InventoryResponse>;
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

  // Batch operations
  batchAddItems(items: InventoryItem[]): Promise<InventoryItem[]>;
  batchUpdateItems(
    updates: Array<{ id: string; item: Partial<InventoryItem> }>
  ): Promise<InventoryItem[]>;
  batchDeleteItems(ids: string[]): Promise<void>;

  // Data synchronization
  sync(): Promise<void>;
  getLastSyncTime(): Date | null;
  hasPendingChanges(): boolean;

  // Error handling
  getLastError(): Error | null;
  clearError(): void;

  // Cleanup
  disconnect(): Promise<void>;
}

export abstract class BaseInventoryDataAdapter implements InventoryDataAdapter {
  protected config: DataSourceConfig;
  protected metadata: AdapterMetadata;
  protected isInitialized = false;
  protected lastError: Error | null = null;
  protected lastSyncTime: Date | null = null;
  protected pendingChanges = false;

  constructor(
    config: DataSourceConfig,
    metadata: Omit<AdapterMetadata, 'config'>
  ) {
    this.config = config;
    this.metadata = {
      ...metadata,
      config,
    };
  }

  abstract initialize(): Promise<void>;
  abstract isConnected(): boolean;
  abstract fetchAllInventoryData(): Promise<InventoryResponse>;
  abstract fetchInventoryItems(): Promise<InventoryItem[]>;
  abstract fetchCategories(): Promise<string[]>;
  abstract addInventoryItem(item: InventoryItem): Promise<InventoryItem>;
  abstract updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem>;
  abstract deleteInventoryItem(id: string): Promise<void>;
  abstract addCategory(category: string): Promise<string>;
  abstract deleteCategory(category: string): Promise<void>;

  getMetadata(): AdapterMetadata {
    return { ...this.metadata };
  }

  async batchAddItems(items: InventoryItem[]): Promise<InventoryItem[]> {
    const results: InventoryItem[] = [];
    for (const item of items) {
      try {
        const result = await this.addInventoryItem(item);
        results.push(result);
      } catch (error) {
        this.setError(error as Error);
        throw error;
      }
    }
    return results;
  }

  async batchUpdateItems(
    updates: Array<{ id: string; item: Partial<InventoryItem> }>
  ): Promise<InventoryItem[]> {
    const results: InventoryItem[] = [];
    for (const update of updates) {
      try {
        const result = await this.updateInventoryItem(update.id, update.item);
        results.push(result);
      } catch (error) {
        this.setError(error as Error);
        throw error;
      }
    }
    return results;
  }

  async batchDeleteItems(ids: string[]): Promise<void> {
    for (const id of ids) {
      try {
        await this.deleteInventoryItem(id);
      } catch (error) {
        this.setError(error as Error);
        throw error;
      }
    }
  }

  async sync(): Promise<void> {
    try {
      this.lastSyncTime = new Date();
      this.pendingChanges = false;
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  hasPendingChanges(): boolean {
    return this.pendingChanges;
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  clearError(): void {
    this.lastError = null;
  }

  async disconnect(): Promise<void> {
    this.isInitialized = false;
    this.lastError = null;
  }

  protected setError(error: Error): void {
    this.lastError = error;
    console.error(`[${this.metadata.name}] Error:`, error);
  }

  protected setPendingChanges(): void {
    this.pendingChanges = true;
  }

  protected validateInitialization(): void {
    if (!this.isInitialized) {
      throw new Error(
        `Adapter ${this.metadata.name} is not initialized. Call initialize() first.`
      );
    }
  }
}
