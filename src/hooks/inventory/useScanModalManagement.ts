import { useState, useCallback } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useScanModalHandlers } from '@/hooks/useScanModalHandlers';
import { createFormDataFromBarcode } from '@/utils/inventory/barcodeUtils';

/**
 * Hook to manage scan modal state and operations
 * @returns Scan modal state and handlers
 */
export const useScanModalManagement = () => {
  // Import scan modal state from store
  const {
    scanMode,
    scannedItems,
    setScanMode,
    resetScannedItems,
    setShowScanModal,
    formData: storeFormData,
    setFormData,
    isEditMode,
  } = useInventoryStore();

  // State to track which scanned item we're currently processing
  const [currentScannedItemIndex, setCurrentScannedItemIndex] = useState(0);

  // Function to handle opening Add Item modal with barcode data
  const handleOpenAddItemModalWithBarcode = useCallback(
    (barcodeData?: string, handleShowAddModal: () => void) => {
      const formDataFromBarcode = createFormDataFromBarcode(barcodeData);
      setFormData(formDataFromBarcode);
      handleShowAddModal();
    },
    [setFormData]
  );

  // Function to handle when Add Item modal is closed (to cycle to next item)
  const { getProgressInfo } = useScanModalHandlers({
    scanMode,
    scannedItems,
    currentScannedItemIndex,
    setCurrentScannedItemIndex,
    resetScannedItems,
    handleCloseAddModal: () => {}, // This will be provided by parent
    handleOpenAddItemModalWithBarcode: (barcodeData?: string) =>
      handleOpenAddItemModalWithBarcode(barcodeData, () => {}), // This will be provided by parent
  });

  // Handler for scan button click
  const handleScanClick = useCallback(() => {
    setScanMode(null);
    resetScannedItems();
    setShowScanModal(true);
  }, [setScanMode, resetScannedItems, setShowScanModal]);

  return {
    // State
    scanMode,
    scannedItems,
    currentScannedItemIndex,
    storeFormData,
    isEditMode,

    // Handlers
    handleScanClick,
    handleOpenAddItemModalWithBarcode,
    getProgressInfo,

    // Store setters (for parent to use)
    setFormData,
    setScanMode,
    resetScannedItems,
    setShowScanModal,
  };
};
