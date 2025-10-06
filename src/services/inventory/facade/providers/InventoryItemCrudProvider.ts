import { InventoryItem, LocalInventoryItem } from '../types';
import { InventoryDataAdapter } from '../../adapters/InventoryDataAdapter';
import { InventoryErrorHandler } from '../../InventoryErrorHandler';
import { cacheInvalidationService } from '../../../cache/cacheInvalidationCompatibility';
import { logEvent, trackUserAction } from '../../../../utils/monitoring';
import { trackEvent as trackAnalyticsEvent } from '../../../analytics';

export class InventoryItemCrudProvider {
  private adapter: InventoryDataAdapter;
  private adapterType: string;

  constructor(adapter: InventoryDataAdapter, adapterType: string) {
    this.adapter = adapter;
    this.adapterType = adapterType;
  }

  /**
   * Fetch all inventory items
   */
  async fetchInventoryItems(): Promise<LocalInventoryItem[]> {
    const result = await InventoryErrorHandler.handleOperation(
      'fetchInventoryItems',
      async () => {
        return await this.adapter.fetchInventoryItems();
      }
    );
    return result;
  }

  /**
   * Get item by ID
   */
  async getItemById(
    id: string
  ): Promise<{ data: LocalInventoryItem | null; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'getItemById',
      async () => {
        const items = await this.adapter.fetchInventoryItems();
        const item = items.find((item) => item.id === id) || null;
        return { data: item, error: null };
      }
    );

