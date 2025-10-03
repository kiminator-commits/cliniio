import { useCallback, useRef, useState } from 'react';
import { InventoryItem, InventoryFormData } from '@/types/inventory';
import { useInventoryFormSubmission } from './useInventoryFormSubmission';
import { useInventoryFormValidation } from './useInventoryFormValidation';
import { useInventoryErrorHandling } from './useInventoryErrorHandling';
import { InventoryBulkProgressService } from '@/pages/Inventory/services/inventoryBulkProgressService';

interface UpdateState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'update' | null;
  operationTimestamp: Date | null;
  itemsBeingUpdated: Set<string>;
}

interface UpdateOperations {
  // Single item updates
  updateItem: (
    id: string,
    updates: Partial<InventoryItem>
  ) => Promise<InventoryItem | null>;
  updateItemStatus: (
    id: string,
    status: string
  ) => Promise<InventoryItem | null>;
  updateItemQuantity: (
    id: string,
    quantity: number
  ) => Promise<InventoryItem | null>;
  updateItemLocation: (
    id: string,
    location: string
  ) => Promise<InventoryItem | null>;
  updateItemCategory: (
    id: string,
    category: string
  ) => Promise<InventoryItem | null>;

  // Bulk updates
  updateBulkItems: (
    updates: Array<{ id: string; updates: Partial<InventoryItem> }>
  ) => Promise<InventoryItem[]>;
  updateBulkStatus: (ids: string[], status: string) => Promise<InventoryItem[]>;
  updateBulkLocation: (
    ids: string[],
    location: string
  ) => Promise<InventoryItem[]>;
  updateBulkCategory: (
    ids: string[],
    category: string
  ) => Promise<InventoryItem[]>;

  // Utility operations
  isUpdating: (id: string) => boolean;
  getUpdateProgress: () => {
    total: number;
    completed: number;
    inProgress: number;
  };
}

