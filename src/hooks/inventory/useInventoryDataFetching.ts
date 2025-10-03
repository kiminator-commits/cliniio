import { useState, useCallback, useRef } from 'react';
import { InventoryDataResponse } from '../../types/inventory';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { auditLogger } from '@/utils/auditLogger';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { useInventoryStore } from '@/store/useInventoryStore';

export interface DataFetchingState {
  data: InventoryDataResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  operationInProgress: {
    type: 'fetch' | null;
  };
}

export interface DataFetchingOperations {
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetError: () => void;
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

/**
 * Hook for inventory data fetching operations
 * Handles data fetching, refreshing, and error recovery
 */
export const useInventoryDataFetching = (): DataFetchingState &
  DataFetchingOperations => {
  const [state, setState] = useState<DataFetchingState>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    operationInProgress: { type: null },
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastOperationRef = useRef<{
    type: 'fetch';
    data?: InventoryDataResponse;
  } | null>(null);

  const { setInventoryLoading } = useInventoryStore();
  const { handleError, resetError: clearRecoveryError } = useErrorRecovery();

  const setLoading = useCallback(
    (loading: boolean) => {
      setState((prev) => ({ ...prev, isLoading: loading }));
      setInventoryLoading(loading);
    },
    [setInventoryLoading]
  );

  const setOperationInProgress = useCallback(
    (operation: DataFetchingState['operationInProgress']) => {
      setState((prev) => ({ ...prev, operationInProgress: operation }));
    },
    []
  );

  const setError = useCallback(
    (error: string | null) => {
      setState((prev) => ({ ...prev, error }));
      if (error) {
        handleError(error);
      }
    },
    [handleError]
  );

  // Core data fetching
  const fetchData = useCallback(async () => {
    // Cancel any ongoing request to prevent race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current?.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Update UI state to show loading and clear any previous errors
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      operationInProgress: { type: 'fetch' },
    }));
    setInventoryLoading(true);

    try {
      // Fetch all inventory data from the service facade
      const response = await inventoryServiceFacade.fetchAllInventoryData();

      // Check if request was cancelled before processing response
      if (abortControllerRef.current?.signal.aborted) {
        return; // Request was cancelled
      }

      // Update state with successful response data
      setState((prev) => ({
        ...prev,
        data: response as unknown as InventoryDataResponse,
        error: response.error as string | null,
        lastUpdated: new Date(),
        isLoading: false,
        operationInProgress: { type: null },
      }));
      setInventoryLoading(false);

      // Store last operation for retry functionality
      lastOperationRef.current = {
        type: 'fetch',
        data: response as unknown as InventoryDataResponse,
      };

      // Log successful fetch with item counts for analytics
      auditLogger.log('inventory', 'data_fetched', {
        itemCount:
          ((response as { tools?: unknown[] }).tools?.length ?? 0) +
          ((response as { supplies?: unknown[] }).supplies?.length ?? 0) +
          ((response as { equipment?: unknown[] }).equipment?.length ?? 0) +
          ((response as { officeHardware?: unknown[] }).officeHardware
            ?.length ?? 0),
        categories:
          (response as { categories?: string[] }).categories?.length ?? 0,
      });
    } catch (error) {
      // Check if request was cancelled before handling error
      if (abortControllerRef.current?.signal.aborted) {
        return; // Request was cancelled
      }

      // Extract error message and update state
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch inventory data';
      setError(errorMessage);
      setLoading(false);
      setOperationInProgress({ type: null });

      // Log error for debugging and monitoring
      auditLogger.log('inventory', 'data_fetch_error', { error: errorMessage });
    }
  }, [setInventoryLoading, setError, setLoading, setOperationInProgress]);

  // Refresh data (background refresh)
  const refreshData = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isRefreshing: true,
      error: null,
    }));

    try {
      const response = await inventoryServiceFacade.fetchAllInventoryData();

      setState((prev) => ({
        ...prev,
        data: response as unknown as InventoryDataResponse,
        error: response.error as string | null,
        lastUpdated: new Date(),
        isRefreshing: false,
      }));

      // Store last operation for retry
      lastOperationRef.current = {
        type: 'fetch',
        data: response as unknown as InventoryDataResponse,
      };

      // Log successful refresh
      auditLogger.log('inventory', 'data_refreshed', {
        itemCount:
          ((response as { tools?: unknown[] }).tools?.length ?? 0) +
          ((response as { supplies?: unknown[] }).supplies?.length ?? 0) +
          ((response as { equipment?: unknown[] }).equipment?.length ?? 0) +
          ((response as { officeHardware?: unknown[] }).officeHardware
            ?.length ?? 0),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to refresh inventory data';
      setError(errorMessage);
      setState((prev) => ({ ...prev, isRefreshing: false }));

      // Log error
      auditLogger.log('inventory', 'data_refresh_error', {
        error: errorMessage,
      });
    }
  }, [setError]);

  // Error handling
  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
    clearRecoveryError();
  }, [clearRecoveryError]);

  const clearError = useCallback(() => {
    resetError();
  }, [resetError]);

  // Retry last operation
  const retryLastOperation = useCallback(async () => {
    if (lastOperationRef.current?.type === 'fetch') {
      await fetchData();
    }
  }, [fetchData]);

  return {
    // State
    ...state,

    // Operations
    fetchData,
    refreshData,
    resetError,
    clearError,
    retryLastOperation,
  };
};
