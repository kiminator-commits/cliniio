import { useMemo, useCallback } from 'react';
import { LocalInventoryItem } from '../../types/inventoryTypes';
import { useInventoryFilters, InventoryFilters } from './useInventoryFilters';
import { useInventorySearch } from './useInventorySearch';
import { useInventorySorting, SortConfig } from './useInventorySorting';
import { filterInventoryData } from '../../utils/inventory/filterUtils';

export interface UseInventoryFilterCompositionProps {
  data: LocalInventoryItem[];
  activeTab: string;
  favorites?: Set<string>;
  initialFilters?: Partial<InventoryFilters>;
  initialSort?: SortConfig;
  onDataChange?: (filteredData: LocalInventoryItem[]) => void;
}

export const useInventoryFilterComposition = ({
  data,
  activeTab,
  favorites = new Set(),
  initialFilters = {},
  initialSort = { field: 'item', direction: 'asc' },
  onDataChange,
}: UseInventoryFilterCompositionProps) => {
  // Initialize filter state
  const [filters, filterActions] = useInventoryFilters({
    initialFilters,
    onFiltersChange: () => {
      // This will trigger a re-filter when filters change
    },
  });

  // Initialize search with filtered data
  const searchData = useMemo(() => {
    return filterInventoryData(data, filters, activeTab, favorites);
  }, [data, filters, activeTab, favorites]);

  const {
    searchResults: searchFilteredData,
    isSearching,
    totalResults,
    searchError,
  } = useInventorySearch({
    data: searchData,
    filters,
    searchOptions: {
      debounceMs: 300,
      caseSensitive: false,
      searchFields: ['item', 'category', 'location'],
    },
  });

  // Initialize sorting with search results
  const {
    sortedData: finalData,
    sortBy,
    isFieldSorted,
    getNextSortDirection,
    sortConfig,
  } = useInventorySorting({
    data: searchFilteredData,
    initialSort,
    sortOptions: {
      multiSort: false,
      caseSensitive: false,
      nullsFirst: false,
    },
  });

  // Memoized computed values
  const filterStats = useMemo(() => {
    const totalItems = data.length;
    const filteredItems = searchData.length;
    const searchFilteredItems = searchFilteredData.length;
    const finalItems = finalData.length;

    return {
      totalItems,
      filteredItems,
      searchFilteredItems,
      finalItems,
      filterReduction: totalItems - filteredItems,
      searchReduction: filteredItems - searchFilteredItems,
      totalReduction: totalItems - finalItems,
    };
  }, [data.length, searchData.length, searchFilteredData.length, finalData.length]);

  // Combined actions
  const combinedActions = useMemo(
    () => ({
      // Filter actions
      ...filterActions,

      // Search actions
      search: (term: string) => {
        filterActions.setSearchQuery(term);
      },

      // Sort actions
      sortBy,
      isFieldSorted,
      getNextSortDirection,

      // Utility actions
      resetAll: () => {
        filterActions.resetFilters();
        // Note: Sorting will be reset by the sorting hook when data changes
      },

      // Quick filter presets
      filterByCategory: (category: string) => {
        filterActions.setCategory(category);
      },

      filterByLocation: (location: string) => {
        filterActions.setLocation(location);
      },

      filterByStatus: (status: string) => {
        filterActions.setStatus(status);
      },

      filterByPriceRange: (min: number, max: number) => {
        filterActions.setPriceRange(min, max);
      },

      filterByQuantityRange: (min: number, max: number) => {
        filterActions.setQuantityRange(min, max);
      },

      toggleTrackedOnly: () => {
        filterActions.toggleTrackedOnly();
      },

      toggleFavoritesOnly: () => {
        filterActions.toggleFavoritesOnly();
      },
    }),
    [filterActions, sortBy, isFieldSorted, getNextSortDirection]
  );

  // Notify parent of data changes
  const notifyDataChange = useCallback(() => {
    if (onDataChange) {
      onDataChange(finalData);
    }
  }, [finalData, onDataChange]);

  // Effect to notify parent when final data changes
  useMemo(() => {
    notifyDataChange();
  }, [notifyDataChange]);

  return {
    // State
    filters,
    finalData,
    isSearching,
    searchError,
    totalResults,
    filterStats,
    sortConfig,

    // Actions
    actions: combinedActions,

    // Individual hook states (for advanced usage)
    searchState: {
      searchFilteredData,
      isSearching,
      totalResults,
      searchError,
    },

    sortState: {
      sortedData: finalData,
      sortConfig,
    },
  };
};
