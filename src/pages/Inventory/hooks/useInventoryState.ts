import { useInventoryStore } from '../../../store/useInventoryStore';

/**
 * Hook to manage all inventory state from the store
 * Extracts store state management from the main page component
 */
export const useInventoryState = () => {
  const {
    // UI State
    activeTab,
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Filter State
    searchQuery,
    setSearchQuery,

    // Data State
    items,
    categories,
    analyticsData,
    isLoading,
    isCategoriesLoading,
    isLoadingAnalytics,
    totalItems,
    formData,
    setFormData,
    mergeFormData,
    isEditMode,
    setEditMode,
    resetForm,
    favorites,
    setFavorites,
    expandedSections,
    setExpandedSections,

    // Modal State
    openAddModal,
    closeAddModal,
  } = useInventoryStore();

  return {
    // UI State
    activeTab,
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Filter State
    searchQuery,
    setSearchQuery,

    // Data State
    items,
    categories,
    analyticsData,
    isLoading,
    isCategoriesLoading,
    isLoadingAnalytics,
    totalItems,
    formData,
    setFormData,
    mergeFormData,
    isEditMode,
    setEditMode,
    resetFormData: resetForm,
    favorites,
    setFavorites,
    expandedSections,
    setExpandedSections,

    // Modal State
    openAddModal,
    closeAddModal,
  };
};
