import { useCallback } from 'react';
import { useModalState } from './useModalState';
import { useInventoryStore } from '@/store/useInventoryStore';
import { LocalInventoryItem } from '@/types/inventoryTypes';

/**
 * Hook to manage inventory modal business logic
 * Extracts modal operations from UI components
 */
export const useInventoryModals = () => {
  const modalState = useModalState();
  const {
    // Inventory data operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    // Search and filter state
    searchQuery,
    setSearchQuery,
    favorites,
    setFavorites,

    // Track modal state
    trackedItems,
    trackingData,
    toggleTrackedItem,
  } = useInventoryStore();

  // Handler for form changes in add/edit modal
  const handleFormChange = useCallback(
    (field: string, value: string) => {
      modalState.setFormData({
        ...modalState.formData,
        [field]: value,
      });
    },
    [modalState]
  );

  // Handler for toggling sections in add/edit modal
  const toggleSection = useCallback(
    (section: string) => {
      modalState.setExpandedSections({
        ...modalState.expandedSections,
        [section]: !modalState.expandedSections[section],
      });
    },
    [modalState]
  );

  // Handler for saving item in add/edit modal
  const handleSaveItem = useCallback(() => {
    if (modalState.isEditMode) {
      // Update existing item
      updateInventoryItem(modalState.formData as LocalInventoryItem);
    } else {
      // Add new item
      addInventoryItem(modalState.formData as LocalInventoryItem);
    }
    modalState.closeAddModal();
  }, [modalState, updateInventoryItem, addInventoryItem]);

  // Handler for deleting an item
  const handleDeleteItem = useCallback(
    (itemId: string) => {
      deleteInventoryItem(itemId);
    },
    [deleteInventoryItem]
  );

  // Handler for toggling favorite status
  const toggleFavorite = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      setFavorites(Array.from(newFavorites));
    },
    [favorites, setFavorites]
  );

  // Handler for tracking an item
  const handleTrackItem = useCallback(
    (itemId: string, doctor: string) => {
      toggleTrackedItem(itemId, doctor);
    },
    [toggleTrackedItem]
  );

  // Handler for search term changes in track modal
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchQuery(term);
    },
    [setSearchQuery]
  );

  // Handler for opening edit modal with item data
  const handleEditItem = useCallback(
    (item: LocalInventoryItem) => {
      modalState.openEditModal(item);
    },
    [modalState]
  );

  // Handler for opening add modal
  const handleAddItem = useCallback(() => {
    modalState.openAddModal();
  }, [modalState]);

  // Handler for opening track modal
  const handleOpenTrackModal = useCallback(() => {
    modalState.openTrackModal();
  }, [modalState]);

  // Handler for opening upload barcode modal
  const handleOpenUploadBarcodeModal = useCallback(() => {
    modalState.openUploadBarcodeModal();
  }, [modalState]);

  // Handler for opening scan modal
  const handleOpenScanModal = useCallback(() => {
    modalState.openScanModal();
  }, [modalState]);

  return {
    // Modal state
    ...modalState,

    // Form handlers
    handleFormChange,
    toggleSection,
    handleSaveItem,

    // Item operations
    handleDeleteItem,
    handleEditItem,
    handleAddItem,

    // Track modal handlers
    handleTrackItem,
    handleSearchChange,
    handleOpenTrackModal,

    // Other modal handlers
    handleOpenUploadBarcodeModal,
    handleOpenScanModal,

    // Favorite operations
    toggleFavorite,

    // Current state for modals
    searchQuery,
    favorites,
    trackedItems,
    trackingData,
  };
};
