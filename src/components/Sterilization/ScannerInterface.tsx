import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';

interface ScanMessage {
  type: 'success' | 'error';
  text: string;
}

interface ScannerInterfaceProps {
  isScanning: boolean;
  scanMessage?: string | ScanMessage | null;
  onScan: () => void;
  size?: 'small' | 'large';
  showCameraStatus?: boolean;
}

export const ScannerInterface: React.FC<ScannerInterfaceProps> = ({
  isScanning,
  scanMessage,
  onScan,
  size = 'large',
  showCameraStatus = true,
}) => {
  const isLarge = size === 'large';
  const viewfinderSize = isLarge ? 'w-48 h-32' : 'w-32 h-24';
  const cornerSize = isLarge ? 'w-4 h-4' : 'w-3 h-3';
  const buttonSize = isLarge ? 'p-4' : 'p-3';
  const iconSize = isLarge ? 1.5 : 1.2;
  const cameraStatusSize = isLarge ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const cameraStatusText = isLarge ? 'text-xs' : 'text-xs';
  const cameraStatusPosition = isLarge
    ? 'bottom-4 right-4'
    : 'bottom-2 right-2';
  const containerHeight = isLarge ? 'h-48' : 'h-32';
  const titleSize = isLarge ? 'text-lg' : 'text-base';
  const descriptionSize = isLarge ? 'text-sm' : 'text-xs';

  const getScanMessageContent = () => {
    if (!scanMessage) return null;

    if (typeof scanMessage === 'string') {
      return scanMessage;
    }

    return scanMessage.text;
  };

  const getScanMessageType = () => {
    if (!scanMessage) return null;

    if (typeof scanMessage === 'string') {
      return 'success';
    }

    return scanMessage.type;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-center space-y-3">
        {/* Camera Viewfinder */}
        <div
          className={`relative bg-black rounded-lg ${containerHeight} flex items-center justify-center`}
        >
          {/* Viewfinder corners */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] ${viewfinderSize} rounded-lg`}
          >
            <div
              className={`absolute top-0 left-0 ${cornerSize} border-t-2 border-l-2 border-[#4ECDC4] rounded-tl`}
            ></div>
            <div
              className={`absolute top-0 right-0 ${cornerSize} border-t-2 border-r-2 border-[#4ECDC4] rounded-tr`}
            ></div>
            <div
              className={`absolute bottom-0 left-0 ${cornerSize} border-b-2 border-l-2 border-[#4ECDC4] rounded-bl`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 ${cornerSize} border-b-2 border-r-2 border-[#4ECDC4] rounded-br`}
            ></div>
          </div>

          {/* Camera status indicator */}
          {showCameraStatus && (
            <div
              className={`absolute ${cameraStatusPosition} flex items-center`}
            >
              <div
                className={`${cameraStatusSize} rounded-full bg-red-500 mr-1 animate-pulse`}
              ></div>
              <span className={`text-white ${cameraStatusText}`}>
                Camera active
              </span>
            </div>
          )}

          {/* Scan Button Overlay */}
          <button
            onClick={onScan}
            disabled={isScanning}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${buttonSize} rounded-full transition-all duration-200 ${
              isScanning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#4ECDC4] hover:bg-[#3db8b0] shadow-lg hover:shadow-xl'
            }`}
          >
            <Icon
              path={mdiBarcode}
              size={iconSize}
              className={`${isScanning ? 'text-gray-400' : 'text-white'}`}
            />
          </button>
        </div>

        <div>
          <h3 className={`${titleSize} font-medium text-gray-800 mb-1`}>
            {isScanning ? 'Scanning...' : 'Click to Scan'}
          </h3>
          <p className={`text-gray-600 ${descriptionSize}`}>
            {isScanning
              ? 'Position barcode in camera view'
              : 'Use camera to scan tool barcode'}
          </p>
        </div>
      </div>

      {/* Scan Result */}
      {scanMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-3 rounded-lg ${
            getScanMessageType() === 'success'
              ? 'bg-green-100 border border-green-200'
              : 'bg-red-100 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={mdiBarcode}
              size={0.8}
              className={
                getScanMessageType() === 'success'
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            />
            <span
              className={`font-medium text-sm ${
                getScanMessageType() === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}
            >
              {getScanMessageContent()}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
