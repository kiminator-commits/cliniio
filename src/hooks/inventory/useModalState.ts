import { useCallback } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';

/**
 * Hook to manage modal state for inventory modals
 * Extracts modal state management from UI components
 */
export const useModalState = () => {
  const {
    // Modal visibility states
    showAddModal,
    showTrackModal,
    showUploadBarcodeModal,
    showScanModal,

    // Modal toggle functions
    toggleAddModal,
    toggleTrackModal,
    toggleUploadBarcodeModal,
    setShowScanModal,

    // Form and edit mode states
    formData,
    setFormData,
    isEditMode,
    setEditMode,
    expandedSections,
    setExpandedSections,

    // Reset functions
    resetFormData,
  } = useInventoryStore();

  // Handler to open add modal in create mode
  const openAddModal = useCallback(() => {
    setEditMode(false);
    resetFormData();
    toggleAddModal();
  }, [setEditMode, resetFormData, toggleAddModal]);

  // Handler to open add modal in edit mode
  const openEditModal = useCallback(
    (itemData: Record<string, unknown>) => {
      setEditMode(true);
      setFormData(itemData);
      toggleAddModal();
    },
    [setEditMode, setFormData, toggleAddModal]
  );

  // Handler to close add/edit modal
  const closeAddModal = useCallback(() => {
    toggleAddModal();
    setEditMode(false);
    resetFormData();
  }, [toggleAddModal, setEditMode, resetFormData]);

  // Handler to open track modal
  const openTrackModal = useCallback(() => {
    toggleTrackModal();
  }, [toggleTrackModal]);

  // Handler to close track modal
  const closeTrackModal = useCallback(() => {
    toggleTrackModal();
  }, [toggleTrackModal]);

  // Handler to open upload barcode modal
  const openUploadBarcodeModal = useCallback(() => {
    toggleUploadBarcodeModal();
  }, [toggleUploadBarcodeModal]);

  // Handler to close upload barcode modal
  const closeUploadBarcodeModal = useCallback(() => {
    toggleUploadBarcodeModal();
  }, [toggleUploadBarcodeModal]);

  // Handler to open scan modal
  const openScanModal = useCallback(() => {
    setShowScanModal(true);
  }, [setShowScanModal]);

  // Handler to close scan modal
  const closeScanModal = useCallback(() => {
    setShowScanModal(false);
  }, [setShowScanModal]);

  return {
    // Modal visibility states
    showAddModal,
    showTrackModal,
    showUploadBarcodeModal,
    showScanModal,

    // Form and edit mode states
    formData,
    isEditMode,
    expandedSections,

    // Modal open handlers
    openAddModal,
    openEditModal,
    openTrackModal,
    openUploadBarcodeModal,
    openScanModal,

    // Modal close handlers
    closeAddModal,
    closeTrackModal,
    closeUploadBarcodeModal,
    closeScanModal,

    // Form state setters (for use in modal content)
    setFormData,
    setExpandedSections,
  };
};
