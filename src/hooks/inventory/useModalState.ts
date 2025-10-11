import { useCallback } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { InventoryFormData } from '../../types/inventory';

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

    // Modal actions
    openAddModal,
    closeAddModal,
    openTrackModal,
    closeTrackModal,
    openUploadBarcodeModal,
    closeUploadBarcodeModal,
    openScanModal,
    closeScanModal,

    // Form and edit mode states (from form slice)
    formData,
    setFormData,
    mergeFormData,
    updateField,
    isEditMode,
    setEditMode,
    expandedSections,
    setExpandedSections,

    // Reset functions (from form slice)
    resetForm,
  } = useInventoryStore();

  // Handler to open add modal in create mode
  const handleOpenAddModal = useCallback(() => {
    setEditMode(false);
    resetForm();
    openAddModal();
  }, [setEditMode, resetForm, openAddModal]);

  // Handler to open add modal in edit mode
  const handleOpenEditModal = useCallback(
    (itemData: InventoryFormData) => {
      setEditMode(true);
      setFormData(itemData);
      openAddModal();
    },
    [setEditMode, setFormData, openAddModal]
  );

  // Handler to close add/edit modal
  const handleCloseAddModal = useCallback(() => {
    closeAddModal();
    setEditMode(false);
    resetForm();
  }, [closeAddModal, setEditMode, resetForm]);

  // Handler to open track modal
  const handleOpenTrackModal = useCallback(() => {
    openTrackModal();
  }, [openTrackModal]);

  // Handler to close track modal
  const handleCloseTrackModal = useCallback(() => {
    closeTrackModal();
  }, [closeTrackModal]);

  // Handler to open upload barcode modal
  const handleOpenUploadBarcodeModal = useCallback(() => {
    openUploadBarcodeModal();
  }, [openUploadBarcodeModal]);

  // Handler to close upload barcode modal
  const handleCloseUploadBarcodeModal = useCallback(() => {
    closeUploadBarcodeModal();
  }, [closeUploadBarcodeModal]);

  // Handler to open scan modal
  const handleOpenScanModal = useCallback(() => {
    openScanModal();
  }, [openScanModal]);

  // Handler to close scan modal
  const handleCloseScanModal = useCallback(() => {
    closeScanModal();
  }, [closeScanModal]);

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
    openAddModal: handleOpenAddModal,
    openEditModal: handleOpenEditModal,
    openTrackModal: handleOpenTrackModal,
    openUploadBarcodeModal: handleOpenUploadBarcodeModal,
    openScanModal: handleOpenScanModal,

    // Modal close handlers
    closeAddModal: handleCloseAddModal,
    closeTrackModal: handleCloseTrackModal,
    closeUploadBarcodeModal: handleCloseUploadBarcodeModal,
    closeScanModal: handleCloseScanModal,

    // Form state setters (for use in modal content)
    setFormData,
    mergeFormData,
    updateField,
    setExpandedSections,
  };
};
