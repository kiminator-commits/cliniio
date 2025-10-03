/**
 * Facade service for handling inventory action operations
 * Orchestrates calls to extracted utilities, providers, and external services
 */

// Internal service imports
import {
  getItems,
  getItemById,
  getItemsByCategory,
  getItemsByLocation,
  getItemsByStatus,
  searchItems,
  getLowStockItems,
  getExpiringItems,
  getSuppliersByFacilityDb,
  getInventoryTransactionsByFacilityDb,
  getInventoryCostsByFacilityDb,
  getEquipmentMaintenanceByFacilityDb,
} from '../../../services/inventoryActions/inventoryActionDb';
import {
  handleCreateItem,
  handleUpdateItem,
  handleDeleteItem,
  handleBulkOperation,
  handleBulkImport,
  handleDuplicateItem,
  handleArchiveItem,
  handleBulkUpdateByCategory,
} from '../../../services/inventoryActions/inventoryActionHandlers';

// Types and constants
import { InventoryItem } from '@/types/inventoryTypes';
import { ToolStatus } from '@/types/toolTypes';
import { InventoryItemData, BulkOperationResult } from '@/types/inventoryActionTypes';
import { ExportOptions } from './inventoryExportService';
import { BulkOperationConfig } from './inventoryBulkProgressService';
import { ImportOptions, ImportResult } from './inventoryImportService';

/**
 * Facade service for handling inventory action operations
 * Orchestrates calls to extracted utilities, providers, and external services
 */
export class InventoryActionService {

  /**
   * Handle item creation
   */
  static async handleCreateItem(
    itemData: InventoryItemData,
    onCreateSuccess: (item: InventoryItemData) => void,
    onCreateError: (error: string) => void
  ) {
    return handleCreateItem(itemData, onCreateSuccess, onCreateError);
  }

  /**
   * Handle item update
   */
  static async handleUpdateItem(
    itemId: string,
    itemData: InventoryItemData,
    onUpdateSuccess: (item: InventoryItemData) => void,
    onUpdateError: (error: string) => void
  ) {
    return handleUpdateItem(itemId, itemData, onUpdateSuccess, onUpdateError);
  }

  /**
   * Handle item deletion
   */
  static async handleDeleteItem(
    itemId: string,
    onDeleteSuccess: () => void,
    onDeleteError: (error: string) => void
  ) {
    return handleDeleteItem(itemId, onDeleteSuccess, onDeleteError);
  }

  /**
   * Handle bulk operations
   */
  static async handleBulkOperation(
    operation: 'delete' | 'update' | 'export',
    itemIds: string[],
    options?: {
      updateData?: Partial<InventoryItem>;
      exportOptions?: ExportOptions;
      progressConfig?: BulkOperationConfig;
    },
    onSuccess?: (result: BulkOperationResult) => void,
    onError?: (error: string) => void
  ): Promise<BulkOperationResult | null> {
    return handleBulkOperation(operation, itemIds, options, onSuccess, onError);
  }

  /**
   * Handle bulk import operation
   */
  static async handleBulkImport(
    file: File,
    importOptions?: ImportOptions,
    onSuccess?: (result: ImportResult) => void,
    onError?: (error: string) => void
  ): Promise<ImportResult | null> {
    return handleBulkImport(file, importOptions, onSuccess, onError);
  }

  /**
   * Handle item duplication
   */
  static async handleDuplicateItem(
    itemId: string,
    onDuplicateSuccess: (item: InventoryItemData) => void,
    onDuplicateError: (error: string) => void
  ) {
    return handleDuplicateItem(itemId, onDuplicateSuccess, onDuplicateError);
  }

  /**
   * Handle item archiving
   */
  static async handleArchiveItem(
    itemId: string,
    onArchiveSuccess: (item: InventoryItemData) => void,
    onArchiveError: (error: string) => void
  ) {
    return handleArchiveItem(itemId, onArchiveSuccess, onArchiveError);
  }

  /**
   * Get all inventory items
   */
  static async getItems(
    filters?: Record<string, unknown>
  ): Promise<InventoryItem[]> {
    return getItems(filters);
  }

  /**
   * Get inventory item by ID
   */
  static async getItemById(id: string): Promise<InventoryItem | null> {
    return getItemById(id);
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(category: string): Promise<InventoryItem[]> {
    return getItemsByCategory(category);
  }

  /**
   * Get items by location
   */
  static async getItemsByLocation(location: string): Promise<InventoryItem[]> {
    return getItemsByLocation(location);
  }

  /**
   * Get items by status
   */
  static async getItemsByStatus(status: ToolStatus): Promise<InventoryItem[]> {
    return getItemsByStatus(status);
  }

  /**
   * Search items by name or description
   */
  static async searchItems(searchTerm: string): Promise<InventoryItem[]> {
    return searchItems(searchTerm);
  }

  /**
   * Get items with low stock (below reorder point)
   */
  static async getLowStockItems(): Promise<InventoryItem[]> {
    return getLowStockItems();
  }

  /**
   * Get items expiring soon
   */
  static async getExpiringItems(
    daysThreshold: number = 30
  ): Promise<InventoryItem[]> {
    return getExpiringItems(daysThreshold);
  }

  /**
   * Bulk update items by category
   */
  static async bulkUpdateItemsByCategory(
    category: string,
    updateData: Partial<InventoryItem>
  ): Promise<{ updatedCount: number }> {
    return handleBulkUpdateByCategory(category, updateData);
  }

  /**
   * Get suppliers by facility ID
   */
  static async getSuppliersByFacility(
    facilityId: string
  ): Promise<{ data: unknown[] | null; error: unknown }> {
    return await getSuppliersByFacilityDb(facilityId);
  }

  /**
   * Get inventory transactions by facility ID
   */
  static async getInventoryTransactionsByFacility(
    facilityId: string
  ): Promise<{ data: unknown[] | null; error: unknown }> {
    return await getInventoryTransactionsByFacilityDb(facilityId);
  }

  /**
   * Get inventory costs by facility ID
   */
  static async getInventoryCostsByFacility(
    facilityId: string
  ): Promise<{ data: unknown[] | null; error: unknown }> {
    return await getInventoryCostsByFacilityDb(facilityId);
  }

  /**
   * Get equipment maintenance by facility ID
   */
  static async getEquipmentMaintenanceByFacility(
    facilityId: string
  ): Promise<{ data: unknown[] | null; error: unknown }> {
    return await getEquipmentMaintenanceByFacilityDb(facilityId);
  }

}