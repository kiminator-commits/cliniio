import { useContext } from 'react';
import { InventoryDashboardContext } from '../context/InventoryDashboardContext';
import { InventoryDashboardContextType } from '../types/inventoryDashboardTypes';

// ✅ This hook now enforces and returns all required methods
export const useInventoryDashboard = (): InventoryDashboardContextType => {
  const context = useContext(InventoryDashboardContext);

  if (!context) {
    throw new Error(
      'useInventoryDashboard must be used within an InventoryDashboardProvider'
    );
  }

  const {
    showTrackedOnly,
    showFavoritesOnly,
    handleShowAddModal,
    handleCloseAddModal,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    onCategoryChange,
    searchTerm,
    expandedSections,
    favorites,
    filteredTools,
    setSearchTerm,
    handleToggleFavorite,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    getStatusBadge,
    getStatusText,
  } = context;

  if (
    !expandedSections ||
    !handleCloseAddModal ||
    !handleSave ||
    !handleToggleSection ||
    !handleFormChangeWrapper
  ) {
    throw new Error(
      'InventoryDashboardContext is missing required implementations'
    );
  }

  return {
    showTrackedOnly,
    showFavoritesOnly,
    handleShowAddModal,
    handleCloseAddModal,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    onCategoryChange,
    searchTerm,
    expandedSections,
    favorites,
    filteredTools,
    setSearchTerm,
    handleToggleFavorite,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    getStatusBadge,
    getStatusText,
  };
};
