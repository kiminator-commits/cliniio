import { useMemo } from 'react';
import { LocalInventoryItem } from '@/types/inventoryTypes';

interface UseInventoryTableSectionDataProps {
  activeTab: string;
  compatibleFilters: {
    searchQuery: string;
    category: string;
    location: string;
    showTrackedOnly: boolean;
    showFavoritesOnly: boolean;
  };
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  filteredData: LocalInventoryItem[];
  filteredSuppliesData: LocalInventoryItem[];
  filteredEquipmentData: LocalInventoryItem[];
  filteredOfficeHardwareData: LocalInventoryItem[];
  handleEditClick: (item: LocalInventoryItem) => void;
  handleDeleteItem: (item: LocalInventoryItem) => void;
  handleToggleFavorite: (item: LocalInventoryItem) => void;
  showTrackedOnly: boolean;
  showFavoritesOnly: boolean;
  itemsPerPage: number;
  onToggleTrackedFilter: () => void;
  onToggleFavoritesFilter: () => void;
}

export const useInventoryTableSectionData = (props: UseInventoryTableSectionDataProps) => {
  const {
    activeTab,
    compatibleFilters,
    showFilters,
    setShowFilters,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    handleEditClick,
    handleDeleteItem,
    handleToggleFavorite,
    showTrackedOnly,
    showFavoritesOnly,
    itemsPerPage,
    onToggleTrackedFilter,
    onToggleFavoritesFilter,
  } = props;

  // Memoized props for InventoryFilters
  const filterProps = useMemo(
    () => ({
      filters: compatibleFilters,
      showFilters,
      setShowFilters,
      setSearchQuery,
      onToggleTrackedFilter:
        activeTab === 'tools' || activeTab === 'supplies' ? onToggleTrackedFilter : undefined,
    }),
    [
      compatibleFilters,
      showFilters,
      setShowFilters,
      setSearchQuery,
      activeTab,
      onToggleTrackedFilter,
    ]
  );

  // Memoized props for ExpandedFiltersPanel
  const expandedFiltersProps = useMemo(
    () => ({
      activeTab,
      filters: compatibleFilters,
      setCategoryFilter,
      setLocationFilter,
      setSearchQuery,
      onToggleFavoritesFilter,
    }),
    [
      activeTab,
      compatibleFilters,
      setCategoryFilter,
      setLocationFilter,
      setSearchQuery,
      onToggleFavoritesFilter,
    ]
  );

  // Memoized props for InventoryTables
  const tableProps = useMemo(
    () => ({
      activeTab,
      filteredData,
      filteredSuppliesData,
      filteredEquipmentData,
      filteredOfficeHardwareData,
      handleEditClick,
      handleDeleteItem,
      handleToggleFavorite,
      showTrackedOnly,
      showFavoritesOnly,
      itemsPerPage,
    }),
    [
      activeTab,
      filteredData,
      filteredSuppliesData,
      filteredEquipmentData,
      filteredOfficeHardwareData,
      handleEditClick,
      handleDeleteItem,
      handleToggleFavorite,
      showTrackedOnly,
      showFavoritesOnly,
      itemsPerPage,
    ]
  );

  return {
    filterProps,
    expandedFiltersProps,
    tableProps,
    showFilters,
  };
};