export const useInventoryUpdate = (): UpdateState & UpdateOperations => {
  const [state, setState] = useState<UpdateState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    operationTimestamp: null,
    itemsBeingUpdated: new Set(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const formValidation = useInventoryFormValidation();
  const formSubmission = useInventoryFormSubmission();
  const errorHandling = useInventoryErrorHandling();

  const updateState = useCallback((updates: Partial<UpdateState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Main update function
  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<InventoryItem>
    ): Promise<InventoryItem | null> => {
      try {
        // Cancel any ongoing operation
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        updateState({
          isLoading: true,
          error: null,
          lastOperation: 'update',
          itemsBeingUpdated: new Set([id]),
        });

        // Validate updates
        if (!formValidation.validateForm?.(updates)) {
          throw new Error('Invalid update data');
        }

        // Submit the update - convert InventoryItem to InventoryFormData format
        const formDataUpdates: Partial<InventoryFormData> = {
          id: updates.id,
          itemName: updates.name || undefined,
          category: updates.category || undefined,
          location: updates.location || undefined,
          status: updates.status || undefined,
          quantity: updates.quantity || undefined,
          unitCost: updates.unit_cost || undefined,
          reorder_point: updates.reorder_point,
          // maximumQuantity removed - not in Supabase schema
          supplier: updates.supplier || undefined,
          data: {
            barcode: updates.barcode || undefined,
            sku: updates.sku || undefined,
            description: updates.description,
            notes: updates.notes,
          },
        };
        const result = await formSubmission.submitForm?.(formDataUpdates);

        if (result) {
          const updatedItem = updates as unknown as InventoryItem;

          // Update local state - using dataAccess methods instead
          // setInventoryData(prev => prev.map(item => (item.id === id ? updatedItem : item)));

          // Log the operation (commented out since logOperation doesn't exist)
          // await errorHandling.logOperation?.('update_item', {
          //   itemId: id,
          //   updates: Object.keys(updates),
          //   itemName: updatedItem.name,
          // });

          updateState({
            isLoading: false,
            lastOperation: 'update',
            operationTimestamp: new Date(),
            itemsBeingUpdated: new Set(),
          });

          return updatedItem;
        } else {
          throw new Error('Failed to update item');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          isLoading: false,
          error: errorMessage,
          itemsBeingUpdated: new Set(),
        });
        errorHandling.handleError?.(errorMessage);
        return null;
      }
    },
    [formValidation, formSubmission, errorHandling, updateState]
  );

  // Update item status
  const updateItemStatus = useCallback(
    async (id: string, status: string): Promise<InventoryItem | null> => {
      return updateItem(id, { status });
    },
    [updateItem]
  );

  // Update item quantity
  const updateItemQuantity = useCallback(
    async (id: string, quantity: number): Promise<InventoryItem | null> => {
      return updateItem(id, { quantity });
    },
    [updateItem]
  );

  // Update item location
  const updateItemLocation = useCallback(
    async (id: string, location: string): Promise<InventoryItem | null> => {
      return updateItem(id, { location });
    },
    [updateItem]
  );

  // Update item category
  const updateItemCategory = useCallback(
    async (id: string, category: string): Promise<InventoryItem | null> => {
      return updateItem(id, { category });
    },
    [updateItem]
  );

  // Bulk item updates
  const updateBulkItems = useCallback(
    async (
      updates: Array<{ id: string; updates: Partial<InventoryItem> }>
    ): Promise<InventoryItem[]> => {
      try {
        const itemIds = updates.map((u) => u.id);
        updateState({
          isLoading: true,
          error: null,
          lastOperation: 'update',
          itemsBeingUpdated: new Set(itemIds),
        });

        // Use standardized bulk operation service with retry support
        const { results, failed } =
          await InventoryBulkProgressService.simpleBulkOperationWithRetry(
            updates,
            async ({ id, updates: itemUpdates }) =>
              await updateItem(id, itemUpdates),
            {
              maxRetries: 3,
              delay: 1000,
              enableRetry: true,
            }
          );

        const updatedItems = results.filter(
          (item) => item !== null
        ) as InventoryItem[];

        // Log any failures for debugging
        if (failed.length > 0) {
          console.warn(
            `Bulk update: ${failed.length} items failed to update:`,
            failed
          );
        }

        // Log the operation (commented out since logOperation doesn't exist)
        // await errorHandling.logOperation?.('update_bulk_items', {
        //   totalItems: updates.length,
        //   updatedItems: updatedItems.length,
        //   failedItems: failed.length,
        //   errors: errors.slice(0, 5),
        // });

        updateState({
          isLoading: false,
          lastOperation: 'update',
          operationTimestamp: new Date(),
          itemsBeingUpdated: new Set(),
        });

        return updatedItems;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          isLoading: false,
          error: errorMessage,
          itemsBeingUpdated: new Set(),
        });
        errorHandling.handleError?.(errorMessage);
        return [];
      }
    },
    [updateItem, errorHandling, updateState]
  );

  // Bulk status update
  const updateBulkStatus = useCallback(
    async (ids: string[], status: string): Promise<InventoryItem[]> => {
      const updates = ids.map((id) => ({ id, updates: { status } }));
      return updateBulkItems(updates);
    },
    [updateBulkItems]
  );

  // Bulk location update
  const updateBulkLocation = useCallback(
    async (ids: string[], location: string): Promise<InventoryItem[]> => {
      const updates = ids.map((id) => ({ id, updates: { location } }));
      return updateBulkItems(updates);
    },
    [updateBulkItems]
  );

  // Bulk category update
  const updateBulkCategory = useCallback(
    async (ids: string[], category: string): Promise<InventoryItem[]> => {
      const updates = ids.map((id) => ({ id, updates: { category } }));
      return updateBulkItems(updates);
    },
    [updateBulkItems]
  );

  // Utility functions
  const isUpdating = useCallback(
    (id: string): boolean => {
      return state.itemsBeingUpdated.has(id);
    },
    [state.itemsBeingUpdated]
  );

  const getUpdateProgress = useCallback(() => {
    const total = state.itemsBeingUpdated.size;
    const inProgress = total;
    const completed = 0; // In a real implementation, you'd track completed items

    return {
      total,
      completed,
      inProgress,
    };
  }, [state.itemsBeingUpdated]);

  return {
    // State
    ...state,

    // Single item updates
    updateItem,
    updateItemStatus,
    updateItemQuantity,
    updateItemLocation,
    updateItemCategory,

    // Bulk updates
    updateBulkItems,
    updateBulkStatus,
    updateBulkLocation,
    updateBulkCategory,

    // Utility operations
    isUpdating,
    getUpdateProgress,
  };
};
