import { useState, useEffect, useCallback } from 'react';
import {
  inventoryDataService,
  InventoryDataResponse,
  FilterOptions,
} from '@/services/inventoryDataService';
import { InventoryItem, LocalInventoryItem } from '@/types/inventoryTypes';
import { useInventoryStore } from '@/store/useInventoryStore';

export interface UseInventoryDataManagerReturn {
  // Data state
  data: InventoryDataResponse | null;
  isLoading: boolean;
  error: string | null;

  // Data access methods
  getTools: () => LocalInventoryItem[];
  getSupplies: () => LocalInventoryItem[];
  getEquipment: () => LocalInventoryItem[];
  getOfficeHardware: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Filtered data methods
  getFilteredTools: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredSupplies: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredEquipment: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredOfficeHardware: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];

  // CRUD operations
  addItem: (item: InventoryItem) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  // Data management
  refreshData: () => Promise<void>;
  clearError: () => void;

  // Modal data transformation
  getModalData: () => Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;
}

export const useInventoryDataManager = (): UseInventoryDataManagerReturn => {
  const [data, setData] = useState<InventoryDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setInventoryLoading } = useInventoryStore();

  // Fetch all inventory data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInventoryLoading(true);

    try {
      const response = await inventoryDataService.fetchAllInventoryData();
      setData(response);
      setError(response.error);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setInventoryLoading(false);
    }
  }, [setInventoryLoading]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Data access methods
  const getTools = useCallback(() => {
    return data?.tools || [];
  }, [data]);

  const getSupplies = useCallback(() => {
    return data?.supplies || [];
  }, [data]);

  const getEquipment = useCallback(() => {
    return data?.equipment || [];
  }, [data]);

  const getOfficeHardware = useCallback(() => {
    return data?.officeHardware || [];
  }, [data]);

  const getCategories = useCallback(() => {
    return data?.categories || [];
  }, [data]);

  // Filtered data methods
  const getFilteredTools = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const tools = getTools();
      return inventoryDataService.getFilteredData(tools, searchQuery, filters);
    },
    [getTools]
  );

  const getFilteredSupplies = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const supplies = getSupplies();
      return inventoryDataService.getFilteredData(supplies, searchQuery, filters);
    },
    [getSupplies]
  );

  const getFilteredEquipment = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const equipment = getEquipment();
      return inventoryDataService.getFilteredData(equipment, searchQuery, filters);
    },
    [getEquipment]
  );

  const getFilteredOfficeHardware = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const officeHardware = getOfficeHardware();
      return inventoryDataService.getFilteredData(officeHardware, searchQuery, filters);
    },
    [getOfficeHardware]
  );

  // CRUD operations
  const addItem = useCallback(
    async (item: InventoryItem) => {
      try {
        await inventoryDataService.addInventoryItem(item);
        await fetchData(); // Refresh data after adding
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add inventory item';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const updateItem = useCallback(
    async (id: string, item: Partial<InventoryItem>) => {
      try {
        await inventoryDataService.updateInventoryItem(id, item);
        await fetchData(); // Refresh data after updating
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory item';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await inventoryDataService.deleteInventoryItem(id);
        await fetchData(); // Refresh data after deleting
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory item';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const addCategory = useCallback(
    async (category: string) => {
      try {
        await inventoryDataService.addCategory(category);
        await fetchData(); // Refresh data after adding category
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add category';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  const deleteCategory = useCallback(
    async (category: string) => {
      try {
        await inventoryDataService.deleteCategory(category);
        await fetchData(); // Refresh data after deleting category
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
        setError(errorMessage);
        throw err;
      }
    },
    [fetchData]
  );

  // Data management
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Modal data transformation
  const getModalData = useCallback(() => {
    const tools = getTools();
    return inventoryDataService.transformDataForModal(tools);
  }, [getTools]);

  return {
    // Data state
    data,
    isLoading,
    error,

    // Data access methods
    getTools,
    getSupplies,
    getEquipment,
    getOfficeHardware,
    getCategories,

    // Filtered data methods
    getFilteredTools,
    getFilteredSupplies,
    getFilteredEquipment,
    getFilteredOfficeHardware,

    // CRUD operations
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    deleteCategory,

    // Data management
    refreshData,
    clearError,

    // Modal data transformation
    getModalData,
  };
};
