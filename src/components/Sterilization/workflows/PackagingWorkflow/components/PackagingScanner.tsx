import React from 'react';
import {
  mdiBarcodeScan,
  mdiPlus,
  mdiFileDocument,
  mdiInformation,
} from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import { Tool } from '@/types/sterilizationTypes';

interface PackagingScannerProps {
  scannedBarcode: string;
  scanMessage: string;
  scanResult: 'success' | 'error' | null;
  onScan: (barcode: string) => void;
  onBarcodeChange: (barcode: string) => void;
  onSimulateScan: () => void;
  onNewAutoclaveLoad?: () => void;
  onImportReceipt?: () => void;
  currentBatchCode?: string;
  availableTools: Tool[];
}

const PackagingScanner: React.FC<PackagingScannerProps> = ({
  scannedBarcode,
  scanMessage,
  scanResult,
  onScan,
  onBarcodeChange,
  onSimulateScan,
  onNewAutoclaveLoad,
  onImportReceipt,
  currentBatchCode,
  availableTools,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onScan(scannedBarcode);
    }
  };

  return (
    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon path={mdiBarcodeScan} size={1.2} className="text-purple-600" />
          <h4 className="font-medium text-purple-800">Scanner</h4>
        </div>
        <button
          onClick={onSimulateScan}
          disabled={availableTools.length === 0}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            availableTools.length === 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          Simulate Scan
        </button>
      </div>

      {/* Available Tools Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center space-x-2 mb-2">
          <Icon path={mdiInformation} size={1} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Tools Ready for Packaging
          </span>
        </div>
        <p className="text-sm text-blue-700">
          {availableTools.length} tools available for packaging
        </p>
        {availableTools.length > 0 && (
          <div className="mt-2 text-xs text-blue-600">
            <p>
              Available barcodes:{' '}
              {availableTools
                .slice(0, 3)
                .map((t) => t.barcode)
                .join(', ')}
              {availableTools.length > 3 &&
                `... and ${availableTools.length - 3} more`}
            </p>
          </div>
        )}
      </div>

      {/* Current Batch Display */}
      {currentBatchCode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Current Batch:</span>{' '}
            {currentBatchCode}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2 mb-4">
        {onNewAutoclaveLoad && (
          <button
            onClick={onNewAutoclaveLoad}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Icon path={mdiPlus} size={1} />
            <span>+ New Autoclave Load</span>
          </button>
        )}

        {onImportReceipt && (
          <button
            onClick={onImportReceipt}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Icon path={mdiFileDocument} size={1} />
            <span>Import Receipt</span>
          </button>
        )}
      </div>

      {/* Scan Status */}
      {scanResult && (
        <div
          className={`p-3 rounded-md mb-3 ${
            scanResult === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {scanMessage}
        </div>
      )}

      {/* Manual Barcode Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={scannedBarcode}
          onChange={(e) => onBarcodeChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Enter barcode manually or scan..."
        />
        <button
          onClick={() => onScan(scannedBarcode)}
          disabled={!scannedBarcode.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Scan Tool
        </button>
      </div>
    </div>
  );
};

export default PackagingScanner;
