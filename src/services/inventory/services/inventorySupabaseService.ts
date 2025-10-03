import { isSupabaseConfigured, supabase } from '../../../lib/supabase';
import { INVENTORY_CONFIG } from '../../../config/inventoryConfig';
import { InventoryCrudOperations } from '../utils/inventoryCrudOperations';
import { RealtimeManager } from '../../_core/realtimeManager';
import { InventoryItem } from '../../../types/inventoryTypes';

export class InventorySupabaseService {
  private static instance: InventorySupabaseService;
  private isConnected = false;
  private connectionTestPromise: Promise<boolean> | null = null;

  private constructor() {}

  static getInstance(): InventorySupabaseService {
    if (!InventorySupabaseService.instance) {
      InventorySupabaseService.instance = new InventorySupabaseService();
    }
    return InventorySupabaseService.instance;
  }

  /**
   * Test Supabase connection and cache the result
   */
  async testConnection(): Promise<boolean> {
    if (this.connectionTestPromise) {
      return this.connectionTestPromise;
    }

    this.connectionTestPromise = this.performConnectionTest();
    return this.connectionTestPromise;
  }

  private async performConnectionTest(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, connection test skipped');
      return false;
    }

    try {
      const { error } = await supabase
        .from('inventory_items')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        this.isConnected = false;
        return false;
      }

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Supabase connection test error:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get inventory analytics
   */
  async getAnalytics(): Promise<{
    totalItems: number;
    activeItems: number;
    totalValue: number;
    categories: { [key: string]: number };
  }> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    return InventoryCrudOperations.getAnalytics();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map((item) => item.category).filter(Boolean) || [])
      );

      return uniqueCategories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get all locations
   */
  async getLocations(): Promise<string[]> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      const { error } = await supabase
        .from('inventory_items')
        .select('location')
        .not('location', 'is', null);

      if (error) {
        throw new Error(`Failed to fetch locations: ${error.message}`);
      }

      // Extract unique locations - removed since location column doesn't exist
      const uniqueLocations: string[] = [];

      return uniqueLocations;
    } catch (error) {
      console.error('❌ Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Get all items with pagination
   */
  async getItems(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    location?: string;
  }): Promise<{
    data: unknown[];
    count: number;
    error: string | null;
  }> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      let query = supabase
        .from('inventory_items')
        .select('*', { count: 'exact' });

      // Apply filters
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      // Removed location filter since location column doesn't exist
      // if (options?.location) {
      //   query = query.eq('location', options.location);
      // }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`);
      }

      return {
        data: data || [],
        count: count || 0,
        error: null,
      };
    } catch (error) {
      console.error('❌ Error fetching items:', error);
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Subscribe to real-time inventory changes
   */
  subscribeToChanges(callback: (payload: unknown) => void): () => void {
    if (!INVENTORY_CONFIG.realtime.enabled) {
      return () => {};
    }

    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe('inventory_items', callback, {
        event: '*',
      });
    } catch (error) {
      console.error('❌ Failed to set up real-time subscription:', error);
      return () => {};
    }
  }

  /**
   * Reset connection test cache
   */
  resetConnectionTest(): void {
    this.connectionTestPromise = null;
    this.isConnected = false;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { isConnected: boolean; isConfigured: boolean } {
    return {
      isConnected: this.isConnected,
      isConfigured: isSupabaseConfigured(),
    };
  }

  /**
   * Get a single inventory item by ID
   */
  async getItemById(id: string): Promise<InventoryItem | null> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to fetch item: ${error.message}`);
      }

      return data as InventoryItem;
    } catch (error) {
      console.error('❌ Error fetching item by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new inventory item
   */
  async createItem(
    item: Omit<
      InventoryItem,
      'id' | 'created_at' | 'updated_at' | 'lastUpdated'
    >
  ): Promise<InventoryItem> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      // Convert data to Json type for Supabase compatibility
      const itemForInsert = {
        ...item,
        data: item.data as Record<string, unknown>, // Cast to Json type
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert(itemForInsert)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create item: ${error.message}`);
      }

      return data as InventoryItem;
    } catch (error) {
      console.error('❌ Error creating item:', error);
      throw error;
    }
  }

  /**
   * Update an existing inventory item
   */
  async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      // Convert data to Json type for Supabase compatibility
      const updatesForDb = {
        ...updates,
        data: updates.data as Record<string, unknown>, // Cast to Json type
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updatesForDb)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update item: ${error.message}`);
      }

      return data as InventoryItem;
    } catch (error) {
      console.error('❌ Error updating item:', error);
      throw error;
    }
  }

  /**
   * Delete an inventory item
   */
  async deleteItem(id: string): Promise<void> {
    const isConnected = await this.testConnection();

    if (!isConnected) {
      throw new Error('Supabase connection not available');
    }

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete item: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const inventorySupabaseService = InventorySupabaseService.getInstance();
