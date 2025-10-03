import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';
import { availableWorkflows } from '../data/workflowData';

interface ScannerInterfaceProps {
  workflowType: string;
  isScanning: boolean;
  scanResult: 'success' | 'error' | null;
  scannedData: string;
  onScan: () => void;
  onBackToWorkflow: () => void;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({
  workflowType,
  isScanning,
  scanResult,
  scannedData,
  onScan,
  onBackToWorkflow,
}) => {
  const workflow = availableWorkflows.find((w) => w.id === workflowType);

  return (
    <div className="space-y-6">
      {/* Workflow Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-1">
          {workflowType.charAt(0).toUpperCase() + workflowType.slice(1)}{' '}
          Workflow
        </h3>
        <p className="text-blue-600 text-sm">{workflow?.description}</p>
      </div>

      {/* Scan Interface */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-center space-y-4">
          {/* Camera Viewfinder */}
          <div className="relative bg-black h-64 rounded-lg overflow-hidden">
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

            {/* Barcode outline */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-48 h-32 rounded-lg">
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

            {/* Scan Button Overlay */}
            <button
              onClick={onScan}
              disabled={isScanning}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-full transition-all duration-200 ${
                isScanning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#4ECDC4] hover:bg-[#3db8b0] shadow-lg hover:shadow-xl'
              }`}
            >
              <Icon
                path={mdiBarcode}
                size={1.5}
                className={`${isScanning ? 'text-gray-400' : 'text-white'}`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {isScanning ? 'Scanning...' : 'Click to Scan'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isScanning
                ? 'Position barcode in camera view'
                : 'Use camera to scan tool barcode'}
            </p>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg ${
              scanResult === 'success'
                ? 'bg-green-100 border border-green-200'
                : 'bg-red-100 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                path={mdiBarcode}
                size={1}
                className={
                  scanResult === 'success' ? 'text-green-600' : 'text-red-600'
                }
              />
              <span
                className={`font-medium ${
                  scanResult === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {scannedData}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={onBackToWorkflow}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Workflow Selection
        </button>
      </div>
    </div>
  );
};
