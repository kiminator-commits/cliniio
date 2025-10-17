import { supabase } from '../../../lib/supabaseClient';
import { Database } from '../../../types/database.types';
import { Json } from '../../../types/database.types';
import { getTableName as _getTableName } from '../../../config/inventoryConfig';
import { InventoryItem } from '../../../types/inventory';
import {
  InventoryResponse,
  InventoryFilters,
} from '../types/inventoryServiceTypes';
import { InventoryDataTransformer as _InventoryDataTransformer } from './inventoryTransformers';
import { InventoryFilterOperations } from './inventoryFilterOperations';
import { InventoryErrorOperations } from './inventoryErrorOperations';
import { getTypedSupabaseAdapter } from '../adapters/TypedSupabaseAdapterLoader';

// Use proper Supabase generated types
type InventoryItemRow = Database['public']['Tables']['inventory_items']['Row'];
type _UserRow = Database['public']['Tables']['users']['Row'];

interface _SupabaseSingleResponse {
  data: unknown;
  error: unknown;
}

// Helper function to handle Supabase errors
const handleSupabaseError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String((error as { message: string }).message));
  }
  return new Error('Unknown Supabase error occurred');
};

/**
 * Shared CRUD operations for inventory services
 * Eliminates duplication across InventorySupabaseService, InventoryCoreService, etc.
 */
export class InventoryCrudOperations {
  private static async getTypedAdapter() {
    const { TypedSupabaseAdapter } = await getTypedSupabaseAdapter();
    return new TypedSupabaseAdapter();
  }
  /**
   * Get all inventory items with optional filtering
   */
  static async getItems(
    filters?: InventoryFilters
  ): Promise<InventoryResponse> {
    const operation = 'Fetching inventory items';
    const filterSummary = InventoryFilterOperations.getFilterSummary(filters);

    InventoryErrorOperations.logStart(operation, filterSummary);

    try {
      // Validate filters
      if (!InventoryFilterOperations.validateFilters(filters)) {
        throw new Error('Invalid filter parameters');
      }

      // Use typed adapter for type-safe operations
      const typedAdapter = await this.getTypedAdapter();

      const result = await typedAdapter.getAllItems({
        filters: filters as Record<string, unknown>,
        orderBy: {
          column: 'created_at',
          ascending: false,
        },
      });

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || 'Failed to fetch inventory items');
      }

      const transformedData = result.data as unknown as InventoryItem[];

      InventoryErrorOperations.logSuccess(
        operation,
        `${transformedData.length} items`
      );

