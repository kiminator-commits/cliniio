import React from 'react';
import { Icon } from '@mdi/react';
import { mdiPlus, mdiMinus, mdiDelete } from '@mdi/js';
import { formatScannedItemsCount } from '../services/scanInventoryModalService';

interface ScanModalContentProps {
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  onSelectMode: (mode: 'add' | 'use') => void;
  onClearScannedItems?: () => void;
  onRemoveScannedItem?: (itemId: string) => void;
}

const ScanModalContent: React.FC<ScanModalContentProps> = ({
  scanMode,
  scannedItems,
  onSelectMode,
  onClearScannedItems,
  onRemoveScannedItem,
}) => {
  if (!scanMode) {
    return (
      <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
        <div className="space-y-3">
          <p className="text-gray-600 text-sm mb-3">
            Select the type of inventory operation you want to perform:
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-yellow-800 text-xs">
              💡 <strong>Tip:</strong> For items without barcodes, use the "Add
              Item" button in the appropriate category table.
            </p>
          </div>
          <button
            onClick={() => onSelectMode('add')}
            className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Icon path={mdiPlus} size={1.2} className="text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-green-800 text-sm">
                  Add Inventory
                </h4>
                <p className="text-xs text-green-600">
                  Scan barcode to add new items. If no barcode exists, you can
                  add one manually.
                </p>
              </div>
            </div>
          </button>
          <button
            onClick={() => onSelectMode('use')}
            className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Icon path={mdiMinus} size={1.2} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-blue-800 text-sm">
                  Use Inventory
                </h4>
                <p className="text-xs text-blue-600">
                  Scan barcode to remove items from inventory when they are
                  used.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Scanner Active</h4>
          <div className="bg-black h-32 rounded-lg flex items-center justify-center">
            <div className="text-white text-sm">Camera Scanner</div>
          </div>
        </div>

        {scannedItems.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">
                Scanned Items ({formatScannedItemsCount(scannedItems.length)})
              </h4>
              <button
                onClick={() => {
                  // Clear all scanned items
                  if (onClearScannedItems) {
                    onClearScannedItems();
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 hide-scrollbar">
              {scannedItems.map((item) => (
                <div
                  key={item}
                  className="bg-gray-50 p-2 rounded text-sm flex items-center justify-between"
                >
                  <span className="flex-1">{item}</span>
                  <button
                    onClick={() => {
                      if (onRemoveScannedItem) {
                        onRemoveScannedItem(item);
                      }
                    }}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                    title="Remove item"
                  >
                    <Icon path={mdiDelete} size={0.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanModalContent;
