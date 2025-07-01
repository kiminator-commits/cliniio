import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { useInventoryDataContext } from './InventoryDataProvider';
import { useInventoryUIStateContext } from './InventoryUIStateProvider';
import { useInventoryStore } from '@/store/useInventoryStore';
import { inventoryDataService } from '@/services/inventoryDataService';
import { auditLogger } from '@/utils/auditLogger';

interface InventoryActionsContextType {
  // CRUD Operations
  addItem: (item: LocalInventoryItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<LocalInventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  duplicateItem: (id: string) => Promise<void>;

  // Filtering and Search
  applyFilters: (filters: {
    searchQuery?: string;
    categoryFilter?: string;
    locationFilter?: string;
    showTrackedOnly?: boolean;
    showFavoritesOnly?: boolean;
  }) => void;
  clearFilters: () => void;
  searchItems: (query: string) => void;

  // Sorting
  sortItems: (field: keyof LocalInventoryItem, direction: 'asc' | 'desc') => void;

  // Favorites Management
  toggleFavorite: (itemId: string) => void;
  addToFavorites: (itemId: string) => void;
  removeFromFavorites: (itemId: string) => void;

  // Category Management
  changeCategory: (tab: string) => void;

  // Modal Actions
  showAddModal: () => void;
  hideAddModal: () => void;
  showEditModal: (item: LocalInventoryItem) => void;
  hideEditModal: () => void;
  showScanModal: () => void;
  hideScanModal: () => void;

  // Bulk Operations
  bulkDelete: (itemIds: string[]) => Promise<void>;
  bulkUpdate: (itemIds: string[], updates: Partial<LocalInventoryItem>) => Promise<void>;
  bulkExport: (itemIds?: string[]) => Promise<void>;

  // Data Management
  refreshData: () => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'excel') => Promise<void>;
  importData: (data: LocalInventoryItem[]) => Promise<void>;

  // Utility Actions
  validateItem: (item: LocalInventoryItem) => { isValid: boolean; errors: string[] };
  generateBarcode: () => string;
  getItemById: (id: string) => LocalInventoryItem | undefined;
  getItemsByCategory: (category: string) => LocalInventoryItem[];
}

const InventoryActionsContext = createContext<InventoryActionsContextType | undefined>(undefined);

interface InventoryActionsProviderProps {
  children: React.ReactNode;
}

