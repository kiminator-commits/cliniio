import { supabase } from '@/lib/supabaseClient';
import { handleSupabaseError } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];
import { InventoryCrudOperations } from '../inventory/utils/inventoryCrudOperations';
import { RealtimeManager } from '@/services/_core/realtimeManager';

export interface InventoryFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'p2' | 'n/a';
  location?: string;
  search?: string;
}

export interface InventoryResponse {
  data: unknown;
  error: string | null;
  count?: number;
}

/**
 * @deprecated Use InventoryServiceFacade.getAllItems() instead
 * This service is deprecated in favor of the consolidated InventoryServiceFacade
 */
export class SupabaseInventoryService {
  /**
   * Get all inventory items with optional filtering
   * @deprecated Use InventoryServiceFacade.getAllItems() instead
   */
  static async getInventoryItems(
    filters?: InventoryFilters
  ): Promise<InventoryResponse> {
    console.warn(
      'SupabaseInventoryService.getInventoryItems() is deprecated. Use InventoryServiceFacade.getAllItems() instead.'
    );
    try {
      const response = await InventoryCrudOperations.getItems(filters);
      return {
        data: (response as any)?.data,
        error: (response as any)?.error,
        count: (response as any)?.count,
      };
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        data: null,
        error: (supabaseError as any)?.message,
      };
    }
  }

  /**
   * Get inventory item by ID
   * @deprecated Use InventoryServiceFacade.getItemById() instead
   */
  static async getInventoryItemById(id: string): Promise<unknown> {
    console.warn(
      'SupabaseInventoryService.getInventoryItemById() is deprecated. Use InventoryServiceFacade.getItemById() instead.'
    );
    try {
      return await InventoryCrudOperations.getItemById(id);
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      console.error(
        'Failed to get inventory item by ID:',
        (supabaseError as any)?.message
      );
      return null;
    }
  }

  /**
   * Create new inventory item
   * @deprecated Use InventoryServiceFacade.createItem() instead
   */
  static async createInventoryItem(
    item: InventoryItemInsert
  ): Promise<InventoryResponse> {
    console.warn(
      'SupabaseInventoryService.createInventoryItem() is deprecated. Use InventoryServiceFacade.createItem() instead.'
    );
    try {
      // Ensure required fields are provided
      const itemWithDefaults = {
        name: item.name || 'Unnamed Item', // Provide default name if missing
        facility_id: item.facility_id || 'default', // Provide default facility if missing
        data: (item.data as Record<string, unknown>) || {},
        category: item.category || 'general',
        quantity: item.quantity || 0, // Provide default quantity
        created_at: new Date().toISOString(),
      } as Omit<InventoryItem, 'id' | 'lastUpdated'>;

      const result = await InventoryCrudOperations.createItem(itemWithDefaults);
      return {
        data: result ? [result] : null,
        error: null,
        count: result ? 1 : 0,
      };
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      console.error(
        'Failed to create inventory item:',
        (supabaseError as any)?.message
      );
      return {
        data: null,
        error: (supabaseError as any)?.message,
      };
    }
  }

  /**
   * Update inventory item
   * @deprecated Use InventoryServiceFacade.updateItem() instead
   */
  static async updateInventoryItem(
    id: string,
    updates: InventoryItemUpdate
  ): Promise<unknown> {
    console.warn(
      'SupabaseInventoryService.updateInventoryItem() is deprecated. Use InventoryServiceFacade.updateItem() instead.'
    );
    try {
      // Ensure data field is properly typed for Json compatibility
      const updatesWithTypedData = {
        ...updates,
        data: updates.data as any, // Cast to Json type for compatibility
      };

      return await InventoryCrudOperations.updateItem(id, updatesWithTypedData);
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      console.error(
        'Failed to update inventory item:',
        (supabaseError as any)?.message
      );
      return null;
    }
  }

  /**
   * Delete inventory item
   * @deprecated Use InventoryServiceFacade.deleteItem() instead
   */
  static async deleteInventoryItem(id: string): Promise<boolean> {
    console.warn(
      'SupabaseInventoryService.deleteInventoryItem() is deprecated. Use InventoryServiceFacade.deleteItem() instead.'
    );
    try {
      await InventoryCrudOperations.deleteItem(id);
      return true;
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      console.error(
        'Failed to delete inventory item:',
        (supabaseError as any)?.message
      );
      return false;
    }
  }

  /**
   * Get inventory categories
   */
  static async getCategories(): Promise<{
    data: string[] | null;
    error: string | null;
  }> {
    try {
      const categories = await InventoryCrudOperations.getCategories();
      return {
        data: categories,
        error: null,
      };
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        data: null,
        error: (supabaseError as any)?.message,
      };
    }
  }

  /**
   * Get inventory locations
   */
  static async getLocations(): Promise<{
    data: string[] | null;
    error: string | null;
  }> {
    try {
      const locations = await InventoryCrudOperations.getLocations();
      return {
        data: locations,
        error: null,
      };
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        data: null,
        error: (supabaseError as any)?.message,
      };
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(): Promise<{
    data: {
      totalItems: number;
      activeItems: number;
      totalValue: number;
      categories: { [key: string]: number };
    } | null;
    error: string | null;
  }> {
    try {
      const analytics = await InventoryCrudOperations.getAnalytics();
      return {
        data: analytics,
        error: null,
      };
    } catch (error) {
      const supabaseError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        data: null,
        error: (supabaseError as any)?.message,
      };
    }
  }

  /**
   * Subscribe to real-time inventory updates
   */
  static subscribeToInventoryChanges(
    callback: (payload: Record<string, unknown>) => void
  ) {
    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe('inventory_items', callback, {
        event: '*',
      });
    } catch (error) {
      console.error('❌ Failed to subscribe to inventory changes:', error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribeFromInventoryChanges() {
    supabase.removeAllChannels();
  }
}
