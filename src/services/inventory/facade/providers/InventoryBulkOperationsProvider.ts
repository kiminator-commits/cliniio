import { InventoryItem } from '../types';
import { InventoryDataAdapter } from '../../adapters/InventoryDataAdapter';
import { InventoryErrorHandler } from '../../InventoryErrorHandler';
import { cacheInvalidationService } from '../../../cache/cacheInvalidationCompatibility';
import { logEvent, trackUserAction } from '../../../../utils/monitoring';
import { trackEvent as trackAnalyticsEvent } from '../../../analytics';

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  data: InventoryItem[];
}

export class InventoryBulkOperationsProvider {
  private adapter: InventoryDataAdapter;
  private adapterType: string;

  constructor(adapter: InventoryDataAdapter, adapterType: string) {
    this.adapter = adapter;
    this.adapterType = adapterType;
  }

  /**
   * Bulk create items
   */
  async bulkCreateItems(
    items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]
  ): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkCreateItems',
      async () => {
        const createdItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const item of items) {
          try {
            const createdItem = await this.adapter.addInventoryItem(
              item as InventoryItem
            );
            createdItems.push(createdItem);
            cacheInvalidationService.invalidateRelated(
              'inventory:create',
              createdItem.id
            );
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to create item ${item.name || item.item}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk creation
        logEvent(
          'inventory',
          'bulk_items_created',
          `Bulk created ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: items.length,
            successCount,
            errorCount,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_create_items', 'inventory', {
          totalItems: items.length,
          successCount,
          errorCount,
        });

        trackAnalyticsEvent('inventory_bulk_items_created', {
          totalItems: items.length,
          successCount,
          errorCount,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: items.length,
          successCount,
          errorCount,
          errors,
          data: createdItems,
        };
      }
    );

    return result;
  }

  /**
   * Bulk update items
   */
  async bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<InventoryItem> }>
  ): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkUpdateItems',
      async () => {
        const updatedItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const update of updates) {
          try {
            const updatedItem = await this.adapter.updateInventoryItem(
              update.id,
              update.updates
            );
            updatedItems.push(updatedItem);
            cacheInvalidationService.invalidateRelated(
              'inventory:update',
              update.id
            );
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to update item ${update.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk update
        logEvent(
          'inventory',
          'bulk_items_updated',
          `Bulk updated ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: updates.length,
            successCount,
            errorCount,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_update_items', 'inventory', {
          totalItems: updates.length,
          successCount,
          errorCount,
        });

        trackAnalyticsEvent('inventory_bulk_items_updated', {
          totalItems: updates.length,
          successCount,
          errorCount,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: updates.length,
          successCount,
          errorCount,
          errors,
          data: updatedItems,
        };
      }
    );

    return result;
  }

  /**
   * Bulk delete items
   */
  async bulkDeleteItems(ids: string[]): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkDeleteItems',
      async () => {
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const id of ids) {
          try {
            await this.adapter.deleteInventoryItem(id);
            cacheInvalidationService.invalidateRelated('inventory:delete', id);
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to delete item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk deletion
        logEvent(
          'inventory',
          'bulk_items_deleted',
          `Bulk deleted ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: ids.length,
            successCount,
            errorCount,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_delete_items', 'inventory', {
          totalItems: ids.length,
          successCount,
          errorCount,
        });

        trackAnalyticsEvent('inventory_bulk_items_deleted', {
          totalItems: ids.length,
          successCount,
          errorCount,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: ids.length,
          successCount,
          errorCount,
          errors,
          data: [],
        };
      }
    );

    return result;
  }

  /**
   * Bulk archive items
   */
  async bulkArchiveItems(
    ids: string[],
    reason?: string
  ): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkArchiveItems',
      async () => {
        const archivedItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const id of ids) {
          try {
            const archivedItem = await this.adapter.updateInventoryItem(id, {
              status: 'archived',
              archivedAt: new Date().toISOString(),
              archiveReason: reason,
            });
            archivedItems.push(archivedItem);
            cacheInvalidationService.invalidateRelated('inventory:update', id);
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to archive item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk archival
        logEvent(
          'inventory',
          'bulk_items_archived',
          `Bulk archived ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: ids.length,
            successCount,
            errorCount,
            reason,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_archive_items', 'inventory', {
          totalItems: ids.length,
          successCount,
          errorCount,
          reason,
        });

        trackAnalyticsEvent('inventory_bulk_items_archived', {
          totalItems: ids.length,
          successCount,
          errorCount,
          reason,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: ids.length,
          successCount,
          errorCount,
          errors,
          data: archivedItems,
        };
      }
    );

    return result;
  }

  /**
   * Bulk restore items
   */
  async bulkRestoreItems(ids: string[]): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkRestoreItems',
      async () => {
        const restoredItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const id of ids) {
          try {
            const restoredItem = await this.adapter.updateInventoryItem(id, {
              status: 'active',
              archivedAt: null,
              archiveReason: null,
            });
            restoredItems.push(restoredItem);
            cacheInvalidationService.invalidateRelated('inventory:update', id);
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to restore item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk restoration
        logEvent(
          'inventory',
          'bulk_items_restored',
          `Bulk restored ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: ids.length,
            successCount,
            errorCount,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_restore_items', 'inventory', {
          totalItems: ids.length,
          successCount,
          errorCount,
        });

        trackAnalyticsEvent('inventory_bulk_items_restored', {
          totalItems: ids.length,
          successCount,
          errorCount,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: ids.length,
          successCount,
          errorCount,
          errors,
          data: restoredItems,
        };
      }
    );

    return result;
  }

  /**
   * Bulk change category
   */
  async bulkChangeCategory(
    ids: string[],
    newCategory: string
  ): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkChangeCategory',
      async () => {
        const updatedItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const id of ids) {
          try {
            const updatedItem = await this.adapter.updateInventoryItem(id, {
              category: newCategory,
            });
            updatedItems.push(updatedItem);
            cacheInvalidationService.invalidateRelated('inventory:update', id);
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to change category for item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk category change
        logEvent(
          'inventory',
          'bulk_category_changed',
          `Bulk changed category for ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: ids.length,
            successCount,
            errorCount,
            newCategory,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_change_category', 'inventory', {
          totalItems: ids.length,
          successCount,
          errorCount,
          newCategory,
        });

        trackAnalyticsEvent('inventory_bulk_category_changed', {
          totalItems: ids.length,
          successCount,
          errorCount,
          newCategory,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: ids.length,
          successCount,
          errorCount,
          errors,
          data: updatedItems,
        };
      }
    );

    return result;
  }

  /**
   * Bulk change location
   */
  async bulkChangeLocation(
    ids: string[],
    newLocation: string
  ): Promise<BulkOperationResult> {
    const result = await InventoryErrorHandler.handleOperation(
      'bulkChangeLocation',
      async () => {
        const updatedItems: InventoryItem[] = [];
        const errors: string[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (const id of ids) {
          try {
            const updatedItem = await this.adapter.updateInventoryItem(id, {
              location: newLocation,
            });
            updatedItems.push(updatedItem);
            cacheInvalidationService.invalidateRelated('inventory:update', id);
            successCount++;
          } catch (error) {
            errors.push(
              `Failed to change location for item ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            errorCount++;
          }
        }

        // Track bulk location change
        logEvent(
          'inventory',
          'bulk_location_changed',
          `Bulk changed location for ${successCount} items, ${errorCount} failed`,
          'info',
          {
            totalItems: ids.length,
            successCount,
            errorCount,
            newLocation,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('bulk_change_location', 'inventory', {
          totalItems: ids.length,
          successCount,
          errorCount,
          newLocation,
        });

        trackAnalyticsEvent('inventory_bulk_location_changed', {
          totalItems: ids.length,
          successCount,
          errorCount,
          newLocation,
          adapterType: this.adapterType,
        });

        return {
          success: errorCount === 0,
          processedCount: ids.length,
          successCount,
          errorCount,
          errors,
          data: updatedItems,
        };
      }
    );

    return result;
  }

  /**
   * Validate bulk operation data
   */
  static validateBulkOperationData(
    operation: string,
    data: unknown[]
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data || data.length === 0) {
      errors.push('No data provided for bulk operation');
    }

    if (data.length > 1000) {
      errors.push('Bulk operation limited to 1000 items maximum');
    }

    switch (operation) {
      case 'create':
        // Validate each item has required fields
        data.forEach((item, index) => {
          if (!item || typeof item !== 'object') {
            errors.push(`Item ${index + 1}: Invalid item data`);
            return;
          }
          const itemObj = item as Record<string, unknown>;
          if (!itemObj.name && !itemObj.item) {
            errors.push(`Item ${index + 1}: Name is required`);
          }
          if (!itemObj.category) {
            errors.push(`Item ${index + 1}: Category is required`);
          }
        });
        break;

      case 'update':
        // Validate each update has id and updates
        data.forEach((update, index) => {
          if (!update || typeof update !== 'object') {
            errors.push(`Update ${index + 1}: Invalid update data`);
            return;
          }
          const updateObj = update as Record<string, unknown>;
          if (!updateObj.id) {
            errors.push(`Update ${index + 1}: ID is required`);
          }
          if (!updateObj.updates) {
            errors.push(`Update ${index + 1}: Updates object is required`);
          }
        });
        break;

      case 'delete':
      case 'archive':
      case 'restore':
        // Validate each ID is a string
        data.forEach((id, index) => {
          if (typeof id !== 'string' || !id.trim()) {
            errors.push(`ID ${index + 1}: Valid ID is required`);
          }
        });
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
