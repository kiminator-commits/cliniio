import { useState, useCallback, useRef } from 'react';
import { useInventoryData } from './useInventoryData';
import { useInventoryFormValidation } from './useInventoryFormValidation';
import { useInventoryFormSubmission } from './useInventoryFormSubmission';
import { useErrorRecovery } from '../useErrorRecovery';
import { useAuditLogger } from '../../utils/auditLogger';
import { InventoryItem, InventoryFormData, InventoryFilters } from '../../types/inventory';

interface CRUDState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'create' | 'read' | 'update' | 'delete' | null;
  operationTimestamp: Date | null;
}

interface CRUDOperations {
  // Create operations
  createItem: (itemData: InventoryFormData) => Promise<InventoryItem | null>;
  createBulkItems: (itemsData: InventoryFormData[]) => Promise<InventoryItem[]>;

  // Read operations
  getItem: (id: string) => InventoryItem | null;
  getItems: (filters?: InventoryFilters) => InventoryItem[];
  getItemsByCategory: (category: string) => InventoryItem[];
  getItemsByStatus: (status: string) => InventoryItem[];

  // Update operations
  updateItem: (id: string, updates: Partial<InventoryFormData>) => Promise<InventoryItem | null>;
  updateBulkItems: (
    updates: Array<{ id: string; updates: Partial<InventoryFormData> }>
  ) => Promise<InventoryItem[]>;
  updateItemStatus: (id: string, status: string) => Promise<InventoryItem | null>;

  // Delete operations
  deleteItem: (id: string) => Promise<boolean>;
  deleteBulkItems: (ids: string[]) => Promise<boolean>;
  softDeleteItem: (id: string) => Promise<InventoryItem | null>;

  // Utility operations
  duplicateItem: (id: string) => Promise<InventoryItem | null>;
  archiveItem: (id: string) => Promise<InventoryItem | null>;
  restoreItem: (id: string) => Promise<InventoryItem | null>;
}

