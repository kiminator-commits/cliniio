import { useCallback } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { InventoryBulkProgressService } from '../../../pages/Inventory/services/inventoryBulkProgressService';

interface UseInventoryRestoreProps {
  inventoryData: InventoryItem[];
  setInventoryData: (
    updater: (prev: InventoryItem[]) => InventoryItem[]
  ) => void;
  updateState: (updates: {
    isLoading?: boolean;
    error?: string | null;
    lastOperation?: 'delete' | null;
    itemsBeingDeleted?: Set<string>;
    operationTimestamp?: Date;
  }) => void;
  logOperation: (
    operation: string,
    details: Record<string, unknown>
  ) => Promise<void>;
  handleError: (error: string) => void;
}

/**
 * Custom hook that handles restore operations for soft-deleted items.
 * Provides single and bulk restore functionality with proper state management.
 */
export const useInventoryRestore = ({
  inventoryData,
  setInventoryData,
  updateState,
  logOperation,
  handleError,
}: UseInventoryRestoreProps) => {
  const restoreItem = useCallback(
    async (id: string): Promise<InventoryItem | null> => {
      try {
        updateState({
          isLoading: true,
          error: null,
          lastOperation: 'delete',
          itemsBeingDeleted: new Set([id]),
        });

        const existingItem = inventoryData.find((item) => item.id === id);
        if (!existingItem) {
          throw new Error(`Item with id ${id} not found`);
        }

        // Update item status back to available
        const restoredItem = { ...existingItem, status: 'available' };

        // Update local state
        setInventoryData((prev: InventoryItem[]) =>
          prev.map((item) => (item.id === id ? restoredItem : item))
        );

        // Log the operation
        await logOperation('restore_item', {
          itemId: id,
          itemName: existingItem.name,
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return restoredItem;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          isLoading: false,
          error: errorMessage,
          itemsBeingDeleted: new Set(),
        });
        handleError(errorMessage);
        return null;
      }
    },
    [inventoryData, setInventoryData, logOperation, updateState, handleError]
  );

  const restoreBulkItems = useCallback(
    async (ids: string[]): Promise<InventoryItem[]> => {
      try {
        updateState({
          isLoading: true,
          error: null,
          lastOperation: 'delete',
          itemsBeingDeleted: new Set(ids),
        });

        // Use standardized bulk operation service with retry support
        const { results, failed, errors } =
          await InventoryBulkProgressService.simpleBulkOperationWithRetry(
            ids,
            restoreItem,
            {
              maxRetries: 3,
              delay: 1000,
              enableRetry: true,
            }
          );

        const restoredItems = results.filter(
          (item) => item !== null
        ) as InventoryItem[];
        const failedCount = failed.length;

        // Log any failures for debugging
        if (failedCount > 0) {
          console.warn(
            `Bulk restore: ${failedCount} items failed to restore:`,
            failed
          );
        }

        await logOperation('restore_bulk_items', {
          totalItems: ids.length,
          restoredItems: restoredItems.length,
          failedItems: failedCount,
          errors: errors.slice(0, 5), // Log first 5 errors
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return restoredItems;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          isLoading: false,
          error: errorMessage,
          itemsBeingDeleted: new Set(),
        });
        handleError(errorMessage);
        return [];
      }
    },
    [restoreItem, logOperation, updateState, handleError]
  );

  return {
    restoreItem,
    restoreBulkItems,
  };
};
