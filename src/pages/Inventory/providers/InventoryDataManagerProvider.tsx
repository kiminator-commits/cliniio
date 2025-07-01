import React, { createContext, useContext, ReactNode } from 'react';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { UseInventoryDataManagerReturn } from '@/hooks/inventory/useInventoryDataManager';

// Create the context
const InventoryDataManagerContext = createContext<UseInventoryDataManagerReturn | null>(null);

// Provider component
interface InventoryDataManagerProviderProps {
  children: ReactNode;
}

/**
 * Provider that provides the centralized inventory data manager to the component tree
 *
 * This provider wraps the useInventoryDataManager hook and makes it available
 * through React Context, allowing any component in the inventory system to access
 * the centralized data management functionality.
 */
export const InventoryDataManagerProvider: React.FC<InventoryDataManagerProviderProps> = ({
  children,
}) => {
  const dataManager = useInventoryDataManager();

  return (
    <InventoryDataManagerContext.Provider value={dataManager}>
      {children}
    </InventoryDataManagerContext.Provider>
  );
};

// Hook to use the data manager context
export const useInventoryDataManagerContext = (): UseInventoryDataManagerReturn => {
  const context = useContext(InventoryDataManagerContext);

  if (!context) {
    throw new Error(
      'useInventoryDataManagerContext must be used within an InventoryDataManagerProvider'
    );
  }

  return context;
};

// Hook for components that only need data access
export const useInventoryDataManagerData = () => {
  const context = useInventoryDataManagerContext();

  return {
    data: context.data,
    isLoading: context.isLoading,
    isRefreshing: context.isRefreshing,
    error: context.error,
    lastUpdated: context.lastUpdated,
    operationInProgress: context.operationInProgress,
  };
};

// Hook for components that only need CRUD operations
export const useInventoryDataManagerOperations = () => {
  const context = useInventoryDataManagerContext();

  return {
    fetchData: context.fetchData,
    refreshData: context.refreshData,
    createItem: context.createItem,
    updateItem: context.updateItem,
    deleteItem: context.deleteItem,
    addCategory: context.addCategory,
    deleteCategory: context.deleteCategory,
    clearError: context.clearError,
    retryLastOperation: context.retryLastOperation,
  };
};

// Hook for components that only need data access methods
export const useInventoryDataManagerAccess = () => {
  const context = useInventoryDataManagerContext();

  return {
    getItemsByCategory: context.getItemsByCategory,
    getFilteredItems: context.getFilteredItems,
    getAllItems: context.getAllItems,
    getCategories: context.getCategories,
    getAnalyticsData: context.getAnalyticsData,
  };
};

// Hook for components that need legacy compatibility
export const useInventoryDataManagerLegacy = () => {
  const context = useInventoryDataManagerContext();

  return {
    // Legacy compatibility
    inventoryData: context.inventoryData,
    suppliesData: context.suppliesData,
    equipmentData: context.equipmentData,
    officeHardwareData: context.officeHardwareData,
  };
};
