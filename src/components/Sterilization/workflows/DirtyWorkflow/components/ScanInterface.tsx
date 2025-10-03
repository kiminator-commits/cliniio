import React from 'react';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';

interface ScanInterfaceProps {
  isScanning: boolean;
  onManualBarcodeEntry: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onSimulateScan: () => void;
  isProcessing: boolean;
}

export const ScanInterface: React.FC<ScanInterfaceProps> = ({
  isScanning,
  onManualBarcodeEntry,
  onSimulateScan,
  isProcessing,
}) => {
  return (
    <>
      {/* Manual Barcode Entry */}
      <div className="mb-6">
        <label
          htmlFor="manual-barcode-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Manual Barcode Entry
        </label>
        <input
          id="manual-barcode-input"
          type="text"
          placeholder="Enter barcode and press Enter"
          onKeyPress={onManualBarcodeEntry}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isScanning}
        />
      </div>

      {/* Scan Button */}
      <div className="mb-6">
        <button
          onClick={onSimulateScan}
          disabled={isScanning || isProcessing}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon path={mdiBarcode} size={1.2} />
          {isScanning ? 'Scanning...' : 'Scan Tool'}
        </button>
      </div>
    </>
  );
};
