import React, { createContext, useContext, useMemo } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { TabType } from '../types';

interface InventoryUIStateContextType {
  // UI State
  activeTab: TabType;
  showFilters: boolean;
  showTrackedOnly: boolean;
  showFavoritesOnly: boolean;
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
  itemsPerPage: number;
  currentPage: number;

  // Modal State
  showAddModal: boolean;
  showScanModal: boolean;
  isEditMode: boolean;
  expandedSections: Record<string, boolean>;

  // UI Actions
  setActiveTab: (tab: TabType) => void;
  setShowFilters: (show: boolean) => void;
  setShowTrackedOnly: (show: boolean) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  setItemsPerPage: (items: number) => void;
  setCurrentPage: (page: number) => void;

  // Modal Actions
  setShowAddModal: (show: boolean) => void;
  setShowScanModal: (show: boolean) => void;
  setEditMode: (edit: boolean) => void;
  setExpandedSections: (sections: Record<string, boolean>) => void;
  toggleExpandedSection: (section: string) => void;

  // Utility Actions
  resetUIState: () => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

const InventoryUIStateContext = createContext<InventoryUIStateContextType | undefined>(undefined);

interface InventoryUIStateProviderProps {
  children: React.ReactNode;
}

export const InventoryUIStateProvider: React.FC<InventoryUIStateProviderProps> = ({ children }) => {
  const {
    // UI State
    activeTab,
    showFilters,
    showTrackedOnly,
    showFavoritesOnly,
    searchQuery,
    categoryFilter,
    locationFilter,
    itemsPerPage,
    currentPage,

    // Modal State
    showAddModal,
    showScanModal,
    isEditMode,
    expandedSections,

    // UI Actions
    setActiveTab,
    setShowFilters,
    setShowTrackedOnly,
    setShowFavoritesOnly,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    setItemsPerPage,
    setCurrentPage,

    // Modal Actions
    setShowAddModal,
    setShowScanModal,
    setEditMode,
    setExpandedSections,
  } = useInventoryStore();

  // Utility actions
  const toggleExpandedSection = useMemo(
    () => (section: string) => {
      setExpandedSections({
        ...expandedSections,
        [section]: !expandedSections[section],
      });
    },
    [expandedSections, setExpandedSections]
  );

  const resetUIState = useMemo(
    () => () => {
      setShowFilters(false);
      setShowTrackedOnly(false);
      setShowFavoritesOnly(false);
      setSearchQuery('');
      setCategoryFilter('');
      setLocationFilter('');
      setItemsPerPage(10);
      setCurrentPage(1);
      setShowAddModal(false);
      setShowScanModal(false);
      setEditMode(false);
      setExpandedSections({});
    },
    [
      setShowFilters,
      setShowTrackedOnly,
      setShowFavoritesOnly,
      setSearchQuery,
      setCategoryFilter,
      setLocationFilter,
      setItemsPerPage,
      setCurrentPage,
      setShowAddModal,
      setShowScanModal,
      setEditMode,
      setExpandedSections,
    ]
  );

  const resetFilters = useMemo(
    () => () => {
      setShowTrackedOnly(false);
      setShowFavoritesOnly(false);
      setSearchQuery('');
      setCategoryFilter('');
      setLocationFilter('');
    },
    [setShowTrackedOnly, setShowFavoritesOnly, setSearchQuery, setCategoryFilter, setLocationFilter]
  );

  const resetPagination = useMemo(
    () => () => {
      setItemsPerPage(10);
      setCurrentPage(1);
    },
    [setItemsPerPage, setCurrentPage]
  );

  const contextValue = useMemo(
    () => ({
      // UI State
      activeTab,
      showFilters,
      showTrackedOnly,
      showFavoritesOnly,
      searchQuery,
      categoryFilter,
      locationFilter,
      itemsPerPage,
      currentPage,

      // Modal State
      showAddModal,
      showScanModal,
      isEditMode,
      expandedSections,

      // UI Actions
      setActiveTab,
      setShowFilters,
      setShowTrackedOnly,
      setShowFavoritesOnly,
      setSearchQuery,
      setCategoryFilter,
      setLocationFilter,
      setItemsPerPage,
      setCurrentPage,

      // Modal Actions
      setShowAddModal,
      setShowScanModal,
      setEditMode,
      setExpandedSections,
      toggleExpandedSection,

      // Utility Actions
      resetUIState,
      resetFilters,
      resetPagination,
    }),
    [
      activeTab,
      showFilters,
      showTrackedOnly,
      showFavoritesOnly,
      searchQuery,
      categoryFilter,
      locationFilter,
      itemsPerPage,
      currentPage,
      showAddModal,
      showScanModal,
      isEditMode,
      expandedSections,
      setActiveTab,
      setShowFilters,
      setShowTrackedOnly,
      setShowFavoritesOnly,
      setSearchQuery,
      setCategoryFilter,
      setLocationFilter,
      setItemsPerPage,
      setCurrentPage,
      setShowAddModal,
      setShowScanModal,
      setEditMode,
      setExpandedSections,
      toggleExpandedSection,
      resetUIState,
      resetFilters,
      resetPagination,
    ]
  );

  return (
    <InventoryUIStateContext.Provider value={contextValue}>
      {children}
    </InventoryUIStateContext.Provider>
  );
};

export const useInventoryUIStateContext = (): InventoryUIStateContextType => {
  const context = useContext(InventoryUIStateContext);
  if (context === undefined) {
    throw new Error('useInventoryUIStateContext must be used within an InventoryUIStateProvider');
  }
  return context;
};