    return result;
  }

  /**
   * Create new inventory item
   */
  async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>
  ): Promise<{ data: InventoryItem; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'createItem',
      async () => {
        const result = await this.adapter.addInventoryItem(
          item as InventoryItem
        );
        cacheInvalidationService.invalidateRelated(
          'inventory:create',
          result.id
        );

        // Track inventory item creation
        logEvent(
          'inventory',
          'item_created',
          `Inventory item created: ${item.name || item.item}`,
          'info',
          {
            itemId: result.id,
            itemName: item.name || item.item,
            category: item.category,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('create_item', 'inventory', {
          itemId: result.id,
          itemName: item.name || item.item,
          category: item.category,
        });

        trackAnalyticsEvent('inventory_item_created', {
          itemId: result.id,
          itemName: item.name || item.item,
          category: item.category,
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Update inventory item
   */
  async updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<{ data: InventoryItem; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'updateItem',
      async () => {
        const result = await this.adapter.updateInventoryItem(id, updates);
        cacheInvalidationService.invalidateRelated('inventory:update', id);

        // Track inventory item update
        logEvent(
          'inventory',
          'item_updated',
          `Inventory item updated: ${id}`,
          'info',
          {
            itemId: id,
            updates: Object.keys(updates),
            adapterType: this.adapterType,
          }
        );

        trackUserAction('update_item', 'inventory', {
          itemId: id,
          updates: Object.keys(updates),
        });

        trackAnalyticsEvent('inventory_item_updated', {
          itemId: id,
          updates: Object.keys(updates),
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Delete inventory item
   */
  async deleteItem(
    id: string
  ): Promise<{ success: boolean; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'deleteItem',
      async () => {
        await this.adapter.deleteInventoryItem(id);
        cacheInvalidationService.invalidateRelated('inventory:delete', id);

        // Track inventory item deletion
        logEvent(
          'inventory',
          'item_deleted',
          `Inventory item deleted: ${id}`,
          'info',
          {
            itemId: id,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('delete_item', 'inventory', { itemId: id });

        trackAnalyticsEvent('inventory_item_deleted', {
          itemId: id,
          adapterType: this.adapterType,
        });

        return true;
      }
    );

    return { success: result, error: null };
  }

  /**
   * Add inventory item
   */
  async addInventoryItem(item: LocalInventoryItem): Promise<InventoryItem> {
    const result = await InventoryErrorHandler.handleOperation(
      'addInventoryItem',
      async () => {
        const result = await this.adapter.addInventoryItem(item);
        cacheInvalidationService.invalidateRelated('inventory:create', item.id);

        // Track inventory item creation
        logEvent(
          'inventory',
          'item_created',
          `Inventory item created: ${item.name || item.item}`,
          'info',
          {
            itemId: item.id,
            itemName: item.name || item.item,
            category: item.category,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('create_item', 'inventory', {
          itemId: item.id,
          itemName: item.name || item.item,
          category: item.category,
        });

        trackAnalyticsEvent('inventory_item_created', {
          itemId: item.id,
          itemName: item.name || item.item,
          category: item.category,
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return result;
  }

  /**
   * Validate inventory item data
   */
  static validateItemData(item: Partial<InventoryItem>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!item.name && !item.item) {
      errors.push('Item name is required');
    }

    if (!item.category) {
      errors.push('Category is required');
    }

    if (item.quantity !== undefined && item.quantity < 0) {
      errors.push('Quantity must be non-negative');
    }

    if (
      (item as Record<string, unknown>).minimumStock !== undefined &&
      (item as Record<string, unknown>).minimumStock < 0
    ) {
      errors.push('Minimum stock must be non-negative');
    }

    if (item.location && item.location.length > 200) {
      errors.push('Location must be less than 200 characters');
    }

    if (item.description && item.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Duplicate item
   */
  async duplicateItem(
    id: string,
    newName?: string
  ): Promise<{ data: InventoryItem; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'duplicateItem',
      async () => {
        const originalItem = await this.getItemById(id);
        if (!originalItem.data) {
          throw new Error('Original item not found');
        }

        const duplicatedItem = {
          ...originalItem.data,
          name: newName || `${originalItem.data.name} (Copy)`,
          id: '', // Will be generated by adapter
        };

        const result = await this.adapter.addInventoryItem(duplicatedItem);
        cacheInvalidationService.invalidateRelated(
          'inventory:create',
          result.id
        );

        // Track item duplication
        logEvent(
          'inventory',
          'item_duplicated',
          `Inventory item duplicated: ${id} -> ${result.id}`,
          'info',
          {
            originalItemId: id,
            newItemId: result.id,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('duplicate_item', 'inventory', {
          originalItemId: id,
          newItemId: result.id,
        });

        trackAnalyticsEvent('inventory_item_duplicated', {
          originalItemId: id,
          newItemId: result.id,
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Archive item (soft delete)
   */
  async archiveItem(
    id: string,
    reason?: string
  ): Promise<{ data: InventoryItem; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'archiveItem',
      async () => {
        const result = await this.adapter.updateInventoryItem(id, {
          status: 'archived',
          archiveReason: reason,
        } as Record<string, unknown>);
        cacheInvalidationService.invalidateRelated('inventory:update', id);

        // Track item archival
        logEvent(
          'inventory',
          'item_archived',
          `Inventory item archived: ${id}`,
          'info',
          {
            itemId: id,
            reason,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('archive_item', 'inventory', {
          itemId: id,
          reason,
        });

        trackAnalyticsEvent('inventory_item_archived', {
          itemId: id,
          reason,
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return { data: result, error: null };
  }

  /**
   * Restore archived item
   */
  async restoreItem(
    id: string
  ): Promise<{ data: InventoryItem; error: string | null }> {
    const result = await InventoryErrorHandler.handleOperation(
      'restoreItem',
      async () => {
        const result = await this.adapter.updateInventoryItem(id, {
          status: 'active',
          archiveReason: null,
        } as Record<string, unknown>);
        cacheInvalidationService.invalidateRelated('inventory:update', id);

        // Track item restoration
        logEvent(
          'inventory',
          'item_restored',
          `Inventory item restored: ${id}`,
          'info',
          {
            itemId: id,
            adapterType: this.adapterType,
          }
        );

        trackUserAction('restore_item', 'inventory', { itemId: id });

        trackAnalyticsEvent('inventory_item_restored', {
          itemId: id,
          adapterType: this.adapterType,
        });

        return result;
      }
    );

    return { data: result, error: null };
  }
}
