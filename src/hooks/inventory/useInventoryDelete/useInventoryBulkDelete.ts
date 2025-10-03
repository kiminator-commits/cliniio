import { useCallback } from 'react';
import { InventoryItem } from '../../../types/inventory';
import { InventoryBulkProgressService } from '../../../pages/Inventory/services/inventoryBulkProgressService';

interface UseInventoryBulkDeleteProps {
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
  singleDelete: {
    deleteItem: (id: string) => Promise<boolean>;
    softDeleteItem: (id: string) => Promise<InventoryItem | null>;
  };
}

/**
 * Custom hook that handles bulk delete operations.
 * Provides bulk delete, soft delete, and error handling for multiple items.
 */
export const useInventoryBulkDelete = ({
  updateState,
  logOperation,
  handleError,
  singleDelete,
}: UseInventoryBulkDeleteProps) => {
  const deleteBulkItems = useCallback(
    async (ids: string[]): Promise<boolean> => {
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
            singleDelete.deleteItem,
            {
              maxRetries: 3,
              delay: 1000,
              enableRetry: true,
            }
          );

        const successCount = results.length;
        const failedCount = failed.length;

        // Log any failures for debugging
        if (failedCount > 0) {
          console.warn(
            `Bulk delete: ${failedCount} items failed to delete:`,
            failed
          );
        }

        await logOperation('delete_bulk_items', {
          totalItems: ids.length,
          deletedItems: successCount,
          failedItems: failedCount,
          errors: errors.slice(0, 5), // Log first 5 errors
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return successCount === ids.length;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({
          isLoading: false,
          error: errorMessage,
          itemsBeingDeleted: new Set(),
        });
        handleError(errorMessage);
        return false;
      }
    },
    [singleDelete.deleteItem, logOperation, updateState, handleError]
  );

  const softDeleteBulkItems = useCallback(
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
            singleDelete.softDeleteItem,
            {
              maxRetries: 3,
              delay: 1000,
              enableRetry: true,
            }
          );

        const deletedItems = results.filter(
          (item) => item !== null
        ) as InventoryItem[];
        const failedCount = failed.length;

        // Log any failures for debugging
        if (failedCount > 0) {
          console.warn(
            `Bulk soft delete: ${failedCount} items failed to soft delete:`,
            failed
          );
        }

        await logOperation('soft_delete_bulk_items', {
          totalItems: ids.length,
          deletedItems: deletedItems.length,
          failedItems: failedCount,
          errors: errors.slice(0, 5), // Log first 5 errors
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return deletedItems;
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
    [singleDelete.softDeleteItem, logOperation, updateState, handleError]
  );

  const hardDeleteBulkItems = useCallback(
    async (ids: string[]): Promise<boolean> => {
      return deleteBulkItems(ids);
    },
    [deleteBulkItems]
  );

  return {
    deleteBulkItems,
    softDeleteBulkItems,
    hardDeleteBulkItems,
  };
};
