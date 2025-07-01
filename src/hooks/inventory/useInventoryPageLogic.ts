import { useMemo, useCallback } from 'react';
import { TabType } from '@/pages/Inventory/types';
import { useAddModalHandlers } from '@/hooks/useAddModalHandlers';
import { useInventoryFormHandlers } from '@/hooks/useInventoryFormHandlers';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useInventoryState } from '@/pages/Inventory/hooks/useInventoryState';
import { StatusService } from '@/pages/Inventory/services/statusService';
import { FilterService } from '@/pages/Inventory/services/filterService';
import { CategoryService } from '@/pages/Inventory/services/categoryService';

/**
 * Hook that contains all business logic for the Inventory page
 * Extracted from the main Inventory component to separate concerns
 */
export const useInventoryPageLogic = () => {
  // Store state management - using extracted hook
  const {
    // UI State
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    searchQuery,
    setSearchQuery,

    // Data State
    formData,
    setFormData,
    setEditMode,
    resetFormData,
    favorites,
    setFavorites,
    expandedSections,
    setExpandedSections,

    // Modal State
    toggleAddModal,
  } = useInventoryState();

  // Business logic - form handlers
  const { handleToggleSection, handleFormChangeWrapper } = useInventoryFormHandlers({
    expandedSections,
    setExpandedSections,
    formData,
    setFormData,
  });

  // Business logic - favorite toggle
  const { handleToggleFavorite } = useFavoriteToggle(favorites, setFavorites);

  // Business logic - modal handlers
  const { handleShowAddModal, handleCloseAddModal } = useAddModalHandlers({
    toggleAddModal,
    setEditMode,
    resetFormData,
    setExpandedSections,
    setFormData,
  });

  // Business logic - status badge styling (using service)
  const getStatusBadge = useCallback((phase: string) => {
    return StatusService.getStatusBadge(phase);
  }, []);

  // Business logic - status display text (using service)
  const getStatusText = useCallback((phase: string) => {
    return StatusService.getStatusText(phase);
  }, []);

  // Business logic - category change handler (using service)
  const memoizedCategoryChange = useCallback(
    (tab: TabType) => {
      CategoryService.createCategoryChangeHandler(setActiveTab)(tab);
    },
    [setActiveTab]
  );

  // Business logic - filter handlers (using service)
  const handleToggleTrackedFilter = useCallback(() => {
    CategoryService.createTrackedFilterHandler(showTrackedOnly, setShowTrackedOnly)();
  }, [showTrackedOnly, setShowTrackedOnly]);

  const handleToggleFavoritesFilter = useCallback(() => {
    CategoryService.createFavoritesFilterHandler(showFavoritesOnly, setShowFavoritesOnly)();
  }, [showFavoritesOnly, setShowFavoritesOnly]);

  // Business logic - search handler
  const memoizedSetSearchQuery = useCallback(
    (term: string) => setSearchQuery(term),
    [setSearchQuery]
  );

  // Business logic - save handler
  const handleSave = useCallback(() => {
    // Implementation for saving
    console.log('Saving...');
  }, []);

  // Data transformation - filtered tools for modal (using service)
  const filteredTools = useMemo(() => {
    return FilterService.getFilteredTools();
  }, []);

  return {
    // State
    showTrackedOnly,
    showFavoritesOnly,
    searchQuery,
    expandedSections,
    favorites,
    filteredTools,

    // Handlers
    handleShowAddModal,
    handleCloseAddModal,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    onCategoryChange: memoizedCategoryChange,
    setSearchTerm: memoizedSetSearchQuery,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    handleToggleFavorite,
    getStatusBadge,
    getStatusText,
  };
};
