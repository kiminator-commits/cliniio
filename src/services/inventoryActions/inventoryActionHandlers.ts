/**
 * Action handlers and business logic for inventory actions
 * Handles state transitions, validations, workflows, and business rules
 */

import { InventoryItem } from '@/types/inventoryTypes';
import {
  InventoryItemData,
  BulkOperationResult,
} from '@/types/inventoryActionTypes';
import {
  ExportOptions,
  ImportOptions,
  ImportResult,
} from '../../pages/Inventory/services/inventoryExportService';
import { BulkOperationConfig } from '../../pages/Inventory/services/inventoryBulkProgressService';
import { InventoryExportService } from '../../pages/Inventory/services/inventoryExportService';
import { InventoryImportService } from '../../pages/Inventory/services/inventoryImportService';
import { InventoryBulkProgressService } from '../../pages/Inventory/services/inventoryBulkProgressService';
import { logEvent, trackUserAction } from '@/utils/monitoring';
import { trackEvent as trackAnalyticsEvent } from '@/services/analytics';
import {
  validateItemData,
  buildInventoryPayload,
} from './inventoryActionUtils';
import {
  createItem,
  updateItem,
  deleteItem,
  archiveItem,
  duplicateItem,
  bulkUpdateItemsByCategory,
} from './inventoryActionDb';

/**
 * Handle item creation with validation and business logic
 */
export async function handleCreateItem(
  itemData: InventoryItemData,
  onCreateSuccess: (item: InventoryItemData) => void,
  onCreateError: (error: string) => void
) {
  try {
    const validation = validateItemData(itemData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const newItem = await createItem(itemData);
    onCreateSuccess(newItem);
  } catch (error) {
    onCreateError(
      error instanceof Error ? error.message : 'Failed to create item'
    );
  }
}

/**
 * Handle item update with validation and business logic
 */
export async function handleUpdateItem(
  itemId: string,
  itemData: InventoryItemData,
  onUpdateSuccess: (item: InventoryItemData) => void,
  onUpdateError: (error: string) => void
) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    const validation = validateItemData(itemData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const updatedItem = await updateItem(itemId, itemData);
    onUpdateSuccess(updatedItem);
  } catch (error) {
    onUpdateError(
      error instanceof Error ? error.message : 'Failed to update item'
    );
  }
}

/**
 * Handle item deletion with logging and analytics
 */
export async function handleDeleteItem(
  itemId: string,
  onDeleteSuccess: () => void,
  onDeleteError: (error: string) => void
) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    await deleteItem(itemId);

    logEvent(
      'inventory',
      'item_deleted',
      `Inventory item deleted: ${itemId}`,
      'info',
      {
        itemId,
        deletionMethod: 'single_item',
      }
    );

    trackUserAction('delete_item', 'inventory', {
      itemId,
      deletionMethod: 'single_item',
    });

    trackAnalyticsEvent('inventory_item_deleted', {
      itemId,
      deletionMethod: 'single_item',
    });

    onDeleteSuccess();
  } catch (error) {
    onDeleteError(
      error instanceof Error ? error.message : 'Failed to delete item'
    );
  }
}

/**
 * Handle bulk operations with progress tracking
 */
