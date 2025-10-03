import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanModalLogic } from './hooks/useScanModalLogic';
import ScanModalHeader from '@/pages/Inventory/components/ScanModalHeader';
import ScanModalContent from './components/ScanModalContent';
import ScanModalActions from './components/ScanModalActions';

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
  useScanModalLogic({ scanMode, onScan });

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
          onClick={(e) => e.stopPropagation()}
        >
          <ScanModalHeader scanMode={scanMode} onClose={onClose} />

          <ScanModalContent
            scanMode={scanMode}
            scannedItems={scannedItems}
            onSelectMode={onSelectMode}
            onClearScannedItems={onClearScannedItems}
            onRemoveScannedItem={onRemoveScannedItem}
          />

          <ScanModalActions
            scanMode={scanMode}
            scannedItems={scannedItems}
            onSelectMode={onSelectMode}
            onProcess={onProcess}
            onClose={onClose}
            onOpenAddItemModal={onOpenAddItemModal}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default ScanInventoryModal;
