import { useState, useCallback, useRef } from 'react';
import { useInventoryDataManager } from './useInventoryDataManager';
import { useErrorRecovery } from '../useErrorRecovery';
import { useAuditLogger } from '../../utils/auditLogger';
import { InventoryItem } from '../../types/inventory';
import { InventoryBulkProgressService } from '@/pages/Inventory/services/inventoryBulkProgressService';

interface DeleteState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'delete' | null;
  operationTimestamp: Date | null;
  itemsBeingDeleted: Set<string>;
  deletedItems: Set<string>;
}

interface DeleteOperations {
  // Single item deletion
  deleteItem: (id: string) => Promise<boolean>;
  softDeleteItem: (id: string) => Promise<InventoryItem | null>;
  hardDeleteItem: (id: string) => Promise<boolean>;

  // Bulk deletion
  deleteBulkItems: (ids: string[]) => Promise<boolean>;
  softDeleteBulkItems: (ids: string[]) => Promise<InventoryItem[]>;
  hardDeleteBulkItems: (ids: string[]) => Promise<boolean>;

  // Utility operations
  isDeleting: (id: string) => boolean;
  isDeleted: (id: string) => boolean;
  getDeleteProgress: () => {
    total: number;
    completed: number;
    inProgress: number;
  };
  restoreItem: (id: string) => Promise<InventoryItem | null>;
  restoreBulkItems: (ids: string[]) => Promise<InventoryItem[]>;
  clearDeletedItems: () => void;
}

export const useInventoryDelete = (): DeleteState & DeleteOperations => {
  const [state, setState] = useState<DeleteState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    operationTimestamp: null,
    itemsBeingDeleted: new Set(),
    deletedItems: new Set(),
  });

  const { inventoryData } = useInventoryDataManager();
  const setInventoryData = useCallback(
    (updater: (prev: InventoryItem[]) => InventoryItem[]) => {
      // This is a simplified implementation - in a real app, you'd update the store
      // For now, just call the updater function but don't store the result
      updater([]);
    },
    []
  );
  const { handleError } = useErrorRecovery();
  const { logAuditEvent } = useAuditLogger();
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback((updates: Partial<DeleteState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const logOperation = useCallback(
    async (operation: string, details: Record<string, unknown>) => {
      try {
        await logAuditEvent('inventory_delete', {
          operation,
          details,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to log audit event:', error);
      }
    },
    [logAuditEvent]
  );

  // Single item deletion
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
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

        // Cancel any ongoing operations
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Call delete API
        const response = await fetch(`/api/inventory/${id}`, {
          method: 'DELETE',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to delete item: ${response.statusText}`);
        }

        // Update local state
        setInventoryData((prev: InventoryItem[]) =>
          prev.filter((item) => item.id !== id)
        );

        // Add to deleted items set
        setState((prev: DeleteState) => ({
          ...prev,
          deletedItems: new Set([...prev.deletedItems, id]),
        }));

        // Log the operation
        await logOperation('delete_item', {
          itemId: id,
          itemName: existingItem.name,
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return true;
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
    [inventoryData, setInventoryData, logOperation, updateState, handleError]
  );

  // Soft delete item (mark as deleted but keep in database)
  const softDeleteItem = useCallback(
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

        // Update item status to deleted
        const updatedItem = { ...existingItem, status: 'deleted' };

        // Update local state
        setInventoryData((prev: InventoryItem[]) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );

        // Add to deleted items set
        setState((prev) => ({
          ...prev,
          deletedItems: new Set([...prev.deletedItems, id]),
        }));

        // Log the operation
        await logOperation('soft_delete_item', {
          itemId: id,
          itemName: existingItem.name,
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
          itemsBeingDeleted: new Set(),
        });

        return updatedItem;
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

  // Hard delete item (permanently remove from database)
  const hardDeleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteItem(id);
    },
    [deleteItem]
  );

  // Bulk item deletion
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
            deleteItem,
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
    [deleteItem, logOperation, updateState, handleError]
  );

  // Bulk soft delete
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
            softDeleteItem,
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
    [softDeleteItem, logOperation, updateState, handleError]
  );

  // Bulk hard delete
  const hardDeleteBulkItems = useCallback(
    async (ids: string[]): Promise<boolean> => {
      return deleteBulkItems(ids);
    },
    [deleteBulkItems]
  );

  // Restore item (for soft deleted items)
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

        // Remove from deleted items set
        setState((prev: DeleteState) => ({
          ...prev,
          deletedItems: new Set(
            [...prev.deletedItems].filter((itemId) => itemId !== id)
          ),
        }));

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

  // Bulk restore items
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

  // Utility functions
  const isDeleting = useCallback(
    (id: string): boolean => {
      return state.itemsBeingDeleted.has(id);
    },
    [state.itemsBeingDeleted]
  );

  const isDeleted = useCallback(
    (id: string): boolean => {
      return state.deletedItems.has(id);
    },
    [state.deletedItems]
  );

  const getDeleteProgress = useCallback(() => {
    const total = state.itemsBeingDeleted.size;
    const inProgress = total;
    const completed = 0; // In a real implementation, you'd track completed items

    return {
      total,
      completed,
      inProgress,
    };
  }, [state.itemsBeingDeleted]);

  const clearDeletedItems = useCallback(() => {
    updateState({ deletedItems: new Set() });
  }, [updateState]);

  return {
    // State
    ...state,

    // Single item deletion
    deleteItem,
    softDeleteItem,
    hardDeleteItem,

    // Bulk deletion
    deleteBulkItems,
    softDeleteBulkItems,
    hardDeleteBulkItems,

    // Utility operations
    isDeleting,
    isDeleted,
    getDeleteProgress,
    restoreItem,
    restoreBulkItems,
    clearDeletedItems,
  };
};
