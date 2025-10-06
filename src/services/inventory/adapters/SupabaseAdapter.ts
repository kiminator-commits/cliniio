import {
  InventoryDataAdapter,
  DataSourceConfig,
  AdapterMetadata,
} from './InventoryDataAdapter';
import { InventoryItem } from '../../../types/inventoryTypes';
import { InventoryResponse } from '../types/inventoryServiceTypes';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { InventoryDataTransformer } from '../utils/inventoryTransformers';
import { InventoryCrudOperations } from '../utils/inventoryCrudOperations';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { TypedSupabaseAdapter } from './TypedSupabaseAdapter';
import { RealtimeInventoryPayload } from '../types/supabaseTypes';

// === 1) ADD THESE HELPERS NEAR THE TOP OF THE FILE (module scope) ===

export class SupabaseAdapter implements InventoryDataAdapter {
  private config: DataSourceConfig;
  private isInitialized = false;
  private lastError: Error | null = null;
  private lastSyncTime: Date | null = null;
  private pendingChanges = false;
  private cachedItems: unknown[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5000; // 5 seconds cache
  private typedAdapter: TypedSupabaseAdapter;

  constructor(config: DataSourceConfig) {
    this.config = config;
    this.typedAdapter = new TypedSupabaseAdapter();
  }

  // Make sure the class has these fields (ADD if missing):
  private client: SupabaseClient | null = null;
  private initPromise: Promise<SupabaseClient> | null = null;

  // ADD (or REPLACE existing init logic) this private helper to guarantee a client:
  private getClient = async (): Promise<SupabaseClient> => {
    if (this.client) return this.client;
    if (!this.initPromise) {
      // Kick off one-time init
      this.initPromise = (async () => {
        // Ensure we construct the client here and keep a reference
        // const url = import.meta.env.VITE_SUPABASE_URL!;
        // const key = import.meta.env.VITE_SUPABASE_ANON_KEY!;
        // Use centralized supabase client
        const client = supabase;

        // Lightweight probe to ensure `from` exists and auth/cors are sane
        const { error } = await client
          .from('inventory_items')
          .select('id')
          .limit(1);
        if (error) {
          console.warn(
            'SupabaseAdapter.ts:test ❌ Probe failed',
            error.message || error
          );
          // Still return the client; queries will surface errors to the caller
        } else {
          console.log('Supabase client initialized successfully');
        }

        this.client = client;
        return client;
      })();
    }
    return this.initPromise;
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return; // Already initialized, prevent multiple initializations
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured');
    }

    // Initialize without blocking database call - test connection asynchronously
    this.isInitialized = true;

    // Test connection asynchronously without blocking initialization
    this.testConnectionAsync();
  }

  private async testConnectionAsync(): Promise<void> {
    try {
      const response = await InventoryCrudOperations.getItems();
      if (response.error) {
        console.warn('⚠️ Supabase connection test failed:', response.error);
        // Don't throw error, just log warning
      } else {
        console.log('Supabase connection test passed');
      }
    } catch (error) {
      console.warn('⚠️ Supabase connection test failed:', error);
      // Don't throw error, just log warning
    }
  }

  public getAllItems = async (params?: {
    facilityId?: string;
  }): Promise<unknown[]> => {
    // Check cache first
    const now = Date.now();
    if (this.cachedItems && now - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cachedItems;
    }

    // Get facility ID from params or current user context
    let facilityId = params?.facilityId;
    if (!facilityId) {
      const { FacilityService } = await import('@/services/facilityService');
      facilityId = await FacilityService.getCurrentFacilityId();
    }

    // Use typed adapter for type-safe operations
    const result = await this.typedAdapter.getAllItems({
      filters: {
        facility_id: facilityId,
      },
    });

    if (!result.success || !result.data) {
      console.warn('Failed to get inventory items:', result.error);
      throw new Error(result.error || 'Failed to get inventory items');
    }

    // Cache the results
    this.cachedItems = result.data;
    this.cacheTimestamp = Date.now();

    return result.data;
  };

