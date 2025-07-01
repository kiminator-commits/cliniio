import React from 'react';

interface ScanModalProps {
  showScanModal: boolean;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  handleCloseScanModal: () => void;
  handleScanModeSelect: (mode: 'add' | 'use') => void;
  handleScanItem: (itemId: string) => void;
  handleConfirmScan: () => void;
  handleRemoveScannedItem: (itemId: string) => void;
  handleBackToScanModeSelect: () => void;
}

const ScanModal: React.FC<ScanModalProps> = ({ showScanModal }) => {
  if (!showScanModal) return null;

  return null;
};

export default ScanModal;
