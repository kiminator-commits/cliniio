// Typed Supabase adapter for inventory operations
// This adapter provides type-safe operations without any casts

import { supabase } from '@/lib/supabaseClient';
import { InventoryItem } from '../inventoryTypes';
import {
  SupabaseInventoryRow,
  RealtimeInventoryPayload,
  RealtimeSubscriptionOptions,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  InventoryQueryOptions,
  isSupabaseInventoryRow,
  isSupabaseResponse,
  isRealtimeInventoryPayload,
  InventoryTransformationResult,
  InventoryBatchTransformationResult,
} from '../types/supabaseTypes';

// ============================================================================
// TYPED SUPABASE ADAPTER
// ============================================================================

export class TypedSupabaseAdapter {
  private readonly tableName = 'inventory_items';

  // ============================================================================
  // TYPE-SAFE CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all inventory items with proper typing
   */
  async getAllItems(
    options?: InventoryQueryOptions
  ): Promise<InventoryBatchTransformationResult> {
    try {
      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let facilityId: string | null = null;
      if (!authError && user) {
        facilityId = user.user_metadata?.facility_id || null;
      }

      const query = supabase
        .from(this.tableName)
        .select(options?.select || '*')
        .order(options?.orderBy?.column || 'created_at', {
          ascending: options?.orderBy?.ascending ?? false,
        });

      // Only add facility scoping if facility_id is available
      if (facilityId) {
        query.eq('facility_id', facilityId); // Enforces tenant isolation
      }

      if (options?.limit) {
        query.limit(options.limit);
      }

      if (options?.offset) {
        query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.eq(key, value);
          }
        });
      }

      const response = await query;

      if (!isSupabaseResponse<SupabaseInventoryRow>(response)) {
        return {
          success: false,
          error: 'Invalid response format from Supabase',
          processedCount: 0,
          errorCount: 1,
        };
      }

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
          processedCount: 0,
          errorCount: 1,
        };
      }

      const rows = response.data || [];
      const transformedItems: InventoryItem[] = [];
      let errorCount = 0;

      for (const row of rows) {
        if (isSupabaseInventoryRow(row)) {
          const transformed = this.transformRowToInventoryItem(row);
          if (transformed.success && transformed.data) {
            transformedItems.push(transformed.data);
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      return {
        success: true,
        data: transformedItems,
        processedCount: transformedItems.length,
        errorCount,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        processedCount: 0,
        errorCount: 1,
      };
    }
  }

  /**
   * Get a single inventory item by ID with proper typing
   */
  async getItemById(id: string): Promise<InventoryTransformationResult> {
    try {
      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let facilityId: string | null = null;
      if (!authError && user) {
        facilityId = user.user_metadata?.facility_id || null;
      }

      const query = supabase.from(this.tableName).select('*').eq('id', id);

      // Only add facility scoping if facility_id is available
      if (facilityId) {
        query.eq('facility_id', facilityId); // Enforces tenant isolation
      }

      const response = await query.single();

      if (!isSupabaseResponse<SupabaseInventoryRow>(response)) {
        return {
          success: false,
          error: 'Invalid response format from Supabase',
        };
      }

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      if (!response.data || !isSupabaseInventoryRow(response.data)) {
        return {
          success: false,
          error: 'Item not found or invalid format',
        };
      }

      const transformed = this.transformRowToInventoryItem(response.data);
      return transformed;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create a new inventory item with proper typing
   */
  async createItem(
    itemData: CreateInventoryItemData
  ): Promise<InventoryTransformationResult> {
    try {
      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let facilityId: string | null = null;
      if (!authError && user) {
        facilityId = user.user_metadata?.facility_id || null;
      }

      // Ensure facility_id is included in the insert data
      const insertData = {
        ...itemData,
        facility_id: facilityId || itemData.facility_id, // Use provided or derived facility_id
      };

      const response = await supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();

      if (!isSupabaseResponse<SupabaseInventoryRow>(response)) {
        return {
          success: false,
          error: 'Invalid response format from Supabase',
        };
      }

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      if (!response.data || !isSupabaseInventoryRow(response.data)) {
        return {
          success: false,
          error: 'Failed to create item or invalid response format',
        };
      }

      const transformed = this.transformRowToInventoryItem(response.data);
      return transformed;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update an inventory item with proper typing
   */
  async updateItem(
    id: string,
    updates: UpdateInventoryItemData
  ): Promise<InventoryTransformationResult> {
    try {
      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let facilityId: string | null = null;
      if (!authError && user) {
        facilityId = user.user_metadata?.facility_id || null;
      }

      const query = supabase.from(this.tableName).update(updates).eq('id', id);

      // Only add facility scoping if facility_id is available
      if (facilityId) {
        query.eq('facility_id', facilityId); // Enforces tenant isolation
      }

      const response = await query.select().single();

      if (!isSupabaseResponse<SupabaseInventoryRow>(response)) {
        return {
          success: false,
          error: 'Invalid response format from Supabase',
        };
      }

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      if (!response.data || !isSupabaseInventoryRow(response.data)) {
        return {
          success: false,
          error: 'Item not found or invalid response format',
        };
      }

      const transformed = this.transformRowToInventoryItem(response.data);
      return transformed;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete an inventory item with proper typing
   */
  async deleteItem(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user for facility scoping
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      let facilityId: string | null = null;
      if (!authError && user) {
        facilityId = user.user_metadata?.facility_id || null;
      }

      const query = supabase.from(this.tableName).delete().eq('id', id);

      // Only add facility scoping if facility_id is available
      if (facilityId) {
        query.eq('facility_id', facilityId); // Enforces tenant isolation
      }

      const response = await query;

      if (!isSupabaseResponse<SupabaseInventoryRow>(response)) {
        return {
          success: false,
          error: 'Invalid response format from Supabase',
        };
      }

      if (response.error) {
        return {
          success: false,
          error: response.error.message,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ============================================================================
  // TYPE-SAFE REALTIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to inventory changes with proper typing
   */
  subscribeToChanges(
    callback: (payload: RealtimeInventoryPayload) => void,
    options?: RealtimeSubscriptionOptions
  ): () => void {
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table: options?.table || this.tableName,
          filter: options?.filter,
        },
        (payload) => {
          if (isRealtimeInventoryPayload(payload)) {
            callback(payload);
          } else {
            console.warn('Received invalid realtime payload:', payload);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // ============================================================================
  // TYPE-SAFE TRANSFORMATIONS
  // ============================================================================

  /**
   * Transform Supabase row to InventoryItem with proper typing
   */
  private transformRowToInventoryItem(
    row: SupabaseInventoryRow
  ): InventoryTransformationResult {
    try {
      const inventoryItem: InventoryItem = {
        id: row.id,
        facility_id: row.facility_id,
        name: row.name,
        quantity: row.quantity,
        data: row.data,
        created_at: row.created_at,
        updated_at: row.updated_at,
        reorder_level: row.reorder_level,
        reorder_point: row.reorder_point,
        status: row.status,
        expiration_date: row.expiration_date,
        unit_cost: row.unit_cost,
        category: row.category,
      };

      return {
        success: true,
        data: inventoryItem,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to transform row to inventory item',
      };
    }
  }

  /**
   * Transform InventoryItem to Supabase row format
   */
  transformInventoryItemToRow(item: InventoryItem): CreateInventoryItemData {
    return {
      facility_id: item.facility_id,
      name: item.name,
      quantity: item.quantity,
      data: item.data,
      reorder_level: item.reorder_level,
      reorder_point: item.reorder_point,
      status: item.status,
      expiration_date: item.expiration_date,
      unit_cost: item.unit_cost,
      category: item.category,
    };
  }
}
