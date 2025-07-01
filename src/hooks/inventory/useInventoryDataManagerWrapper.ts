import { useMemo } from 'react';
import { useInventoryDataManager } from './useInventoryDataManager';
import { FilterOptions } from '@/services/inventoryDataService';

/**
 * Wrapper hook that provides backward compatibility with existing inventory data patterns
 *
 * This hook maintains the existing API signatures while using the new centralized
 * data manager underneath, allowing for gradual migration of components.
 */
export const useInventoryDataManagerWrapper = () => {
  const dataManager = useInventoryDataManager();

  // Backward compatibility with existing useInventoryDataManager
  const backwardCompatible = useMemo(
    () => ({
      // Data state (matching existing patterns)
      data: dataManager.data,
      isLoading: dataManager.isLoading,
      error: dataManager.error,

      // Data access methods (matching existing patterns)
      getTools: () => dataManager.inventoryData,
      getSupplies: () => dataManager.suppliesData,
      getEquipment: () => dataManager.equipmentData,
      getOfficeHardware: () => dataManager.officeHardwareData,
      getCategories: dataManager.getCategories,

      // Filtered data methods (matching existing patterns)
      getFilteredTools: (searchQuery: string, filters?: FilterOptions) =>
        dataManager
          .getFilteredItems(searchQuery, filters)
          .filter(item => dataManager.inventoryData.some(tool => tool.id === item.id)),
      getFilteredSupplies: (searchQuery: string, filters?: FilterOptions) =>
        dataManager
          .getFilteredItems(searchQuery, filters)
          .filter(item => dataManager.suppliesData.some(supply => supply.id === item.id)),
      getFilteredEquipment: (searchQuery: string, filters?: FilterOptions) =>
        dataManager
          .getFilteredItems(searchQuery, filters)
          .filter(item => dataManager.equipmentData.some(equipment => equipment.id === item.id)),
      getFilteredOfficeHardware: (searchQuery: string, filters?: FilterOptions) =>
        dataManager
          .getFilteredItems(searchQuery, filters)
          .filter(item => dataManager.officeHardwareData.some(hardware => hardware.id === item.id)),

      // CRUD operations (matching existing patterns)
      addItem: dataManager.createItem,
      updateItem: dataManager.updateItem,
      deleteItem: dataManager.deleteItem,
      addCategory: dataManager.addCategory,
      deleteCategory: dataManager.deleteCategory,

      // Data management (matching existing patterns)
      refreshData: dataManager.refreshData,
      clearError: dataManager.clearError,

      // Modal data transformation (matching existing patterns)
      getModalData: () => {
        const tools = dataManager.getTools();
        return tools.map(item => ({
          id: item.id || item.barcode || item.item,
          name: item.item,
          barcode: item.barcode || '',
          currentPhase: item.currentPhase || item.status || 'Unknown',
          category: item.category,
        }));
      },
    }),
    [dataManager]
  );

  // Backward compatibility with useCentralizedInventoryData
  const centralizedCompatible = useMemo(
    () => ({
      // Data state
      data: dataManager.data,
      isLoading: dataManager.isLoading,
      error: dataManager.error,

      // Raw data access methods
      getTools: dataManager.getTools,
      getSupplies: dataManager.getSupplies,
      getEquipment: dataManager.getEquipment,
      getOfficeHardware: dataManager.getOfficeHardware,
      getCategories: dataManager.getCategories,

      // Filtered data methods (compatible with existing useFilteredInventoryData)
      getFilteredData: dataManager.getFilteredTools,
      getFilteredSuppliesData: dataManager.getFilteredSupplies,
      getFilteredEquipmentData: dataManager.getFilteredEquipment,
      getFilteredOfficeHardwareData: dataManager.getFilteredOfficeHardware,

      // Data management
      refreshData: dataManager.refreshData,
      clearError: dataManager.clearError,

      // Legacy compatibility - direct data access
      inventoryData: dataManager.inventoryData,
      suppliesData: dataManager.suppliesData,
      equipmentData: dataManager.equipmentData,
      officeHardwareData: dataManager.officeHardwareData,
    }),
    [dataManager]
  );

  // Backward compatibility with useInventoryData
  const simpleCompatible = useMemo(
    () => ({
      tools: dataManager.inventoryData,
      supplies: dataManager.suppliesData,
      equipment: dataManager.equipmentData,
      officeHardware: dataManager.officeHardwareData,
    }),
    [dataManager]
  );

  return {
    // New centralized API
    ...dataManager,

    // Backward compatibility APIs
    backwardCompatible,
    centralizedCompatible,
    simpleCompatible,
  };
};

/**
 * Hook for components that need the original useInventoryDataManager API
 */
export const useInventoryDataManagerLegacy = () => {
  const { backwardCompatible } = useInventoryDataManagerWrapper();
  return backwardCompatible;
};

/**
 * Hook for components that need the useCentralizedInventoryData API
 */
export const useCentralizedInventoryDataLegacy = () => {
  const { centralizedCompatible } = useInventoryDataManagerWrapper();
  return centralizedCompatible;
};

/**
 * Hook for components that need the simple useInventoryData API
 */
export const useInventoryDataLegacy = () => {
  const { simpleCompatible } = useInventoryDataManagerWrapper();
  return simpleCompatible;
};
