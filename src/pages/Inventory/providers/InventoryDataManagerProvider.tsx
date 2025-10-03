import React, { createContext, useContext, ReactNode } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryFormData } from '@/types/inventory';
import { useInventoryDataFetching } from '@/hooks/inventory/useInventoryDataFetching';
import { useInventoryCategoryManagement } from '@/hooks/inventory/useInventoryCategoryManagement';
import { useInventoryDataAccess } from '@/hooks/inventory/useInventoryDataAccess';
import { useInventoryCreate } from '@/hooks/inventory/useInventoryCreate';
import { useInventoryUpdate } from '@/hooks/inventory/useInventoryUpdate';
import { useInventoryDelete } from '@/hooks/inventory/useInventoryDelete';
import { useInventoryMetrics } from '@/hooks/inventory/useInventoryMetrics';
import { useInventoryErrorHandling } from '@/hooks/inventory/useInventoryErrorHandling';

// Create a combined interface that matches the old UseInventoryDataManagerReturn
interface CombinedInventoryDataManagerReturn {
  // Data fetching
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // CRUD operations
  createItem: (item: InventoryFormData) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Category management
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  // Data access
  getItemsByCategory: (category: string) => InventoryItem[];
  getFilteredItems: (
    searchQuery: string,
    filters?: Record<string, unknown>
  ) => Promise<InventoryItem[]>;
  getAllItems: () => InventoryItem[];
  getCategories: () => string[];

  // Analytics
  getAnalyticsData: () => Record<string, unknown>;

  // Error handling
  resetError: () => void;
  retryLastOperation: () => Promise<void>;

  // State
  data: Record<string, unknown>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  operationInProgress: { type: string; itemId?: string };

  // Legacy compatibility
  inventoryData: InventoryItem[];
  suppliesData: InventoryItem[];
  equipmentData: InventoryItem[];
  officeHardwareData: InventoryItem[];
}

// Create the context
const InventoryDataManagerContext =
  createContext<CombinedInventoryDataManagerReturn | null>(null);

// Provider component
interface InventoryDataManagerProviderProps {
  children: ReactNode;
}

/**
 * Provider that provides the centralized inventory data manager to the component tree
 *
 * This provider combines the focused hooks to provide a unified interface
 * through React Context, allowing any component in the inventory system to access
 * the centralized data management functionality.
 */
export const InventoryDataManagerProvider: React.FC<
  InventoryDataManagerProviderProps
> = ({ children }) => {
  // Use focused hooks
  const { fetchData, refreshData } = useInventoryDataFetching();
  const { addCategory, deleteCategory } = useInventoryCategoryManagement();
  const { getItemsByCategory, getAllItems } = useInventoryDataAccess();
  const { createItem } = useInventoryCreate();
  const { updateItem } = useInventoryUpdate();
  const { deleteItem } = useInventoryDelete();
  const metrics = useInventoryMetrics();
  const { resetError, retryLastOperation } = useInventoryErrorHandling();

  // Combine all the focused hooks into a single interface
  const combinedDataManager: CombinedInventoryDataManagerReturn = {
    // Data fetching
    fetchData,
    refreshData,

    // CRUD operations
    createItem: async (item: InventoryFormData) => {
      const result = await createItem(item);
      if (!result) {
        throw new Error('Failed to create item');
      }
    },
    updateItem: async (id: string, updates: Partial<InventoryItem>) => {
      const result = await updateItem(id, updates);
      if (!result) {
        throw new Error('Failed to update item');
      }
    },
    deleteItem: async (id: string) => {
      const result = await deleteItem(id);
      if (!result) {
        throw new Error('Failed to delete item');
      }
    },

    // Category management
    addCategory,
    deleteCategory,

    // Data access
    getItemsByCategory,
    getFilteredItems: async (
      searchQuery: string,
      filters?: Record<string, unknown>
    ) => {
      const items = await getAllItems();
      return items.filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.barcode?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (filters) {
          return Object.entries(filters).every(([key, value]) => {
            if (value === undefined || value === null) return true;
            return (item as Record<string, unknown>)[key] === value;
          });
        }

        return true;
      });
    },
    getAllItems,
    getCategories: () => {
      const items = getAllItems();
      const categories = new Set(
        items.map((item) => item.category).filter(Boolean)
      );
      return Array.from(categories) as string[];
    },

    // Analytics
    getAnalyticsData: () => ({
      totalItems: metrics.getTotalItems(),
      totalValue: metrics.getTotalValue(),
      averagePrice: metrics.getAveragePrice(),
      lowStockCount: metrics.getLowStockCount(),
      outOfStockCount: metrics.getOutOfStockCount(),
      overstockCount: metrics.getOverstockCount(),
    }),

    // Error handling
    resetError,
    retryLastOperation,

    // State
    data: {},
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    operationInProgress: { type: '', itemId: undefined },

    // Legacy compatibility - these will be empty arrays until we implement the data access
    inventoryData: getAllItems(),
    suppliesData: getItemsByCategory('supplies'),
    equipmentData: getItemsByCategory('equipment'),
    officeHardwareData: getItemsByCategory('officeHardware'),
  };

  return (
    <InventoryDataManagerContext.Provider value={combinedDataManager}>
      {children}
    </InventoryDataManagerContext.Provider>
  );
};

// Hook to use the data manager context
export const useInventoryDataManagerContext =
  (): CombinedInventoryDataManagerReturn => {
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
    clearError: context.resetError,
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
