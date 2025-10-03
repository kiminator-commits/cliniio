import { LocalInventoryItem } from '@/types/inventoryTypes';
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { auditLogger } from '@/utils/auditLogger';
import { inventoryErrorService } from './inventoryErrorService';
import { useInventoryStore } from '@/store/inventoryStore';

// Utility Actions
export const generateBarcode = (): string => {
  return `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getItemById = (
  id: string,
  inventoryData: {
    tools: LocalInventoryItem[];
    supplies: LocalInventoryItem[];
    equipment: LocalInventoryItem[];
    officeHardware: LocalInventoryItem[];
  }
): LocalInventoryItem | undefined => {
  const allItems = [
    ...inventoryData.tools,
    ...inventoryData.supplies,
    ...inventoryData.equipment,
    ...inventoryData.officeHardware,
  ];
  return allItems.find((item) => item.id === id);
};

export const getItemsByCategory = (
  category: string,
  inventoryData: {
    tools: LocalInventoryItem[];
    supplies: LocalInventoryItem[];
    equipment: LocalInventoryItem[];
    officeHardware: LocalInventoryItem[];
  }
): LocalInventoryItem[] => {
  const allItems = [
    ...inventoryData.tools,
    ...inventoryData.supplies,
    ...inventoryData.equipment,
    ...inventoryData.officeHardware,
  ];
  return allItems.filter((item) => item.category === category);
};

export const validateItem = (
  item: LocalInventoryItem
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.item?.trim()) errors.push('Name is required');
  if (!item.category?.trim()) errors.push('Category is required');
  if (!item.id?.trim()) errors.push('ID is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// CRUD Operations
export const handleAddItem = async (
  item: LocalInventoryItem,
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  try {
    await InventoryServiceFacade.createItem(item);
    await refreshInventoryData();
    auditLogger.log('inventory', 'add', {
      itemId: item.id,
      itemName: item.item,
    });
  } catch (error) {
    inventoryErrorService.handleCrudError('create', error as Error, {
      operation: 'add_item',
      itemId: item.id,
      category: item.category,
    });
    throw error;
  }
};

export const handleUpdateItem = async (
  id: string,
  updates: Partial<LocalInventoryItem>,
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  try {
    await InventoryServiceFacade.updateItem(id, updates);
    await refreshInventoryData();
    auditLogger.log('inventory', 'update', { itemId: id, updates });
  } catch (error) {
    inventoryErrorService.handleCrudError('update', error as Error, {
      operation: 'update_item',
      itemId: id,
      category: updates.category,
    });
    throw error;
  }
};

export const handleDeleteItem = async (
  id: string,
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  try {
    await InventoryServiceFacade.deleteItem(id);
    await refreshInventoryData();
    auditLogger.log('inventory', 'delete', { itemId: id });
  } catch (error) {
    inventoryErrorService.handleCrudError('delete', error as Error, {
      operation: 'delete_item',
      itemId: id,
    });
    throw error;
  }
};

export const handleDuplicateItem = async (
  id: string,
  inventoryData: {
    tools: LocalInventoryItem[];
    supplies: LocalInventoryItem[];
    equipment: LocalInventoryItem[];
    officeHardware: LocalInventoryItem[];
  },
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  let originalItem: LocalInventoryItem | undefined;

  try {
    originalItem = getItemById(id, inventoryData);
    if (!originalItem) throw new Error('Item not found');

    const duplicatedItem = {
      ...originalItem,
      id: generateBarcode(),
      item: `${originalItem.item} (Copy)`,
    };

    await handleAddItem(duplicatedItem, refreshInventoryData);
    auditLogger.log('inventory', 'duplicate', {
      originalId: id,
      newId: duplicatedItem.id,
    });
  } catch (error) {
    inventoryErrorService.handleCrudError('create', error as Error, {
      operation: 'duplicate_item',
      itemId: id,
      category: originalItem?.category,
    });
    throw error;
  }
};

// Bulk Operations
export const handleBulkDelete = async (
  itemIds: string[],
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  try {
    await Promise.all(
      itemIds.map((id) => handleDeleteItem(id, refreshInventoryData))
    );
    auditLogger.log('inventory', 'bulk_delete', { itemIds });
  } catch (error) {
    inventoryErrorService.handleBulkOperationError(
      'delete',
      error as Error,
      itemIds,
      {
        operation: 'bulk_delete_items',
      }
    );
    throw error;
  }
};

export const handleBulkUpdate = async (
  itemIds: string[],
  updates: Partial<LocalInventoryItem>,
  refreshInventoryData: () => Promise<void>
): Promise<void> => {
  try {
    await Promise.all(
      itemIds.map((id) => handleUpdateItem(id, updates, refreshInventoryData))
    );
    auditLogger.log('inventory', 'bulk_update', { itemIds, updates });
  } catch (error) {
    inventoryErrorService.handleBulkOperationError(
      'update',
      error as Error,
      itemIds,
      {
        operation: 'bulk_update_items',
        category: updates.category,
      }
    );
    throw error;
  }
};

export const handleBulkExport = async (itemIds?: string[]): Promise<void> => {
  try {
    if (!itemIds || itemIds.length === 0) {
      throw new Error('No items selected for export');
    }

    // Get items for export
    const items = await Promise.all(
      itemIds.map((id) => InventoryServiceFacade.getItemById(id))
    );

    const validItems = items.filter((item) => item !== null);

    if (validItems.length === 0) {
      throw new Error('No valid items found for export');
    }

    // Use the existing export service
    const { InventoryExportService } = await import('./inventoryExportService');
    const exportResult = await InventoryExportService.exportItems(validItems, {
      format: 'csv',
      includeHeaders: true,
      fileName: `inventory_export_${new Date().toISOString().split('T')[0]}.csv`,
    });

    if (!exportResult.success) {
      throw new Error(
        `Export failed: ${exportResult.errors?.join(', ') || 'Unknown error'}`
      );
    }

    // Trigger download
    if (exportResult.downloadUrl) {
      const link = document.createElement('a');
      link.href = exportResult.downloadUrl;
      link.download = exportResult.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    auditLogger.log('inventory', 'bulk_export', {
      itemCount: validItems.length,
      fileName: exportResult.fileName,
    });
  } catch (error) {
    inventoryErrorService.handleBulkOperationError(
      'export',
      error as Error,
      itemIds || [],
      {
        operation: 'bulk_export_items',
      }
    );
    throw error;
  }
};

// Data Management
export const handleExportData = async (
  format: 'csv' | 'json' | 'excel'
): Promise<void> => {
  try {
    // Get all inventory data
    const allItems = await InventoryServiceFacade.getAllItems();

    if (allItems.length === 0) {
      throw new Error('No data available for export');
    }

    // Use the existing export service
    const { InventoryExportService } = await import('./inventoryExportService');
    const exportResult = await InventoryExportService.exportItems(allItems, {
      format,
      includeHeaders: true,
      fileName: `inventory_full_export_${new Date().toISOString().split('T')[0]}.${format}`,
    });

    if (!exportResult.success) {
      throw new Error(
        `Export failed: ${exportResult.errors?.join(', ') || 'Unknown error'}`
      );
    }

    // Trigger download
    if (exportResult.downloadUrl) {
      const link = document.createElement('a');
      link.href = exportResult.downloadUrl;
      link.download = exportResult.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    auditLogger.log('inventory', 'export_data', {
      format,
      itemCount: allItems.length,
      fileName: exportResult.fileName,
    });
  } catch (error) {
    inventoryErrorService.handleGeneralError(error as Error, {
      operation: 'export_data',
      additionalInfo: { format },
    });
    throw error;
  }
};

export const handleImportData = async (
  data: LocalInventoryItem[]
): Promise<void> => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data provided for import');
    }

    // Validate data before import
    const validationResults = data.map((item) => {
      const validation = validateItem(item);
      return { item, isValid: validation.isValid, errors: validation.errors };
    });

    const validItems = validationResults
      .filter((result) => result.isValid)
      .map((result) => result.item);
    const invalidItems = validationResults.filter((result) => !result.isValid);

    if (validItems.length === 0) {
      throw new Error('No valid items found for import');
    }

    // Import valid items
    const importPromises = validItems.map((item) =>
      InventoryServiceFacade.createItem(item).catch((error) => ({
        item,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    );

    const results = await Promise.allSettled(importPromises);
    const successfulImports = results.filter(
      (result) => result.status === 'fulfilled'
    ).length;
    const failedImports = results.filter(
      (result) => result.status === 'rejected'
    ).length;

    auditLogger.log('inventory', 'import_data', {
      totalItems: data.length,
      validItems: validItems.length,
      invalidItems: invalidItems.length,
      successfulImports,
      failedImports,
    });

    if (invalidItems.length > 0) {
      console.warn('Some items failed validation:', invalidItems);
    }

    if (failedImports > 0) {
      console.warn(
        'Some imports failed:',
        results.filter((result) => result.status === 'rejected')
      );
    }
  } catch (error) {
    inventoryErrorService.handleGeneralError(error as Error, {
      operation: 'import_data',
      additionalInfo: { itemCount: data.length },
    });
    throw error;
  }
};

// Favorites Management
export const handleToggleFavorite = (
  itemId: string,
  favorites: Set<string>,
  setFavorites: (favorites: Set<string>) => void
): void => {
  const newFavorites = new Set(favorites);
  if (newFavorites.has(itemId)) {
    newFavorites.delete(itemId);
  } else {
    newFavorites.add(itemId);
  }
  setFavorites(newFavorites);
};

export const handleAddToFavorites = (
  itemId: string,
  favorites: Set<string>,
  setFavorites: (favorites: Set<string>) => void
): void => {
  const newFavorites = new Set(favorites);
  newFavorites.add(itemId);
  setFavorites(newFavorites);
};

export const handleRemoveFromFavorites = (
  itemId: string,
  favorites: Set<string>,
  setFavorites: (favorites: Set<string>) => void
): void => {
  const newFavorites = new Set(favorites);
  newFavorites.delete(itemId);
  setFavorites(newFavorites);
};

// Sorting
export const handleSortItems = (
  field: keyof LocalInventoryItem,
  direction: 'asc' | 'desc'
): void => {
  try {
    // Update store with sort parameters
    const { setSortField, setSortDirection } = useInventoryStore.getState();
    setSortField(field as string);
    setSortDirection(direction);

    // Log the sorting action
    auditLogger.log('inventory', 'sort_items', {
      field,
      direction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    inventoryErrorService.handleGeneralError(error as Error, {
      operation: 'sort_items',
      additionalInfo: { field, direction },
    });
  }
};
