import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';

interface ScannerOverlayProps {
  isScanning: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning }) => {
  if (!isScanning) return null;

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg overflow-hidden w-full max-w-lg mx-4"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
                <Icon path={mdiBarcode} size={1} className="text-[#4ECDC4] mr-2" />
                Scanning Room Barcode
              </h3>
            </div>

            {/* Camera Viewfinder */}
            <div className="relative bg-black h-64 sm:h-80">
              {/* Camera feed simulation */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>

              {/* Scanning animation */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-[#4ECDC4]"
                animate={{
                  top: ['10%', '90%', '10%'],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* QR Code outline */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-48 h-48 rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#4ECDC4] rounded-tl"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4ECDC4] rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#4ECDC4] rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#4ECDC4] rounded-br"></div>
              </div>

              {/* Camera status indicator */}
              <div className="absolute bottom-4 right-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                <span className="text-white text-xs">Camera active</span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center text-[#5b5b5b]">
                <div className="animate-spin h-5 w-5 border-2 border-[#4ECDC4] border-t-transparent rounded-full mr-2"></div>
                <span>Scanning for room barcode...</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScannerOverlay;
