import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ScanInventoryModal from '../ScanInventoryModal';
import { useInventoryStore } from '@/store/useInventoryStore';

function ScanModalErrorFallback() {
  return (
    <div className="text-red-600 text-sm p-4">
      ⚠️ Something went wrong loading the Scan Modal. Please refresh or try
      again later.
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

  // Handle closing the scan modal
  const handleCloseScanModal = () => {
    resetScannedItems();
    setScanMode(null);
    setShowScanModal(false);
  };

  if (!showScanModal) return null;

  return (
    <ScanInventoryModal
      scanMode={scanMode}
      scannedItems={scannedItems}
      onClose={handleCloseScanModal}
      onSelectMode={setScanMode}
      onScan={addScannedItem}
      onProcess={() => {}} // This is now handled in ScanModalActions
      onClearScannedItems={resetScannedItems}
      onOpenAddItemModal={() => {}} // This is now handled in ScanModalActions
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
