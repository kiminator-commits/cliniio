import { useCallback, useRef } from 'react';
import { InventoryItem } from '../../../types/inventory';

interface UseInventorySingleDeleteProps {
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
 * Custom hook that handles single item delete operations.
 * Provides hard delete, soft delete, and error handling for individual items.
 */
export const useInventorySingleDelete = ({
  inventoryData,
  setInventoryData,
  updateState,
  logOperation,
  handleError,
}: UseInventorySingleDeleteProps) => {
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const hardDeleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      return deleteItem(id);
    },
    [deleteItem]
  );

  return {
    deleteItem,
    softDeleteItem,
    hardDeleteItem,
  };
};