  async getItemsByCategory(_category: string): Promise<InventoryItem[]> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const result = await this.typedAdapter.getAllItems({
        filters: {
          _category,
        },
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get items by category');
      }

      return result.data as unknown;
    } catch (error) {
      throw new Error(
        `Failed to get items by category: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getFilteredItems(
    searchQuery: string,
    filters?: Record<string, unknown>
  ): Promise<InventoryItem[]> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const result = await this.typedAdapter.getAllItems({
        filters: {
          search: searchQuery,
          ...filters,
        },
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get filtered items');
      }

      return result.data as unknown;
    } catch (error) {
      throw new Error(
        `Failed to get filtered items: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getCategories(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const response = await InventoryCrudOperations.getCategories();
      return response || [];
    } catch (error) {
      throw new Error(
        `Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async fetchCategories(): Promise<string[]> {
    return this.getCategories();
  }

  async updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const supabaseItem = InventoryDataTransformer.transformToSupabase(item);
      const response = await InventoryCrudOperations.updateItem(
        id,
        supabaseItem
      );
      return response;
    } catch (error) {
      throw new Error(
        `Failed to update inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      await InventoryCrudOperations.deleteItem(id);
    } catch (error) {
      throw new Error(
        `Failed to delete inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Required interface methods
  isConnected(): boolean {
    return this.isInitialized;
  }

  getMetadata(): AdapterMetadata {
    return {
      name: 'Supabase Adapter',
      version: '1.0.0',
      description: 'Supabase-based inventory data adapter',
      capabilities: {
        supportsRead: true,
        supportsWrite: true,
        supportsDelete: true,
        supportsRealTime: true,
        supportsOffline: false,
        supportsBatch: false,
      },
      config: this.config,
    };
  }

  async fetchAllInventoryData(): Promise<InventoryResponse> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const items = await this.getAllItems();

      // Return all items without hardcoded filtering
      // Let the UI handle categorization dynamically
      return {
        data: items as InventoryItem[],
        error: null,
        count: items.length,
      };
    } catch (error) {
      // Handle errors from getAllItems
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        data: [],
        error: errorMessage,
        count: 0,
      };
    }
  }

  async fetchInventoryItems(): Promise<InventoryItem[]> {
    return this.getAllItems() as unknown;
  }

  async addInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const supabaseItem = InventoryDataTransformer.transformToSupabase(item);
      const response = await InventoryCrudOperations.createItem(
        supabaseItem as Omit<InventoryItem, 'id' | 'lastUpdated'>
      );
      return response;
    } catch (error) {
      throw new Error(
        `Failed to add inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async addCategory(category: string): Promise<string> {
    // This would need to be implemented based on your Supabase schema
    // For now, we'll just return the category name
    return category;
  }

  async deleteCategory(_category: string): Promise<void> {
    // This would need to be implemented based on your Supabase schema
    // For now, we'll just log it
  }

  async batchAddItems(items: InventoryItem[]): Promise<InventoryItem[]> {
    const results: InventoryItem[] = [];
    for (const item of items) {
      try {
        const result = await this.addInventoryItem(item);
        results.push(result);
      } catch (error) {
        this.lastError = error as Error;
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
        this.lastError = error as Error;
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
        this.lastError = error as Error;
        throw error;
      }
    }
  }

  async sync(): Promise<void> {
    try {
      this.lastSyncTime = new Date();
      this.pendingChanges = false;
    } catch (error) {
      this.lastError = error as Error;
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

  async fetchData(): Promise<void> {
    // Data is fetched on-demand in Supabase, so this is a no-op
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async createItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const supabaseItem = InventoryDataTransformer.transformToSupabase(item);
      const response = await InventoryCrudOperations.createItem(
        supabaseItem as Omit<InventoryItem, 'id' | 'lastUpdated'>
      );
      return response;
    } catch (error) {
      throw new Error(
        `Failed to create inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const supabaseUpdates =
        InventoryDataTransformer.transformToSupabase(updates);
      const response = await InventoryCrudOperations.updateItem(
        id,
        supabaseUpdates
      );
      return response;
    } catch (error) {
      throw new Error(
        `Failed to update inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async deleteItem(id: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      await InventoryCrudOperations.deleteItem(id);
    } catch (error) {
      throw new Error(
        `Failed to delete inventory item: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getAnalyticsData(): Promise<Record<string, unknown>> {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      const response = await InventoryCrudOperations.getAnalytics();
      return {
        totalItems: response.totalItems,
        activeItems: response.activeItems,
        totalValue: response.totalValue,
        categories: response.categories,
      };
    } catch (error) {
      throw new Error(
        `Failed to get analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Helper methods for data transformation
  private transformToInventoryItems(
    supabaseItems: Record<string, unknown>[]
  ): InventoryItem[] {
    return supabaseItems.map((item) =>
      InventoryDataTransformer.transformFromSupabase(item)
    );
  }

  // Real-time subscription methods
  subscribeToChanges(
    callback?: (payload: RealtimeInventoryPayload) => void
  ): () => void {
    if (!this.isInitialized) {
      throw new Error('Supabase adapter not initialized');
    }

    try {
      // Use typed adapter for type-safe realtime subscriptions
      return this.typedAdapter.subscribeToChanges(
        (payload: RealtimeInventoryPayload) => {
          if (callback) {
            callback(payload);
          }
        },
        { event: '*' }
      );
    } catch (error) {
      console.error(
        '❌ Failed to set up real-time subscription in SupabaseAdapter:',
        error
      );
      // Return no-op unsubscribe function as fallback
      return () => {};
    }
  }

  // Configuration methods
  getConfig(): DataSourceConfig {
    return this.config;
  }

  // Cache management
  clearCache(): void {
    this.cachedItems = null;
    this.cacheTimestamp = 0;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