export async function handleBulkOperation(
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
  try {
    if (!itemIds || itemIds.length === 0) {
      throw new Error('No items selected for bulk operation');
    }

    let result: BulkOperationResult;

    switch (operation) {
      case 'delete':
        result = await processBulkDeletion(itemIds, options?.progressConfig);
        break;
      case 'update':
        if (!options?.updateData) {
          throw new Error('Update data is required for bulk update operation');
        }
        result = await processBulkUpdate(
          itemIds,
          options.updateData,
          options.progressConfig
        );
        break;
      case 'export':
        if (!options?.exportOptions) {
          throw new Error(
            'Export options are required for bulk export operation'
          );
        }
        result = await processBulkExport(itemIds, options.exportOptions);
        break;
      default:
        throw new Error(`Unsupported bulk operation: ${operation}`);
    }

    onSuccess?.(result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Bulk operation failed';
    onError?.(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Handle bulk import operation
 */
export async function handleBulkImport(
  file: File,
  importOptions?: ImportOptions,
  onSuccess?: (result: ImportResult) => void,
  onError?: (error: string) => void
): Promise<ImportResult | null> {
  try {
    if (!file) {
      throw new Error('No file selected for import');
    }

    const options: ImportOptions = importOptions || {
      validateData: true,
      skipDuplicates: true,
      createMissingCategories: true,
    };

    const validation = validateImportOptions(options);
    if (!validation.isValid) {
      throw new Error(
        `Invalid import options: ${validation.errors.join(', ')}`
      );
    }

    const importResult = await InventoryImportService.importItems(
      file,
      options
    );

    logEvent(
      'inventory',
      'bulk_import_completed',
      `Bulk import completed: ${importResult.importedCount} items imported`,
      'info',
      {
        fileName: importResult.fileName,
        importedCount: importResult.importedCount,
        failedCount: importResult.failedCount,
        skippedCount: importResult.skippedCount,
        errors: importResult.errors.length,
        warnings: importResult.warnings.length,
      }
    );

    onSuccess?.(importResult);
    return importResult;
  } catch (error) {
    console.error('Bulk import failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Bulk import failed';
    onError?.(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Handle item duplication
 */
export async function handleDuplicateItem(
  itemId: string,
  onDuplicateSuccess: (item: InventoryItemData) => void,
  onDuplicateError: (error: string) => void
) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    const duplicatedItem = await duplicateItem(itemId);

    logEvent(
      'inventory',
      'item_duplicated',
      `Inventory item duplicated: ${itemId}`,
      'info',
      {
        originalItemId: itemId,
        duplicatedItemId: duplicatedItem.id,
      }
    );

    trackUserAction('duplicate_item', 'inventory', {
      originalItemId: itemId,
      duplicatedItemId: duplicatedItem.id,
    });

    trackAnalyticsEvent('inventory_item_duplicated', {
      originalItemId: itemId,
      duplicatedItemId: duplicatedItem.id,
    });

    onDuplicateSuccess(duplicatedItem);
  } catch (error) {
    onDuplicateError(
      error instanceof Error ? error.message : 'Failed to duplicate item'
    );
  }
}

/**
 * Handle item archiving
 */
export async function handleArchiveItem(
  itemId: string,
  onArchiveSuccess: (item: InventoryItemData) => void,
  onArchiveError: (error: string) => void
) {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    const archivedItem = await archiveItem(itemId);

    logEvent(
      'inventory',
      'item_archived',
      `Inventory item archived: ${itemId}`,
      'info',
      {
        itemId,
        archiveMethod: 'single_item',
      }
    );

    trackUserAction('archive_item', 'inventory', {
      itemId,
      archiveMethod: 'single_item',
    });

    trackAnalyticsEvent('inventory_item_archived', {
      itemId,
      archiveMethod: 'single_item',
    });

    onArchiveSuccess(archivedItem);
  } catch (error) {
    onArchiveError(
      error instanceof Error ? error.message : 'Failed to archive item'
    );
  }
}

/**
 * Handle bulk update by category
 */
export async function handleBulkUpdateByCategory(
  category: string,
  updateData: Partial<InventoryItem>
): Promise<{ updatedCount: number }> {
  try {
    const result = await bulkUpdateItemsByCategory(category, updateData);

    logEvent(
      'inventory',
      'bulk_update_by_category_completed',
      `Bulk update by category completed: ${result.updatedCount} items updated`,
      'info',
      {
        category,
        updatedCount: result.updatedCount,
      }
    );

    trackUserAction('bulk_update_by_category', 'inventory', {
      category,
      updatedCount: result.updatedCount,
    });

    trackAnalyticsEvent('inventory_bulk_update_by_category_completed', {
      category,
      updatedCount: result.updatedCount,
    });

    return result;
  } catch (error) {
    console.error('Error in bulk update by category:', error);
    throw new Error('Failed to bulk update items by category');
  }
}

// Private helper methods for bulk operations

/**
 * Process bulk deletion with progress tracking
 */
async function processBulkDeletion(
  itemIds: string[],
  progressConfig?: BulkOperationConfig
): Promise<BulkOperationResult> {
  try {
    if (progressConfig) {
      const { results, failed, errors, metrics } =
        await InventoryBulkProgressService.processBulkOperation(
          itemIds,
          async (id) => await deleteItem(id),
          {
            ...progressConfig,
            enableCaching: true,
            maxConcurrentWorkers: 4,
            memoryLimit: 100 * 1024 * 1024,
            onMemoryWarning: (usage, limit) => {
              console.warn(
                `Memory usage high: ${Math.round(usage / (1024 * 1024))}MB / ${Math.round(limit / (1024 * 1024))}MB`
              );
            },
          }
        );

      console.log('Bulk deletion completed with performance metrics:', {
        total: itemIds.length,
        successful: results.length,
        failed: failed.length,
        errors: errors.length,
        processingTime: metrics.averageProcessingTime,
        memoryUsage: metrics.peakMemoryUsage,
        processingRate: metrics.processingRate,
      });

      return { deletedCount: results.length };
    } else {
      const results = await Promise.allSettled(
        itemIds.map((id) => deleteItem(id))
      );

      const deletedCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;

      logEvent(
        'inventory',
        'bulk_deletion_completed',
        `Bulk deletion completed: ${deletedCount}/${itemIds.length} items`,
        'info',
        {
          totalItems: itemIds.length,
          deletedCount,
          failedCount: itemIds.length - deletedCount,
          deletionMethod: 'bulk_operation',
        }
      );

      trackUserAction('bulk_delete_items', 'inventory', {
        totalItems: itemIds.length,
        deletedCount,
        failedCount: itemIds.length - deletedCount,
      });

      trackAnalyticsEvent('inventory_bulk_deletion_completed', {
        totalItems: itemIds.length,
        deletedCount,
        failedCount: itemIds.length - deletedCount,
        deletionMethod: 'bulk_operation',
      });

      return { deletedCount };
    }
  } catch (error) {
    console.error('Error in bulk deletion:', error);
    throw new Error('Bulk deletion failed');
  }
}

/**
 * Process bulk update with progress tracking
 */
async function processBulkUpdate(
  itemIds: string[],
  updateData: Partial<InventoryItem>,
  progressConfig?: BulkOperationConfig
): Promise<BulkOperationResult> {
  try {
    if (progressConfig) {
      const { results, failed, errors, metrics } =
        await InventoryBulkProgressService.processBulkOperation(
          itemIds,
          async (id) => await updateItem(id, buildInventoryPayload(updateData)),
          {
            ...progressConfig,
            enableCaching: true,
            maxConcurrentWorkers: 4,
            memoryLimit: 100 * 1024 * 1024,
            onMemoryWarning: (usage, limit) => {
              console.warn(
                `Memory usage high: ${Math.round(usage / (1024 * 1024))}MB / ${Math.round(limit / (1024 * 1024))}MB`
              );
            },
          }
        );

      console.log('Bulk update completed with performance metrics:', {
        total: itemIds.length,
        successful: results.length,
        failed: failed.length,
        errors: errors.length,
        processingTime: metrics.averageProcessingTime,
        memoryUsage: metrics.peakMemoryUsage,
        processingRate: metrics.processingRate,
      });

      return { updatedCount: results.length };
    } else {
      const results = await Promise.allSettled(
        itemIds.map((id) => updateItem(id, buildInventoryPayload(updateData)))
      );

      const updatedCount = results.filter(
        (r) => r.status === 'fulfilled'
      ).length;

      logEvent(
        'inventory',
        'bulk_update_completed',
        `Bulk update completed: ${updatedCount}/${itemIds.length} items`,
        'info',
        {
          totalItems: itemIds.length,
          updatedCount,
          failedCount: itemIds.length - updatedCount,
          updateMethod: 'bulk_operation',
        }
      );

      trackUserAction('bulk_update_items', 'inventory', {
        totalItems: itemIds.length,
        updatedCount,
        failedCount: itemIds.length - updatedCount,
      });

      trackAnalyticsEvent('inventory_bulk_update_completed', {
        totalItems: itemIds.length,
        updatedCount,
        failedCount: itemIds.length - updatedCount,
        updateMethod: 'bulk_operation',
      });

      return { updatedCount };
    }
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw new Error('Bulk update failed');
  }
}

/**
 * Process bulk export with progress tracking
 */
async function processBulkExport(
  itemIds: string[],
  exportOptions: ExportOptions
): Promise<BulkOperationResult> {
  try {
    const _exportResult = await InventoryExportService.exportItems(
      itemIds,
      exportOptions
    );

    logEvent(
      'inventory',
      'bulk_export_completed',
      `Bulk export completed: ${itemIds.length} items exported`,
      'info',
      {
        totalItems: itemIds.length,
        exportFormat: exportOptions.format,
        exportMethod: 'bulk_operation',
      }
    );

    trackUserAction('bulk_export_items', 'inventory', {
      totalItems: itemIds.length,
      exportFormat: exportOptions.format,
    });

    trackAnalyticsEvent('inventory_bulk_export_completed', {
      totalItems: itemIds.length,
      exportFormat: exportOptions.format,
      exportMethod: 'bulk_operation',
    });

    console.log('Bulk export completed with performance metrics:', {
      totalItems: itemIds.length,
      exportFormat: exportOptions.format,
      exportMethod: 'bulk_operation',
    });

    return { exportedCount: itemIds.length };
  } catch (error) {
    console.error('Error in bulk export:', error);
    throw new Error('Bulk export failed');
  }
}

/**
 * Validate import options
 */
function validateImportOptions(options: ImportOptions): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof options.validateData !== 'boolean') {
    errors.push('validateData must be a boolean');
  }

  if (typeof options.skipDuplicates !== 'boolean') {
    errors.push('skipDuplicates must be a boolean');
  }

  if (typeof options.createMissingCategories !== 'boolean') {
    errors.push('createMissingCategories must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
