import React from 'react';

interface ScannerInterfaceProps {
  scannedBarcode: string | null;
  onRescan: () => void;
}

const ScannerInterface: React.FC<ScannerInterfaceProps> = ({ scannedBarcode, onRescan }) => {
  return (
    <div className="mt-4">
      {scannedBarcode ? (
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
          <span className="text-sm font-mono">{scannedBarcode}</span>
          <button className="text-sm text-blue-600 underline ml-4" onClick={onRescan}>
            Rescan
          </button>
        </div>
      ) : (
        <div className="text-gray-500 italic text-sm">No barcode scanned yet.</div>
      )}
    </div>
  );
};

export default React.memo(ScannerInterface);
