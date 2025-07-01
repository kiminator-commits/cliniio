import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { InventoryItem, LocalInventoryItem } from '@/types/inventoryTypes';
import {
  inventoryDataService,
  InventoryDataResponse,
  FilterOptions,
} from '@/services/inventoryDataService';
import { auditLogger } from '@/utils/auditLogger';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

// Types for the hook
export interface DataManagerState {
  data: InventoryDataResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  operationInProgress: {
    type: 'create' | 'update' | 'delete' | 'fetch' | null;
    itemId?: string;
  };
}

export interface DataManagerOperations {
  // Data fetching
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // CRUD operations
  createItem: (item: InventoryItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Category management
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  // Data access
  getItemsByCategory: (category: string) => LocalInventoryItem[];
  getFilteredItems: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getAllItems: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Data transformations
  getAnalyticsData: () => {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    categories: string[];
  };

  // Error handling
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
}

export interface UseInventoryDataManagerReturn extends DataManagerState, DataManagerOperations {
  // Legacy compatibility
  inventoryData: LocalInventoryItem[];
  suppliesData: LocalInventoryItem[];
  equipmentData: LocalInventoryItem[];
  officeHardwareData: LocalInventoryItem[];
}

/**
 * Centralized data management hook for inventory operations
 *
 * This hook serves as the single source of truth for all inventory data operations,
 * providing a consistent API for data fetching, CRUD operations, loading states,
 * error handling, and data transformations.
 */
export const useInventoryDataManager = (): UseInventoryDataManagerReturn => {
  // Core state
  const [state, setState] = useState<DataManagerState>({
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    operationInProgress: { type: null },
  });

  // Refs for tracking operations
  const lastOperationRef = useRef<{
    type: 'create' | 'update' | 'delete' | 'fetch';
    itemId?: string;
    data?: InventoryItem | Partial<InventoryItem>;
  } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // External dependencies
  const { setInventoryLoading } = useInventoryStore();
  const { handleError, clearError: clearRecoveryError } = useErrorRecovery();

  // State setters
  const setLoading = useCallback(
    (loading: boolean) => {
      setState(prev => ({ ...prev, isLoading: loading }));
      setInventoryLoading(loading);
    },
    [setInventoryLoading]
  );

  const setOperationInProgress = useCallback(
    (operation: DataManagerState['operationInProgress']) => {
      setState(prev => ({ ...prev, operationInProgress: operation }));
    },
    []
  );

  const setError = useCallback(
    (error: string | null) => {
      setState(prev => ({ ...prev, error }));
      if (error) {
        handleError(error);
      }
    },
    [handleError]
  );

  // Core data fetching
  const fetchData = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      operationInProgress: { type: 'fetch' },
    }));
    setInventoryLoading(true);

    try {
      const response = await inventoryDataService.fetchAllInventoryData();

      if (abortControllerRef.current.signal.aborted) {
        return; // Request was cancelled
      }

      setState(prev => ({
        ...prev,
        data: response,
        error: response.error,
        lastUpdated: new Date(),
        isLoading: false,
        operationInProgress: { type: null },
      }));
      setInventoryLoading(false);

      // Log successful fetch
      auditLogger.log('inventory', 'data_fetched', {
        itemCount:
          (response.tools?.length || 0) +
          (response.supplies?.length || 0) +
          (response.equipment?.length || 0) +
          (response.officeHardware?.length || 0),
        categories: response.categories?.length || 0,
      });
    } catch (error) {
      if (abortControllerRef.current.signal.aborted) {
        return; // Request was cancelled
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch inventory data';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        operationInProgress: { type: null },
      }));
      setInventoryLoading(false);
      handleError(errorMessage);

      // Log error
      auditLogger.log('inventory', 'data_fetch_error', { error: errorMessage });
    }
  }, [setInventoryLoading, handleError]);

  // Refresh data (background refresh)
  const refreshData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isRefreshing: true,
      error: null,
    }));

    try {
      const response = await inventoryDataService.fetchAllInventoryData();

      setState(prev => ({
        ...prev,
        data: response,
        error: response.error,
        lastUpdated: new Date(),
        isRefreshing: false,
      }));

      auditLogger.log('inventory', 'data_refreshed', {
        itemCount:
          (response.tools?.length || 0) +
          (response.supplies?.length || 0) +
          (response.equipment?.length || 0) +
          (response.officeHardware?.length || 0),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh inventory data';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRefreshing: false,
      }));
      handleError(errorMessage);

      auditLogger.log('inventory', 'data_refresh_error', { error: errorMessage });
    }
  }, [handleError]);

  // CRUD Operations
  const createItem = useCallback(
    async (item: InventoryItem) => {
      setState(prev => ({
        ...prev,
        operationInProgress: { type: 'create' },
      }));
      lastOperationRef.current = { type: 'create', data: item };

      try {
        await inventoryDataService.addInventoryItem(item);
        await fetchData(); // Refresh data after creation

        auditLogger.log('inventory', 'item_created', { itemId: item.id, category: item.category });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
        setState(prev => ({ ...prev, error: errorMessage, operationInProgress: { type: null } }));
        handleError(errorMessage);
        throw error;
      }
    },
    [fetchData, handleError]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<InventoryItem>) => {
      setState(prev => ({
        ...prev,
        operationInProgress: { type: 'update', itemId: id },
      }));
      lastOperationRef.current = { type: 'update', itemId: id, data: updates };

      try {
        await inventoryDataService.updateInventoryItem(id, updates);
        await fetchData(); // Refresh data after update

        auditLogger.log('inventory', 'item_updated', { itemId: id, updates });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
        setState(prev => ({ ...prev, error: errorMessage, operationInProgress: { type: null } }));
        handleError(errorMessage);
        throw error;
      }
    },
    [fetchData, handleError]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setState(prev => ({
        ...prev,
        operationInProgress: { type: 'delete', itemId: id },
      }));
      lastOperationRef.current = { type: 'delete', itemId: id };

      try {
        await inventoryDataService.deleteInventoryItem(id);
        await fetchData(); // Refresh data after deletion

        auditLogger.log('inventory', 'item_deleted', { itemId: id });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
        setState(prev => ({ ...prev, error: errorMessage, operationInProgress: { type: null } }));
        handleError(errorMessage);
        throw error;
      }
    },
    [fetchData, handleError]
  );

  // Category management
  const addCategory = useCallback(
    async (category: string) => {
      try {
        await inventoryDataService.addCategory(category);
        await fetchData(); // Refresh data after adding category

        auditLogger.log('inventory', 'category_added', { category });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add category';
        setState(prev => ({ ...prev, error: errorMessage }));
        handleError(errorMessage);
        throw error;
      }
    },
    [fetchData, handleError]
  );

  const deleteCategory = useCallback(
    async (category: string) => {
      try {
        await inventoryDataService.deleteCategory(category);
        await fetchData(); // Refresh data after deleting category

        auditLogger.log('inventory', 'category_deleted', { category });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
        setState(prev => ({ ...prev, error: errorMessage }));
        handleError(errorMessage);
        throw error;
      }
    },
    [fetchData, handleError]
  );

  // Data access methods
  const getAllItems = useCallback((): LocalInventoryItem[] => {
    if (!state.data) return [];

    return [
      ...(state.data.tools || []),
      ...(state.data.supplies || []),
      ...(state.data.equipment || []),
      ...(state.data.officeHardware || []),
    ];
  }, [state.data]);

  const getItemsByCategory = useCallback(
    (category: string): LocalInventoryItem[] => {
      return getAllItems().filter(item => item.category === category);
    },
    [getAllItems]
  );

  const getFilteredItems = useCallback(
    (searchQuery: string, filters?: FilterOptions): LocalInventoryItem[] => {
      const allItems = getAllItems();
      return inventoryDataService.getFilteredData(allItems, searchQuery, filters);
    },
    [getAllItems]
  );

  const getCategories = useCallback((): string[] => {
    return state.data?.categories || [];
  }, [state.data]);

  // Data transformations
  const getAnalyticsData = useCallback(() => {
    const allItems = getAllItems();

    const totalItems = allItems.length;
    const totalValue = allItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    const lowStockItems = allItems.filter(
      item => (item.quantity || 0) <= 10 && (item.quantity || 0) > 0
    ).length;
    const outOfStockItems = allItems.filter(item => (item.quantity || 0) === 0).length;
    const categories = getCategories();

    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      categories,
    };
  }, [getAllItems, getCategories]);

  // Error handling
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    clearRecoveryError();
  }, [clearRecoveryError]);

  const retryLastOperation = useCallback(async () => {
    if (!lastOperationRef.current) return;

    const { type, itemId, data } = lastOperationRef.current;

    try {
      switch (type) {
        case 'create':
          if (data) await createItem(data);
          break;
        case 'update':
          if (itemId && data) await updateItem(itemId, data);
          break;
        case 'delete':
          if (itemId) await deleteItem(itemId);
          break;
        case 'fetch':
          await fetchData();
          break;
      }
    } catch (error) {
      // Error will be handled by the individual operations
    }
  }, [createItem, updateItem, deleteItem, fetchData]);

  // Initial data fetch
  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setOperationInProgress({ type: 'fetch' });

    const loadData = async () => {
      try {
        const response = await inventoryDataService.fetchAllInventoryData();

        if (abortControllerRef.current.signal.aborted) {
          return; // Request was cancelled
        }

        setState(prev => ({
          ...prev,
          data: response,
          error: response.error,
          lastUpdated: new Date(),
          isLoading: false,
          operationInProgress: { type: null },
        }));
        setLoading(false);

        // Log successful fetch
        auditLogger.log('inventory', 'data_fetched', {
          itemCount:
            (response.tools?.length || 0) +
            (response.supplies?.length || 0) +
            (response.equipment?.length || 0) +
            (response.officeHardware?.length || 0),
          categories: response.categories?.length || 0,
        });
      } catch (error) {
        if (abortControllerRef.current.signal.aborted) {
          return; // Request was cancelled
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch inventory data';
        setError(errorMessage);
        setLoading(false);
        setOperationInProgress({ type: null });

        // Log error
        auditLogger.log('inventory', 'data_fetch_error', { error: errorMessage });
      }
    };

    loadData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Legacy compatibility - direct data access
  const inventoryData = useMemo(() => state.data?.tools || [], [state.data]);
  const suppliesData = useMemo(() => state.data?.supplies || [], [state.data]);
  const equipmentData = useMemo(() => state.data?.equipment || [], [state.data]);
  const officeHardwareData = useMemo(() => state.data?.officeHardware || [], [state.data]);

  return {
    // State
    ...state,

    // Operations
    fetchData,
    refreshData,
    createItem,
    updateItem,
    deleteItem,
    addCategory,
    deleteCategory,
    getItemsByCategory,
    getFilteredItems,
    getAllItems,
    getCategories,
    getAnalyticsData,
    clearError,
    retryLastOperation,

    // Legacy compatibility
    inventoryData,
    suppliesData,
    equipmentData,
    officeHardwareData,
  };
};