export const InventoryActionsProvider: React.FC<InventoryActionsProviderProps> = ({ children }) => {
  const { inventoryData, refreshData: refreshInventoryData } = useInventoryDataContext();
  const {
    setActiveTab,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    setShowTrackedOnly,
    setShowFavoritesOnly,
    setShowAddModal,
    setShowScanModal,
    setEditMode,
    resetFilters,
  } = useInventoryUIStateContext();

  const { favorites, setFavorites, setFormData, resetFormData } = useInventoryStore();

  // Utility Actions (defined first to avoid circular dependencies)
  const generateBarcode = useCallback(() => {
    return `ITEM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const getItemById = useCallback(
    (id: string) => {
      const allItems = [
        ...inventoryData.tools,
        ...inventoryData.supplies,
        ...inventoryData.equipment,
        ...inventoryData.officeHardware,
      ];
      return allItems.find(item => item.id === id);
    },
    [inventoryData]
  );

  const getItemsByCategory = useCallback(
    (category: string) => {
      const allItems = [
        ...inventoryData.tools,
        ...inventoryData.supplies,
        ...inventoryData.equipment,
        ...inventoryData.officeHardware,
      ];
      return allItems.filter(item => item.category === category);
    },
    [inventoryData]
  );

  const validateItem = useCallback((item: LocalInventoryItem) => {
    const errors: string[] = [];

    if (!item.name?.trim()) errors.push('Name is required');
    if (!item.category?.trim()) errors.push('Category is required');
    if (!item.id?.trim()) errors.push('ID is required');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // CRUD Operations
  const addItem = useCallback(
    async (item: LocalInventoryItem) => {
      try {
        await inventoryDataService.addItem(item);
        await refreshInventoryData();
        auditLogger.log('inventory', 'add', { itemId: item.id, itemName: item.name });
      } catch (error) {
        console.error('Failed to add item:', error);
        throw error;
      }
    },
    [refreshInventoryData]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<LocalInventoryItem>) => {
      try {
        await inventoryDataService.updateItem(id, updates);
        await refreshInventoryData();
        auditLogger.log('inventory', 'update', { itemId: id, updates });
      } catch (error) {
        console.error('Failed to update item:', error);
        throw error;
      }
    },
    [refreshInventoryData]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await inventoryDataService.deleteItem(id);
        await refreshInventoryData();
        auditLogger.log('inventory', 'delete', { itemId: id });
      } catch (error) {
        console.error('Failed to delete item:', error);
        throw error;
      }
    },
    [refreshInventoryData]
  );

  const duplicateItem = useCallback(
    async (id: string) => {
      try {
        const originalItem = getItemById(id);
        if (!originalItem) throw new Error('Item not found');

        const duplicatedItem = {
          ...originalItem,
          id: generateBarcode(),
          name: `${originalItem.name} (Copy)`,
        };

        await addItem(duplicatedItem);
        auditLogger.log('inventory', 'duplicate', { originalId: id, newId: duplicatedItem.id });
      } catch (error) {
        console.error('Failed to duplicate item:', error);
        throw error;
      }
    },
    [addItem, generateBarcode, getItemById]
  );

  // Filtering and Search
  const applyFilters = useCallback(
    (filters: {
      searchQuery?: string;
      categoryFilter?: string;
      locationFilter?: string;
      showTrackedOnly?: boolean;
      showFavoritesOnly?: boolean;
    }) => {
      if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
      if (filters.categoryFilter !== undefined) setCategoryFilter(filters.categoryFilter);
      if (filters.locationFilter !== undefined) setLocationFilter(filters.locationFilter);
      if (filters.showTrackedOnly !== undefined) setShowTrackedOnly(filters.showTrackedOnly);
      if (filters.showFavoritesOnly !== undefined) setShowFavoritesOnly(filters.showFavoritesOnly);
    },
    [setSearchQuery, setCategoryFilter, setLocationFilter, setShowTrackedOnly, setShowFavoritesOnly]
  );

  const searchItems = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Sorting
  const sortItems = useCallback((field: keyof LocalInventoryItem, direction: 'asc' | 'desc') => {
    // This would be implemented based on your sorting logic
    console.log(`Sorting by ${field} in ${direction} order`);
  }, []);

  // Favorites Management
  const toggleFavorite = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      setFavorites(newFavorites);
    },
    [favorites, setFavorites]
  );

  const addToFavorites = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favorites);
      newFavorites.add(itemId);
      setFavorites(newFavorites);
    },
    [favorites, setFavorites]
  );

  const removeFromFavorites = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favorites);
      newFavorites.delete(itemId);
      setFavorites(newFavorites);
    },
    [favorites, setFavorites]
  );

  // Category Management
  const changeCategory = useCallback(
    (tab: string) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  // Modal Actions
  const showAddModal = useCallback(() => {
    setShowAddModal(true);
    setEditMode(false);
    resetFormData();
  }, [setShowAddModal, setEditMode, resetFormData]);

  const hideAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditMode(false);
    resetFormData();
  }, [setShowAddModal, setEditMode, resetFormData]);

  const showEditModal = useCallback(
    (item: LocalInventoryItem) => {
      setFormData(item);
      setEditMode(true);
      setShowAddModal(true);
    },
    [setFormData, setEditMode, setShowAddModal]
  );

  const hideEditModal = useCallback(() => {
    setShowAddModal(false);
    setEditMode(false);
    resetFormData();
  }, [setShowAddModal, setEditMode, resetFormData]);

  const showScanModal = useCallback(() => {
    setShowScanModal(true);
  }, [setShowScanModal]);

  const hideScanModal = useCallback(() => {
    setShowScanModal(false);
  }, [setShowScanModal]);

  // Bulk Operations
  const bulkDelete = useCallback(
    async (itemIds: string[]) => {
      try {
        await Promise.all(itemIds.map(id => deleteItem(id)));
        auditLogger.log('inventory', 'bulk_delete', { itemIds });
      } catch (error) {
        console.error('Failed to bulk delete items:', error);
        throw error;
      }
    },
    [deleteItem]
  );

  const bulkUpdate = useCallback(
    async (itemIds: string[], updates: Partial<LocalInventoryItem>) => {
      try {
        await Promise.all(itemIds.map(id => updateItem(id, updates)));
        auditLogger.log('inventory', 'bulk_update', { itemIds, updates });
      } catch (error) {
        console.error('Failed to bulk update items:', error);
        throw error;
      }
    },
    [updateItem]
  );

  const bulkExport = useCallback(async (itemIds?: string[]) => {
    try {
      // Implementation would depend on your export logic
      console.log('Exporting items:', itemIds);
    } catch (error) {
      console.error('Failed to export items:', error);
      throw error;
    }
  }, []);

  // Data Management
  const exportData = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    try {
      // Implementation would depend on your export logic
      console.log(`Exporting data in ${format} format`);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async (data: LocalInventoryItem[]) => {
    try {
      // Implementation would depend on your import logic
      console.log('Importing data:', data);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      // CRUD Operations
      addItem,
      updateItem,
      deleteItem,
      duplicateItem,

      // Filtering and Search
      applyFilters,
      clearFilters: resetFilters,
      searchItems,

      // Sorting
      sortItems,

      // Favorites Management
      toggleFavorite,
      addToFavorites,
      removeFromFavorites,

      // Category Management
      changeCategory,

      // Modal Actions
      showAddModal,
      hideAddModal,
      showEditModal,
      hideEditModal,
      showScanModal,
      hideScanModal,

      // Bulk Operations
      bulkDelete,
      bulkUpdate,
      bulkExport,

      // Data Management
      refreshData: refreshInventoryData,
      exportData,
      importData,

      // Utility Actions
      validateItem,
      generateBarcode,
      getItemById,
      getItemsByCategory,
    }),
    [
      addItem,
      updateItem,
      deleteItem,
      duplicateItem,
      applyFilters,
      resetFilters,
      searchItems,
      sortItems,
      toggleFavorite,
      addToFavorites,
      removeFromFavorites,
      changeCategory,
      showAddModal,
      hideAddModal,
      showEditModal,
      hideEditModal,
      showScanModal,
      hideScanModal,
      bulkDelete,
      bulkUpdate,
      bulkExport,
      refreshInventoryData,
      exportData,
      importData,
      validateItem,
      generateBarcode,
      getItemById,
      getItemsByCategory,
    ]
  );

  return (
    <InventoryActionsContext.Provider value={contextValue}>
      {children}
    </InventoryActionsContext.Provider>
  );
};

export const useInventoryActionsContext = (): InventoryActionsContextType => {
  const context = useContext(InventoryActionsContext);
  if (context === undefined) {
    throw new Error('useInventoryActionsContext must be used within an InventoryActionsProvider');
  }
  return context;
};
