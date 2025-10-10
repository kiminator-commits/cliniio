import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  useScannerState,
  ModalHeader,
  WorkflowSelection,
  WorkflowContent,
} from './ScannerModal';

interface SterilizationScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Simplified SterilizationScannerModal component for barcode scanning.
 * This modal provides a basic interface for scanning tools and managing sterilization workflows.
 */
const SterilizationScannerModal: React.FC<SterilizationScannerModalProps> =
  memo(({ isOpen, onClose }) => {
    const {
      workflowType,
      scannedData,
      isScanning,
      scanResult,
      handleWorkflowSelect,
      handleBackToWorkflow,
      handleScan,
    } = useScannerState();

    const modalContent = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader onClose={onClose} />

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {!workflowType ? (
                  <WorkflowSelection onWorkflowSelect={handleWorkflowSelect} />
                ) : (
                  <WorkflowContent
                    workflowType={workflowType}
                    scannedData={scannedData}
                    isScanning={isScanning}
                    scanResult={scanResult}
                    onClose={onClose}
                    onBackToWorkflow={handleBackToWorkflow}
                    onScan={(barcode) => handleScan(barcode, onClose)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
  });

SterilizationScannerModal.displayName = 'SterilizationScannerModal';

export default SterilizationScannerModal;
