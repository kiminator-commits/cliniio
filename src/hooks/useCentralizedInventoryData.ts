import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  inventoryDataService,
  InventoryDataResponse,
  FilterOptions,
} from '@/services/inventoryDataService';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { useInventoryStore } from '@/store/useInventoryStore';

export interface UseCentralizedInventoryDataReturn {
  // Data state
  data: InventoryDataResponse | null;
  isLoading: boolean;
  error: string | null;

  // Raw data access methods
  getTools: () => LocalInventoryItem[];
  getSupplies: () => LocalInventoryItem[];
  getEquipment: () => LocalInventoryItem[];
  getOfficeHardware: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Filtered data methods (compatible with existing useFilteredInventoryData)
  getFilteredData: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredSuppliesData: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredEquipmentData: (searchQuery: string, filters?: FilterOptions) => LocalInventoryItem[];
  getFilteredOfficeHardwareData: (
    searchQuery: string,
    filters?: FilterOptions
  ) => LocalInventoryItem[];

  // Data management
  refreshData: () => Promise<void>;
  clearError: () => void;

  // Legacy compatibility - direct data access (for gradual migration)
  inventoryData: LocalInventoryItem[];
  suppliesData: LocalInventoryItem[];
  equipmentData: LocalInventoryItem[];
  officeHardwareData: LocalInventoryItem[];
}

/**
 * Centralized hook for inventory data management
 * Uses the existing service layer and provides compatibility with current patterns
 */
export const useCentralizedInventoryData = (): UseCentralizedInventoryDataReturn => {
  const [data, setData] = useState<InventoryDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setInventoryLoading } = useInventoryStore();

  // Fetch all inventory data using the service layer
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Raw data access methods
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

  // Filtered data methods (compatible with existing useFilteredInventoryData)
  const getFilteredData = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const tools = getTools();
      return inventoryDataService.getFilteredData(tools, searchQuery, filters);
    },
    [getTools]
  );

  const getFilteredSuppliesData = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const supplies = getSupplies();
      return inventoryDataService.getFilteredData(supplies, searchQuery, filters);
    },
    [getSupplies]
  );

  const getFilteredEquipmentData = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const equipment = getEquipment();
      return inventoryDataService.getFilteredData(equipment, searchQuery, filters);
    },
    [getEquipment]
  );

  const getFilteredOfficeHardwareData = useCallback(
    (searchQuery: string, filters?: FilterOptions) => {
      const officeHardware = getOfficeHardware();
      return inventoryDataService.getFilteredData(officeHardware, searchQuery, filters);
    },
    [getOfficeHardware]
  );

  // Data management
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Legacy compatibility - direct data access (for gradual migration)
  const inventoryData = useMemo(() => getTools(), [getTools]);
  const suppliesData = useMemo(() => getSupplies(), [getSupplies]);
  const equipmentData = useMemo(() => getEquipment(), [getEquipment]);
  const officeHardwareData = useMemo(() => getOfficeHardware(), [getOfficeHardware]);

  return {
    // Data state
    data,
    isLoading,
    error,

    // Raw data access methods
    getTools,
    getSupplies,
    getEquipment,
    getOfficeHardware,
    getCategories,

    // Filtered data methods
    getFilteredData,
    getFilteredSuppliesData,
    getFilteredEquipmentData,
    getFilteredOfficeHardwareData,

    // Data management
    refreshData,
    clearError,

    // Legacy compatibility
    inventoryData,
    suppliesData,
    equipmentData,
    officeHardwareData,
  };
};