export const useInventoryCRUD = (): CRUDState & CRUDOperations => {
  const [state, setState] = useState<CRUDState>({
    isLoading: false,
    error: null,
    lastOperation: null,
    operationTimestamp: null,
  });

  const { inventoryData, setInventoryData } = useInventoryData();
  const { validateFormData } = useInventoryFormValidation();
  const { submitFormData } = useInventoryFormSubmission();
  const { handleError } = useErrorRecovery();
  const { logAuditEvent } = useAuditLogger();
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback((updates: Partial<CRUDState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const logOperation = useCallback(
    async (operation: string, details: Record<string, unknown>) => {
      try {
        await logAuditEvent('inventory_crud', {
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

  // Create operations
  const createItem = useCallback(
    async (itemData: InventoryFormData): Promise<InventoryItem | null> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'create' });

        // Validate form data
        const validationResult = validateFormData(itemData);
        if (!validationResult.isValid) {
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Cancel any ongoing operations
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Submit the form data
        const result = await submitFormData(itemData, abortControllerRef.current.signal);

        if (result.success && result.data) {
          const newItem = result.data as InventoryItem;

          // Update local state
          setInventoryData(prev => [...prev, newItem]);

          // Log the operation
          await logOperation('create_item', { itemId: newItem.id, itemName: newItem.name });

          updateState({
            isLoading: false,
            lastOperation: 'create',
            operationTimestamp: new Date(),
          });

          return newItem;
        } else {
          throw new Error(result.error || 'Failed to create item');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return null;
      }
    },
    [validateFormData, submitFormData, setInventoryData, logOperation, updateState, handleError]
  );

  const createBulkItems = useCallback(
    async (itemsData: InventoryFormData[]): Promise<InventoryItem[]> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'create' });

        const createdItems: InventoryItem[] = [];

        for (const itemData of itemsData) {
          const item = await createItem(itemData);
          if (item) {
            createdItems.push(item);
          }
        }

        await logOperation('create_bulk_items', {
          totalItems: itemsData.length,
          createdItems: createdItems.length,
        });

        updateState({
          isLoading: false,
          lastOperation: 'create',
          operationTimestamp: new Date(),
        });

        return createdItems;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return [];
      }
    },
    [createItem, logOperation, updateState, handleError]
  );

  // Read operations
  const getItem = useCallback(
    (id: string): InventoryItem | null => {
      return inventoryData.find(item => item.id === id) || null;
    },
    [inventoryData]
  );

  const getItems = useCallback(
    (filters?: InventoryFilters): InventoryItem[] => {
      let filteredItems = [...inventoryData];

      if (filters) {
        if (filters.category) {
          filteredItems = filteredItems.filter(item => item.category === filters.category);
        }
        if (filters.status) {
          filteredItems = filteredItems.filter(item => item.status === filters.status);
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(
            item =>
              item.name.toLowerCase().includes(searchLower) ||
              item.description?.toLowerCase().includes(searchLower) ||
              item.sku?.toLowerCase().includes(searchLower)
          );
        }
      }

      return filteredItems;
    },
    [inventoryData]
  );

  const getItemsByCategory = useCallback(
    (category: string): InventoryItem[] => {
      return inventoryData.filter(item => item.category === category);
    },
    [inventoryData]
  );

  const getItemsByStatus = useCallback(
    (status: string): InventoryItem[] => {
      return inventoryData.filter(item => item.status === status);
    },
    [inventoryData]
  );

  // Update operations
  const updateItem = useCallback(
    async (id: string, updates: Partial<InventoryFormData>): Promise<InventoryItem | null> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'update' });

        const existingItem = getItem(id);
        if (!existingItem) {
          throw new Error(`Item with id ${id} not found`);
        }

        // Validate updates if they contain form data
        if (Object.keys(updates).length > 0) {
          const validationResult = validateFormData({ ...existingItem, ...updates });
          if (!validationResult.isValid) {
            throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
          }
        }

        // Cancel any ongoing operations
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Submit the updates
        const result = await submitFormData(updates, abortControllerRef.current.signal, id);

        if (result.success && result.data) {
          const updatedItem = result.data as InventoryItem;

          // Update local state
          setInventoryData(prev => prev.map(item => (item.id === id ? updatedItem : item)));

          // Log the operation
          await logOperation('update_item', {
            itemId: id,
            updates: Object.keys(updates),
            itemName: updatedItem.name,
          });

          updateState({
            isLoading: false,
            lastOperation: 'update',
            operationTimestamp: new Date(),
          });

          return updatedItem;
        } else {
          throw new Error(result.error || 'Failed to update item');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return null;
      }
    },
    [
      getItem,
      validateFormData,
      submitFormData,
      setInventoryData,
      logOperation,
      updateState,
      handleError,
    ]
  );

  const updateBulkItems = useCallback(
    async (
      updates: Array<{ id: string; updates: Partial<InventoryFormData> }>
    ): Promise<InventoryItem[]> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'update' });

        const updatedItems: InventoryItem[] = [];

        for (const { id, updates: itemUpdates } of updates) {
          const item = await updateItem(id, itemUpdates);
          if (item) {
            updatedItems.push(item);
          }
        }

        await logOperation('update_bulk_items', {
          totalItems: updates.length,
          updatedItems: updatedItems.length,
        });

        updateState({
          isLoading: false,
          lastOperation: 'update',
          operationTimestamp: new Date(),
        });

        return updatedItems;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return [];
      }
    },
    [updateItem, logOperation, updateState, handleError]
  );

  const updateItemStatus = useCallback(
    async (id: string, status: string): Promise<InventoryItem | null> => {
      return updateItem(id, { status });
    },
    [updateItem]
  );

  // Delete operations
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'delete' });

        const existingItem = getItem(id);
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
        setInventoryData(prev => prev.filter(item => item.id !== id));

        // Log the operation
        await logOperation('delete_item', {
          itemId: id,
          itemName: existingItem.name,
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return false;
      }
    },
    [getItem, setInventoryData, logOperation, updateState, handleError]
  );

  const deleteBulkItems = useCallback(
    async (ids: string[]): Promise<boolean> => {
      try {
        updateState({ isLoading: true, error: null, lastOperation: 'delete' });

        let successCount = 0;

        for (const id of ids) {
          const success = await deleteItem(id);
          if (success) {
            successCount++;
          }
        }

        await logOperation('delete_bulk_items', {
          totalItems: ids.length,
          deletedItems: successCount,
        });

        updateState({
          isLoading: false,
          lastOperation: 'delete',
          operationTimestamp: new Date(),
        });

        return successCount === ids.length;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(error);
        return false;
      }
    },
    [deleteItem, logOperation, updateState, handleError]
  );

  const softDeleteItem = useCallback(
    async (id: string): Promise<InventoryItem | null> => {
      return updateItem(id, { status: 'deleted', deletedAt: new Date().toISOString() });
    },
    [updateItem]
  );

  // Utility operations
  const duplicateItem = useCallback(
    async (id: string): Promise<InventoryItem | null> => {
      const existingItem = getItem(id);
      if (!existingItem) {
        return null;
      }

      const { ...itemData } = existingItem;
      const duplicatedData: InventoryFormData = {
        ...itemData,
        name: `${itemData.name} (Copy)`,
        sku: itemData.sku ? `${itemData.sku}-COPY` : undefined,
      };

      return createItem(duplicatedData);
    },
    [getItem, createItem]
  );

  const archiveItem = useCallback(
    async (id: string): Promise<InventoryItem | null> => {
      return updateItem(id, { status: 'archived', archivedAt: new Date().toISOString() });
    },
    [updateItem]
  );

  const restoreItem = useCallback(
    async (id: string): Promise<InventoryItem | null> => {
      return updateItem(id, {
        status: 'active',
        deletedAt: undefined,
        archivedAt: undefined,
      });
    },
    [updateItem]
  );

  return {
    // State
    ...state,

    // Create operations
    createItem,
    createBulkItems,

    // Read operations
    getItem,
    getItems,
    getItemsByCategory,
    getItemsByStatus,

    // Update operations
    updateItem,
    updateBulkItems,
    updateItemStatus,

    // Delete operations
    deleteItem,
    deleteBulkItems,
    softDeleteItem,

    // Utility operations
    duplicateItem,
    archiveItem,
    restoreItem,
  };
};
