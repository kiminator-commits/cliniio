import { useState, useCallback, useRef } from 'react';
import { useInventoryFormValidation } from './useInventoryFormValidation';
import { useInventoryFormSubmission } from './useInventoryFormSubmission';
import { useErrorRecovery } from '../useErrorRecovery';
import { useAuditLogger } from '../../utils/auditLogger';
import { InventoryItem, InventoryFormData } from '../../types/inventory';

interface CreateState {
  isLoading: boolean;
  error: string | null;
  lastCreatedItem: InventoryItem | null;
  operationTimestamp: Date | null;
}

export const useInventoryCreate = () => {
  const [state, setState] = useState<CreateState>({
    isLoading: false,
    error: null,
    lastCreatedItem: null,
    operationTimestamp: null,
  });

  const setInventoryData = useCallback(
    (updater: (prev: InventoryItem[]) => InventoryItem[]) => {
      // This is a simplified implementation - in a real app, you'd update the store
      // For now, just call the updater function but don't store the result
      updater([]);
    },
    []
  );
  const { validateForm } = useInventoryFormValidation();
  const { submitForm } = useInventoryFormSubmission();
  const { handleError } = useErrorRecovery();
  const { logAuditEvent } = useAuditLogger();
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback((updates: Partial<CreateState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const logOperation = useCallback(
    async (operation: string, details: Record<string, unknown>) => {
      try {
        await logAuditEvent('inventory_create', {
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

  // Create single item
  const createItem = useCallback(
    async (itemData: InventoryFormData): Promise<InventoryItem | null> => {
      try {
        updateState({ isLoading: true, error: null });

        // Validate form data
        const isValid = await validateForm(itemData);
        if (!isValid) {
          throw new Error('Validation failed');
        }

        // Cancel any ongoing operations
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        // Submit the form data
        const success = await submitForm(itemData);

        if (success) {
          const newItem = itemData as unknown as InventoryItem;

          // Update local state
          setInventoryData((prev: InventoryItem[]) => [...prev, newItem]);

          // Log the operation
          await logOperation('create_item', {
            itemId: newItem.id,
            itemName: newItem.name,
          });

          updateState({
            isLoading: false,
            lastCreatedItem: newItem,
            operationTimestamp: new Date(),
          });

          return newItem;
        } else {
          throw new Error('Failed to create item');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(errorMessage);
        return null;
      }
    },
    [
      validateForm,
      submitForm,
      setInventoryData,
      logOperation,
      updateState,
      handleError,
    ]
  );

  // Create multiple items
  const createBulkItems = useCallback(
    async (itemsData: InventoryFormData[]): Promise<InventoryItem[]> => {
      try {
        updateState({ isLoading: true, error: null });

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
          operationTimestamp: new Date(),
        });

        return createdItems;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        updateState({ isLoading: false, error: errorMessage });
        handleError(errorMessage);
        return [];
      }
    },
    [createItem, logOperation, updateState, handleError]
  );

  // Reset state
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastCreatedItem: null,
      operationTimestamp: null,
    });
  }, []);

  return {
    // State
    ...state,

    // Operations
    createItem,
    createBulkItems,
    resetState,
  };
};