      return {
        data: transformedData,
        error: null,
        count: result.processedCount,
      };
    } catch (error) {
      console.error('❌ InventoryCrudOperations.getItems failed:', error);
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Get a single inventory item by ID
   */
  static async getItemById(id: string): Promise<InventoryItem | null> {
    const operation = `Fetching inventory item by ID: ${id}`;
    InventoryErrorOperations.logStart(operation);

    try {
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.getItemById(id);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch inventory item');
      }

      const item = result.data as unknown as InventoryItem;

      InventoryErrorOperations.logSuccess(operation, item.name || 'Unknown');
      return item;
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Create a new inventory item
   */
  static async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
  ): Promise<InventoryItem> {
    const operation = `Creating inventory item: ${item.name}`;

    InventoryErrorOperations.logStart(operation);

    try {
      // Use typed adapter for type-safe operations
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.createItem({
        facility_id: item.facility_id || '',
        name: item.name || '',
        quantity: item.quantity ?? undefined,
        data: (item.data as unknown as Json) ?? undefined,
        reorder_point: item.reorder_point ?? undefined,
        expiration_date: item.expiration_date ?? undefined,
        unit_cost: item.unit_cost ?? undefined,
        category: item.category ?? undefined,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create inventory item');
      }

      InventoryErrorOperations.logSuccess(
        operation,
        result.data.name || 'Unknown'
      );
      return result.data as unknown as InventoryItem;
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Update an existing inventory item
   */
  static async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    try {
      // Use typed adapter for type-safe operations
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.updateItem(id, {
        name: updates.name ?? undefined,
        quantity: updates.quantity ?? undefined,
        data: (updates.data as unknown as Json) ?? undefined,
        reorder_point: updates.reorder_point ?? undefined,
        expiration_date: updates.expiration_date ?? undefined,
        unit_cost: updates.unit_cost ?? undefined,
        category: updates.category ?? undefined,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update inventory item');
      }

      return result.data as unknown as InventoryItem;
    } catch (error) {
      console.error('❌ Failed to update item in Supabase:', error);
      throw error;
    }
  }

  /**
   * Delete an inventory item
   */
  static async deleteItem(id: string): Promise<void> {
    const operation = `Deleting inventory item: ${id}`;
    InventoryErrorOperations.logStart(operation);

    try {
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.deleteItem(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete inventory item');
      }

      InventoryErrorOperations.logSuccess(operation, `Deleted ${id}`);
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Archive an inventory item (soft delete for audit compliance)
   */
  static async archiveItem(id: string, reason?: string): Promise<void> {
    const operation = `Archiving inventory item: ${id}`;
    InventoryErrorOperations.logStart(operation);

    try {
      // Get current user for audit trail
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use typed adapter for type-safe operations
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.updateItem(id, {
        archived: true,
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        archive_reason: reason || 'User requested deletion',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to archive inventory item');
      }

      InventoryErrorOperations.logSuccess(operation, `Archived ${id}`);
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Get inventory categories
   */
  static async getCategories(): Promise<string[]> {
    const operation = 'Fetching inventory categories';
    InventoryErrorOperations.logStart(operation);

    try {
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.getAllItems();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      const categories = Array.from(
        new Set(
          (result.data as InventoryItemRow[])
            .map((item) => item.category)
            .filter((category): category is string => Boolean(category))
        )
      );

      InventoryErrorOperations.logSuccess(
        operation,
        `${categories.length} categories`
      );
      return categories;
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Get inventory locations
   */
  static async getLocations(): Promise<string[]> {
    const operation = 'Fetching inventory locations';
    InventoryErrorOperations.logStart(operation);

    try {
      const typedAdapter = await this.getTypedAdapter();
      const result = await typedAdapter.getAllItems();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch locations');
      }

      // Since inventory_items table doesn't have a location field,
      // we'll return an empty array or extract from data field if available
      const locations = Array.from(
        new Set(
          (result.data as InventoryItemRow[])
            .map((item) => {
              // Try to extract location from data JSON field
              const data = item.data as { location?: string } | null;
              return data?.location;
            })
            .filter((location): location is string => Boolean(location))
        )
      );

      InventoryErrorOperations.logSuccess(
        operation,
        `${locations.length} locations`
      );
      return locations;
    } catch (error) {
      InventoryErrorOperations.logFailure(operation, error);
      throw error;
    }
  }

  /**
   * Get inventory analytics
   */
  static async getAnalytics(): Promise<{
    totalItems: number;
    activeItems: number;
    totalValue: number;
    categories: { [key: string]: number };
  }> {
    try {
      // Get user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get user's facility ID from users table
      const { data: userProfile } = (await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single()) as { data: { facility_id: string } | null };

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      const { data, error } = (await supabase
        .from('inventory_items')
        .select('*')
        .eq('facility_id', facilityId)) as {
        data: InventoryItemRow[] | null;
        error;
      };

      if (error) {
        console.error('❌ Error fetching analytics from Supabase:', error);
        throw handleSupabaseError(error);
      }

      const items = (data || []) as InventoryItemRow[];
      const totalItems = items.length;
      // Since there's no status field, consider all items as active
      const activeItems = items.length;
      const totalValue = items.reduce(
        (sum, item) => sum + (item.unit_cost || 0),
        0
      );

      const categories: { [key: string]: number } = {};
      items.forEach((item) => {
        const category = item.category;
        if (category) {
          categories[category] = (categories[category] || 0) + 1;
        }
      });

      return {
        totalItems,
        activeItems,
        totalValue,
        categories,
      };
    } catch (error) {
      console.error('❌ Failed to fetch analytics from Supabase:', error);
      throw error;
    }
  }
}
