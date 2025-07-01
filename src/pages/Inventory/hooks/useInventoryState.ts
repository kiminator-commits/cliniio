import { useInventoryStore } from '../../../store/useInventoryStore';

/**
 * Hook to manage all inventory state from the store
 * Extracts store state management from the main page component
 */
export const useInventoryState = () => {
  const {
    // UI State
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Filter State
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
  } = useInventoryStore();

  return {
    // UI State
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,

    // Filter State
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
  };
};
