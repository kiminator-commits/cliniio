import { useCallback } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';

export const useInventoryFilterState = () => {
  const {
    // Filter state from store
    searchQuery,
    searchTerm, // Legacy compatibility
    categoryFilter,
    locationFilter,
    statusFilter,
    activeFilter, // Legacy compatibility
    favorites,
    showFavoritesOnly,
    sortField,
    sortDirection,

    // Filter actions from store
    setSearchQuery,
    setSearchTerm, // Legacy compatibility
    setCategoryFilter,
    setLocationFilter,
    setStatusFilter,
    setActiveFilter, // Legacy compatibility
    setFavorites,
    toggleFavorite,
    setShowFavoritesOnly,
    setSortField,
    setSortDirection,
    clearFilters,
    resetFilters,
    clearSearch,
  } = useInventoryStore();

  // Enhanced actions that combine store actions
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setCategoryFilter(category);
    },
    [setCategoryFilter]
  );

  const handleLocationChange = useCallback(
    (location: string) => {
      setLocationFilter(location);
    },
    [setLocationFilter]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setStatusFilter(status);
    },
    [setStatusFilter]
  );

  const handleFavoriteToggle = useCallback(
    (itemId: string) => {
      toggleFavorite(itemId);
    },
    [toggleFavorite]
  );

  const handleSortChange = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      setSortField(field);
      setSortDirection(direction);
    },
    [setSortField, setSortDirection]
  );

  const handleClearAllFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleResetAllFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return {
    // Filter state
    searchQuery,
    searchTerm, // Legacy compatibility
    categoryFilter,
    locationFilter,
    statusFilter,
    activeFilter, // Legacy compatibility
    favorites,
    showFavoritesOnly,
    sortField,
    sortDirection,

    // Filter actions
    setSearchQuery: handleSearchChange,
    setSearchTerm, // Legacy compatibility
    setCategoryFilter: handleCategoryChange,
    setLocationFilter: handleLocationChange,
    setStatusFilter: handleStatusChange,
    setActiveFilter, // Legacy compatibility
    setFavorites,
    toggleFavorite: handleFavoriteToggle,
    setShowFavoritesOnly,
    setSortField,
    setSortDirection,
    clearFilters: handleClearAllFilters,
    resetFilters: handleResetAllFilters,
    clearSearch,

    // Enhanced actions
    handleSearchChange,
    handleCategoryChange,
    handleLocationChange,
    handleStatusChange,
    handleFavoriteToggle,
    handleSortChange,
    handleClearAllFilters,
    handleResetAllFilters,
  };
};
