import { useMemo } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { ExpandedSections } from '@/types/inventoryTypes';
import { TabType } from '../types';

interface InventoryUIStateType {
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
  expandedSections: ExpandedSections;

  // Data State (for integration tests)
  items: unknown[];
  categories: string[];
  analyticsData: unknown;
  isLoading: boolean;
  isCategoriesLoading: boolean;
  isLoadingAnalytics: boolean;
  totalItems: number;

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
  setExpandedSections: (sections: ExpandedSections) => void;
  toggleExpandedSection: (section: keyof ExpandedSections) => void;

  // Utility Actions
  resetUIState: () => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

export const useInventoryUIState = (): InventoryUIStateType => {
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

    // Data State (for integration tests)
    items,
    categories,
    analyticsData,
    isLoading,
    isCategoriesLoading,
    isLoadingAnalytics,
    totalItems,

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
    () => (section: keyof ExpandedSections) => {
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
      setExpandedSections({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
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
    [
      setShowTrackedOnly,
      setShowFavoritesOnly,
      setSearchQuery,
      setCategoryFilter,
      setLocationFilter,
    ]
  );

  const resetPagination = useMemo(
    () => () => {
      setItemsPerPage(10);
      setCurrentPage(1);
    },
    [setItemsPerPage, setCurrentPage]
  );

  return {
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

    // Data State (for integration tests)
    items,
    categories,
    analyticsData,
    isLoading,
    isCategoriesLoading,
    isLoadingAnalytics,
    totalItems,

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
  };
};
