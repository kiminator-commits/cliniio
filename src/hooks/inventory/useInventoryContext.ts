import { useMemo } from 'react';
import { useInventoryPageLogic } from './useInventoryPageLogic';

/**
 * Hook that creates the context value for InventoryDashboardContext
 * Extracted from the main Inventory component to separate context creation logic
 */
export const useInventoryContext = () => {
  const {
    showTrackedOnly,
    showFavoritesOnly,
    searchQuery,
    expandedSections,
    favorites,
    filteredTools,
    handleShowAddModal,
    handleCloseAddModal,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    onCategoryChange,
    setSearchTerm,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    handleToggleFavorite,
    getStatusBadge,
    getStatusText,
  } = useInventoryPageLogic();

  // Context provider setup - create context value
  const contextValue = useMemo(
    () => ({
      showTrackedOnly,
      showFavoritesOnly,
      handleShowAddModal,
      handleCloseAddModal,
      handleToggleTrackedFilter,
      handleToggleFavoritesFilter,
      onCategoryChange,
      searchTerm: searchQuery,
      expandedSections,
      favorites: Array.from(favorites), // Convert Set to Array
      filteredTools,
      setSearchTerm,
      handleSave,
      handleToggleSection,
      handleFormChangeWrapper,
      handleToggleFavorite,
      getStatusBadge,
      getStatusText,
    }),
    [
      showTrackedOnly,
      showFavoritesOnly,
      handleShowAddModal,
      handleCloseAddModal,
      handleToggleTrackedFilter,
      handleToggleFavoritesFilter,
      onCategoryChange,
      searchQuery,
      expandedSections,
      favorites,
      filteredTools,
      setSearchTerm,
      handleSave,
      handleToggleSection,
      handleFormChangeWrapper,
      handleToggleFavorite,
      getStatusBadge,
      getStatusText,
    ]
  );

  return contextValue;
};
