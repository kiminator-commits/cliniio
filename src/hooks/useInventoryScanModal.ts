import { useState, useCallback } from 'react';

export function useInventoryScanModal() {
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanMode, setScanMode] = useState<'add' | 'use' | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);

  const handleShowScanModal = useCallback(() => {
    setShowScanModal(true);
  }, []);

  const handleCloseScanModal = useCallback(() => {
    setShowScanModal(false);
    setScanMode(null); // placeholder
    setScannedItems([]); // placeholder
  }, []);

  const handleScanModeSelect = useCallback((mode: 'add' | 'use') => {
    setScanMode(mode);
  }, []);

  const handleScanItem = useCallback((itemId: string) => {
    setScannedItems((prev) => [...prev, itemId]);
  }, []);

  return {
    showScanModal,
    handleShowScanModal,
    handleCloseScanModal,
    scanMode,
    handleScanModeSelect,
    scannedItems,
    handleScanItem,
  };
}
