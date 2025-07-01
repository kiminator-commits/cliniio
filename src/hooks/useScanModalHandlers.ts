import { useCallback } from 'react';

interface UseScanModalHandlersArgs {
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  currentScannedItemIndex: number;
  setCurrentScannedItemIndex: (val: number) => void;
  resetScannedItems: () => void;
  handleCloseAddModal: () => void;
  handleOpenAddItemModalWithBarcode: (barcodeData?: string) => void;
}

export function useScanModalHandlers({
  scanMode,
  scannedItems,
  currentScannedItemIndex,
  setCurrentScannedItemIndex,
  resetScannedItems,
  handleCloseAddModal,
  handleOpenAddItemModalWithBarcode,
}: UseScanModalHandlersArgs) {
  const handleAddItemModalClosed = useCallback(() => {
    if (scanMode === 'add' && scannedItems.length > 0) {
      const nextIndex = currentScannedItemIndex + 1;

      if (nextIndex < scannedItems.length) {
        setCurrentScannedItemIndex(nextIndex);
        handleOpenAddItemModalWithBarcode(scannedItems[nextIndex]);
      } else {
        setCurrentScannedItemIndex(0);
        resetScannedItems();
        handleCloseAddModal();
      }
    } else {
      handleCloseAddModal();
    }
  }, [
    scanMode,
    scannedItems,
    currentScannedItemIndex,
    setCurrentScannedItemIndex,
    resetScannedItems,
    handleCloseAddModal,
    handleOpenAddItemModalWithBarcode,
  ]);

  const getProgressInfo = useCallback(() => {
    if (scanMode === 'add' && scannedItems.length > 0) {
      const currentItem = scannedItems[currentScannedItemIndex];
      const parts = currentItem.split('-');
      const itemName = parts.length >= 3 ? parts.slice(2).join('-') : currentItem;

      return {
        current: currentScannedItemIndex + 1,
        total: scannedItems.length,
        currentItemName: itemName,
      };
    }
    return undefined;
  }, [scanMode, scannedItems, currentScannedItemIndex]);

  return {
    handleAddItemModalClosed,
    getProgressInfo,
  };
}
