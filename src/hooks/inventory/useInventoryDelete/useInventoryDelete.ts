import { useState, useCallback } from 'react';
import { useInventoryDataManager } from '../useInventoryDataManager';
import { useErrorRecovery } from '../../useErrorRecovery';
import { useAuditLogger } from '../../../utils/auditLogger';
import { InventoryItem } from '../../../types/inventory';
import { useInventorySingleDelete } from './useInventorySingleDelete';
import { useInventoryBulkDelete } from './useInventoryBulkDelete';
import { useInventoryRestore } from './useInventoryRestore';
import { useInventoryDeleteState } from './useInventoryDeleteState';

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

/**
 * Main orchestrator hook for inventory delete operations.
 * Coordinates between focused hooks for single, bulk, and restore operations.
 */
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

  // Custom hooks for different delete operations
  const { updateState, logOperation } = useInventoryDeleteState(
    setState,
    logAuditEvent
  );

  const singleDelete = useInventorySingleDelete({
    inventoryData,
    setInventoryData,
    updateState,
    logOperation,
    handleError,
  });

  const bulkDelete = useInventoryBulkDelete({
    updateState,
    logOperation,
    handleError,
    singleDelete,
  });

  const restore = useInventoryRestore({
    inventoryData,
    setInventoryData,
    updateState,
    logOperation,
    handleError,
  });

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
    deleteItem: singleDelete.deleteItem,
    softDeleteItem: singleDelete.softDeleteItem,
    hardDeleteItem: singleDelete.hardDeleteItem,

    // Bulk deletion
    deleteBulkItems: bulkDelete.deleteBulkItems,
    softDeleteBulkItems: bulkDelete.softDeleteBulkItems,
    hardDeleteBulkItems: bulkDelete.hardDeleteBulkItems,

    // Utility operations
    isDeleting,
    isDeleted,
    getDeleteProgress,
    restoreItem: restore.restoreItem,
    restoreBulkItems: restore.restoreBulkItems,
    clearDeletedItems,
  };
};
