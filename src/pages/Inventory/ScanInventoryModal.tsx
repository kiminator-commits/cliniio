import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@mdi/react';
import { mdiPlus, mdiMinus, mdiClose, mdiBarcode, mdiDelete } from '@mdi/js';

interface ScanInventoryModalProps {
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  onClose: () => void;
  onSelectMode: (mode: 'add' | 'use') => void;
  onScan: (itemId: string) => void;
  onProcess: () => void;
  onClearScannedItems?: () => void;
  onOpenAddItemModal?: (barcodeData?: string) => void;
  onRemoveScannedItem?: (itemId: string) => void;
}

const ScanInventoryModal: React.FC<ScanInventoryModalProps> = ({
  scanMode,
  scannedItems,
  onClose,
  onSelectMode,
  onScan,
  onProcess,
  onClearScannedItems,
  onOpenAddItemModal,
  onRemoveScannedItem,
}) => {
  const hasAddedMockData = useRef(false);

  // Auto-add mock data when scanMode is set
  useEffect(() => {
    if (scanMode && !hasAddedMockData.current) {
      hasAddedMockData.current = true;

      // Add 5 rows of mock data after a short delay to simulate scanning
      const timer = setTimeout(() => {
        const mockItems = [
          'INV-001-Surgical Scissors',
          'INV-002-Forceps',
          'INV-003-Scalpel Handle',
          'INV-004-Retractor',
          'INV-005-Suture Kit',
        ];

        mockItems.forEach(item => {
          onScan(item);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [scanMode, onScan]);

  // Reset the flag when scanMode is null
  useEffect(() => {
    if (!scanMode) {
      hasAddedMockData.current = false;
    }
  }, [scanMode]);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          zIndex: 99999,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl overflow-hidden w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
                <Icon path={mdiBarcode} size={1.2} className="text-[#4ECDC4] mr-3" />
                {scanMode ? 'Inventory Scanner' : 'Scan Inventory'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon path={mdiClose} size={1.2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
            {!scanMode ? (
              <div className="space-y-3">
                <p className="text-gray-600 text-sm mb-3">
                  Select the type of inventory operation you want to perform:
                </p>
                <button
                  onClick={() => onSelectMode('add')}
                  className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Icon path={mdiPlus} size={1.2} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-green-800 text-sm">Add Inventory</h4>
                      <p className="text-xs text-green-600">Add new items to inventory</p>
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
                      <h4 className="font-semibold text-blue-800 text-sm">Use Inventory</h4>
                      <p className="text-xs text-blue-600">Remove items from inventory</p>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
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
                      <h4 className="font-medium">Scanned Items ({scannedItems.length})</h4>
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
                      {scannedItems.map(item => (
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

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (scanMode === 'add' && scannedItems.length > 0) {
                        // For add mode, cycle through scanned items and open Add Item modal
                        if (onOpenAddItemModal) {
                          // Close the scan modal first
                          onClose();
                          // Open Add Item modal with the first scanned item's data
                          onOpenAddItemModal(scannedItems[0]);
                        }
                      } else {
                        // For use mode or no items, use the original onProcess
                        onProcess();
                      }
                    }}
                    className="flex-1 bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    {scanMode === 'add' ? 'Add to Inventory' : 'Remove from Inventory'}
                  </button>
                  <button
                    onClick={() => onSelectMode(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ScanInventoryModal;
