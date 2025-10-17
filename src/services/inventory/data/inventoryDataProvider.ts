/**
 * Tenant-scoped Inventory Data Provider
 * All queries restricted by tenant_id = currentTenant
 * Date: 2025-10-06
 */

import { getScopedClient } from '../../../lib/supabaseClient';
import { InventoryItem } from '../../../types/inventoryTypes';
import {
  InventoryResponse,
  InventoryFilters,
} from '../types/inventoryServiceTypes';
import { InventoryDataTransformer } from '../utils/inventoryTransformers';
import { InventoryFilterOperations } from '../utils/inventoryFilterOperations';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import { FacilityService } from '../../facilityService';

// Get current facility ID for tenant isolation
const getCurrentTenant = async (): Promise<string> => {
  return await FacilityService.getCurrentFacilityId();
};

// Helper function for safe number conversion
const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
};

// Helper function for safe string conversion
const safeString = (
  value: unknown,
  defaultValue: string = 'Unknown'
): string => {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return defaultValue;
};

// Helper function for safe error handling
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export class InventoryDataProvider {
  static async getItemsFromSupabase(
    filters?: InventoryFilters,
    facilityId?: string
  ): Promise<InventoryResponse> {
    try {
      const currentTenant = facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      const _filterSummary =
        InventoryFilterOperations.getFilterSummary(filters);

      // Validate filters
      if (!InventoryFilterOperations.validateFilters(filters)) {
        throw new Error('Invalid filter parameters');
      }

      const query = await InventoryFilterOperations.applyFiltersToTable(
        supabase,
        'inventory_items',
        filters
      );

      const { data, error, count } = await (query as any)
        .eq('facility_id', currentTenant)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items from Supabase:', error);
        throw error;
      }

      const transformedData =
        (data as Record<string, unknown>[])?.map(
          (item: Record<string, unknown>) =>
            InventoryDataTransformer.transformFromSupabase(item)
        ) || [];

      return {
        data: transformedData,
        error: null,
        count: count || 0,
      };
    } catch (error) {
      console.error('Failed to fetch items from Supabase:', error);
      throw error; // Re-throw the error so the core service can catch it
    }
  }

  static async getItemByIdFromSupabase(
    id: string
  ): Promise<InventoryItem | null> {
    try {
      return await InventoryActionService.getItemById(id);
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      return null;
    }
  }

  static async createItemInSupabase(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
  ): Promise<InventoryItem> {
    try {
      // Use the underlying database method directly
      const { createItem } = await import('../../../services/inventoryActions/inventoryActionDb');
      const result = await createItem(item);
      return result;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error(`Failed to create item: ${getErrorMessage(error)}`);
    }
  }

  static async updateItemInSupabase(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    try {
      // Use the underlying database method directly
      const { updateItem } = await import('../../../services/inventoryActions/inventoryActionDb');
      const result = await updateItem(id, updates);
      return result;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error(`Failed to update item: ${getErrorMessage(error)}`);
    }
  }

  static async deleteItemFromSupabase(id: string): Promise<void> {
    try {
      // Use the underlying database method directly
      const { deleteItem } = await import('../../../services/inventoryActions/inventoryActionDb');
      await deleteItem(id);
    } catch (error) {
      throw new Error(`Failed to delete item: ${getErrorMessage(error)}`);
    }
  }

  static async getCategories(facilityId?: string): Promise<string[]> {
    try {
      const currentTenant = facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      const queryBuilder = await InventoryFilterOperations.applyFiltersToCategories(
        supabase,
        'inventory_items'
      );
      const result = await (queryBuilder as any).eq('facility_id', currentTenant);

      if (!result) {
        console.error('❌ Error fetching categories');
        throw new Error('Failed to fetch categories');
      }

      const categories = InventoryFilterOperations.extractUniqueValues(
        (result as { data: Record<string, unknown>[] }).data,
        'category'
      );
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoriesFromSupabase(): Promise<string[]> {
    return this.getCategories();
  }

  static async getLocations(facilityId?: string): Promise<string[]> {
    try {
      const currentTenant = facilityId || (await getCurrentTenant());
      const supabase = getScopedClient(currentTenant);

      const queryBuilder = await InventoryFilterOperations.applyFiltersToLocations(
        supabase,
        'inventory_items'
      );
      const result = await (queryBuilder as any).eq('facility_id', currentTenant);

      if (!result) {
        console.error('❌ Error fetching locations');
        throw new Error('Failed to fetch locations');
      }

      const locations = InventoryFilterOperations.extractUniqueValues(
        (result as { data: Record<string, unknown>[] }).data,
        'location'
      );
      return locations.sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getLocationsFromSupabase(): Promise<string[]> {
    return this.getLocations();
  }

  static async getInventoryStatsFromSupabase(): Promise<{
    totalItems: number;
    activeItems: number;
    totalValue: number;
    categories: { [key: string]: number };
  }> {
    try {
      const items = await InventoryActionService.getItems();

      const totalItems = items.length;
      const activeItems = items.filter(
        (item) => item.status === 'active'
      ).length;
      const totalValue = items.reduce(
        (sum, item) => sum + safeNumber(item.unit_cost),
        0
      );

      const categories: { [key: string]: number } = {};
      items.forEach((item) => {
        const category = safeString(item.category);
        categories[category] = (categories[category] || 0) + 1;
      });

      return {
        totalItems,
        activeItems,
        totalValue,
        categories,
      };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return {
        totalItems: 0,
        activeItems: 0,
        totalValue: 0,
        categories: {},
      };
    }
  }

  static calculateTotalValue(items: InventoryItem[]): number {
    try {
      const totalValue = items.reduce((sum, item) => {
        const cost = safeNumber(item.unit_cost);
        const quantity = safeNumber(item.quantity, 1);
        return sum + cost * quantity;
      }, 0);

      return totalValue;
    } catch (error) {
      console.error('Error calculating total value:', error);
      return 0;
    }
  }

  static getCategoryBreakdown(items: InventoryItem[]): Record<string, number> {
    try {
      const categories: Record<string, number> = {};

      items.forEach((item) => {
        const category = safeString(item.category);
        categories[category] = (categories[category] || 0) + 1;
      });

      return categories;
    } catch (error) {
      console.error('Error calculating category breakdown:', error);
      return {};
    }
  }
}
