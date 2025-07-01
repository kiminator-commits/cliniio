import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ScanInventoryModal from '../ScanInventoryModal';
import { useInventoryStore } from '@/store/useInventoryStore';

function ScanModalErrorFallback() {
  return (
    <div className="text-red-600 text-sm p-4">
      ⚠️ Something went wrong loading the Scan Modal. Please refresh or try again later.
    </div>
  );
}

const ScanModalWrapper: React.FC = () => {
  // Get all values from store instead of props
  const {
    showScanModal,
    scanMode,
    scannedItems,
    resetScannedItems,
    setScanMode,
    setShowScanModal,
    addScannedItem,
    removeScannedItem,
  } = useInventoryStore();

  // Local functions that were previously passed as props
  const handleProcessScannedItems = () => {
    // Implementation for processing scanned items
    console.log('Processing scanned items...');
  };

  const handleOpenAddItemModalWithBarcode = (barcodeData?: string) => {
    // Implementation for opening add item modal with barcode
    console.log('Opening add item modal with barcode:', barcodeData);
  };

  if (!showScanModal) return null;

  return (
    <ScanInventoryModal
      scanMode={scanMode}
      scannedItems={scannedItems}
      onClose={() => {
        resetScannedItems();
        setScanMode(null);
        setShowScanModal(false);
      }}
      onSelectMode={setScanMode}
      onScan={addScannedItem}
      onProcess={handleProcessScannedItems}
      onClearScannedItems={resetScannedItems}
      onOpenAddItemModal={handleOpenAddItemModalWithBarcode}
      onRemoveScannedItem={removeScannedItem}
    />
  );
};

export default function ScanModalWrapperWithBoundary() {
  return (
    <ErrorBoundary FallbackComponent={ScanModalErrorFallback}>
      <ScanModalWrapper />
    </ErrorBoundary>
  );
}
