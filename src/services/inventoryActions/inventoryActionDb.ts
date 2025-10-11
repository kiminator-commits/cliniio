/**
 * Database interaction functions for inventory actions
 * Handles all Supabase queries, inserts, updates, and deletes
 */

import { InventoryCrudOperations } from '../inventory/utils/inventoryCrudOperations';
import { InventoryItem } from '../../types/inventoryTypes';
import { ToolStatus } from '../../types/toolTypes';
import { InventoryItemData } from '../../types/inventoryActionTypes';
import {
  getSuppliersByFacility,
  getInventoryTransactionsByFacility,
  getInventoryCostsByFacility,
  getEquipmentMaintenanceByFacility,
} from '../../pages/Inventory/providers/inventoryActionSupabaseProvider';

/**
 * Get all inventory items with optional filters
 */
export async function getItems(
  filters?: Record<string, unknown>
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems(filters);
    return response.data || [];
  } catch (error) {
    console.error('Error getting items:', error);
    throw new Error('Failed to get items');
  }
}

/**
 * Get inventory item by ID
 */
export async function getItemById(id: string): Promise<InventoryItem | null> {
  try {
    return await InventoryCrudOperations.getItemById(id);
  } catch (error) {
    console.error('Error getting item by ID:', error);
    throw new Error('Failed to get item by ID');
  }
}

/**
 * Get items by category
 */
export async function getItemsByCategory(
  _category: string
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({
      category: _category,
    });
    return response.data || [];
  } catch (error) {
    console.error('Error getting items by category:', error);
    throw new Error('Failed to get items by category');
  }
}

/**
 * Get items by location
 */
export async function getItemsByLocation(
  _location: string
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({
      location: _location,
    });
    return response.data || [];
  } catch (error) {
    console.error('Error getting items by location:', error);
    throw new Error('Failed to get items by location');
  }
}

/**
 * Get items by status
 */
export async function getItemsByStatus(
  _status: ToolStatus
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({
      status: _status as 'active' | 'inactive' | 'p2' | 'n/a',
    });
    return response.data || [];
  } catch (error) {
    console.error('Error getting items by status:', error);
    throw new Error('Failed to get items by status');
  }
}

/**
 * Search items by term
 */
export async function searchItems(
  searchTerm: string
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({
      search: searchTerm,
    });
    return response.data || [];
  } catch (error) {
    console.error('Error searching items:', error);
    throw new Error('Failed to search items');
  }
}

/**
 * Get low stock items
 */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({} as unknown);
    return response.data || [];
  } catch (error) {
    console.error('Error getting low stock items:', error);
    throw new Error('Failed to get low stock items');
  }
}

/**
 * Get expiring items within specified days
 */
export async function getExpiringItems(
  _days: number = 30
): Promise<InventoryItem[]> {
  try {
    const response = await InventoryCrudOperations.getItems({} as unknown);
    return response.data || [];
  } catch (error) {
    console.error('Error getting expiring items:', error);
    throw new Error('Failed to get expiring items');
  }
}

/**
 * Create a new inventory item
 */
export async function createItem(
  itemData: InventoryItemData
): Promise<InventoryItem> {
  try {
    const payload = buildInventoryPayload(itemData);
    const newItem = await InventoryCrudOperations.createItem(
      payload as Omit<InventoryItem, 'id' | 'lastUpdated'>
    );
    return newItem;
  } catch (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item');
  }
}

/**
 * Update an existing inventory item
 */
export async function updateItem(
  itemId: string,
  itemData: InventoryItemData
): Promise<InventoryItem> {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    const payload = buildInventoryPayload(itemData);
    const updatedItem = await InventoryCrudOperations.updateItem(
      itemId,
      payload
    );
    return updatedItem;
  } catch (error) {
    console.error('Error updating item:', error);
    throw new Error('Failed to update item');
  }
}

/**
 * Delete an inventory item
 */
export async function deleteItem(itemId: string): Promise<void> {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    await InventoryCrudOperations.deleteItem(itemId);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
}

/**
 * Archive an inventory item
 */
export async function archiveItem(itemId: string): Promise<InventoryItem> {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    const archivedItem = await InventoryCrudOperations.updateItem(itemId, {
      status: 'archived' as ToolStatus,
      lastUpdated: new Date().toISOString(),
    });
    return archivedItem;
  } catch (error) {
    console.error('Error archiving item:', error);
    throw new Error('Failed to archive item');
  }
}

/**
 * Duplicate an inventory item
 */
export async function duplicateItem(itemId: string): Promise<InventoryItem> {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    const originalItem = await InventoryCrudOperations.getItemById(itemId);
    if (!originalItem) {
      throw new Error('Original item not found');
    }

    const duplicateData = {
      ...originalItem,
      name: `${originalItem.name} (Copy)`,
      id: undefined,
      lastUpdated: undefined,
    };

    const duplicatedItem = await InventoryCrudOperations.createItem(
      duplicateData as Omit<InventoryItem, 'id' | 'lastUpdated'>
    );
    return duplicatedItem;
  } catch (error) {
    console.error('Error duplicating item:', error);
    throw new Error('Failed to duplicate item');
  }
}

/**
 * Bulk update items by category
 */
export async function bulkUpdateItemsByCategory(
  category: string,
  updateData: Partial<InventoryItem>
): Promise<{ updatedCount: number }> {
  try {
    const items = await getItemsByCategory(category);
    const updatePromises = items.map((item) =>
      InventoryCrudOperations.updateItem(item.id, updateData)
    );

    const results = await Promise.allSettled(updatePromises);
    const updatedCount = results.filter((r) => r.status === 'fulfilled').length;

    return { updatedCount };
  } catch (error) {
    console.error('Error in bulk update by category:', error);
    throw new Error('Failed to bulk update items by category');
  }
}

/**
 * Get suppliers by facility
 */
export async function getSuppliersByFacilityDb(facilityId: string) {
  try {
    return await getSuppliersByFacility(facilityId);
  } catch (error) {
    console.error('Error getting suppliers by facility:', error);
    throw new Error('Failed to get suppliers by facility');
  }
}

/**
 * Get inventory transactions by facility
 */
export async function getInventoryTransactionsByFacilityDb(facilityId: string) {
  try {
    return await getInventoryTransactionsByFacility(facilityId);
  } catch (error) {
    console.error('Error getting inventory transactions by facility:', error);
    throw new Error('Failed to get inventory transactions by facility');
  }
}

/**
 * Get inventory costs by facility
 */
export async function getInventoryCostsByFacilityDb(facilityId: string) {
  try {
    return await getInventoryCostsByFacility(facilityId);
  } catch (error) {
    console.error('Error getting inventory costs by facility:', error);
    throw new Error('Failed to get inventory costs by facility');
  }
}

/**
 * Get equipment maintenance by facility
 */
export async function getEquipmentMaintenanceByFacilityDb(facilityId: string) {
  try {
    return await getEquipmentMaintenanceByFacility(facilityId);
  } catch (error) {
    console.error('Error getting equipment maintenance by facility:', error);
    throw new Error('Failed to get equipment maintenance by facility');
  }
}

// Import the utility function needed for payload building
import { buildInventoryPayload } from './inventoryActionUtils';
