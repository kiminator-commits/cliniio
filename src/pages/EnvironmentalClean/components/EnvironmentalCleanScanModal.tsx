import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiBroom,
  mdiProgressClock,
  mdiCheckCircle,
  mdiPackageVariant,
  mdiShieldAlert,
  mdiBiohazard,
  mdiWrench,
  mdiOfficeBuilding,
  mdiLock,
} from '@mdi/js';

import { useStatusTypesStore } from '../../../store/statusTypesStore';
import { CameraScanningService } from '@/services/cameraScanningService';

export interface EnvironmentalCleanScanModalProps {
  show: boolean;
  onClose: () => void;
  hasScanned: boolean;
  handleStatusSelect: (status: string) => void;
  handleDoneScan: () => void;
  scanMessage?: string;
  onRoomScan?: (barcode: string) => void;
}

const EnvironmentalCleanScanModal: React.FC<
  EnvironmentalCleanScanModalProps
> = ({
  show,
  onClose,
  handleStatusSelect,
  handleDoneScan,
  scanMessage,
  onRoomScan,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );
  const [localSelectedStatus, setLocalSelectedStatus] = useState<string>('');

  // Get status types from store - only core and published statuses
  const { getCoreStatusTypes, getPublishedStatusTypes } = useStatusTypesStore();
  const coreStatuses = getCoreStatusTypes();
  const publishedStatuses = getPublishedStatusTypes();

  // Map status types to modal format with icons
  const availableStatuses = useMemo(() => {
    const iconMap: Record<string, string> = {
      broom: mdiBroom,
      'progress-clock': mdiProgressClock,
      'check-circle': mdiCheckCircle,
      biohazard: mdiBiohazard,
      'shield-alert': mdiShieldAlert,
      'package-variant': mdiPackageVariant,
      wrench: mdiWrench,
      'office-building': mdiOfficeBuilding,
      'account-supervisor': mdiShieldAlert, // fallback
      'shield-lock': mdiShieldAlert, // fallback
      'shield-cross': mdiShieldAlert, // fallback
      'help-circle': mdiShieldAlert, // fallback
      'alert-circle': mdiShieldAlert, // fallback
      account: mdiShieldAlert, // fallback
      'clipboard-check': mdiShieldAlert, // fallback
    };

    const colorMap: Record<string, string> = {
      '#16a34a': 'green',
      '#dc2626': 'red',
      '#ca8a04': 'yellow',
      '#9333ea': 'purple',
      '#4b5563': 'gray',
      '#b45309': 'amber',
      '#047857': 'emerald',
      '#8B5CF6': 'purple',
      '#EA580C': 'amber',
      '#9CA3AF': 'gray',
      '#059669': 'green',
      '#3B82F6': 'blue',
      '#F59E0B': 'amber',
    };

    // Combine core and published statuses, with core statuses first
    const allVisibleStatuses = [
      ...coreStatuses,
      ...publishedStatuses.filter((s) => !s.isCore),
    ];

    return allVisibleStatuses.map((status) => ({
      id: status.id,
      name: status.name,
      icon: iconMap[status.icon] || mdiShieldAlert,
      color: colorMap[status.color] || 'gray',
      description: status.description,
      isCore: status.isCore, // Add this for UI indication
    }));
  }, [coreStatuses, publishedStatuses]);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      // Use real camera scanning service
      const barcode = await CameraScanningService.scanBarcode();
      if (onRoomScan) {
        onRoomScan(barcode);
      }
      setScanResult('success');
    } catch (err) {
      console.error('Scan failed:', err);
      setScanResult('error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleLocalStatusSelect = (status: string) => {
    setLocalSelectedStatus(status);
    handleStatusSelect(status);
  };

  const handleCompleteCleaning = () => {
    handleDoneScan();
  };

  useEffect(() => {
    if (show) {
      setLocalSelectedStatus('');
      setScanResult(null);
      setIsScanning(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop - Shows the environmental clean dashboard in background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 right-0 w-[40%] bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header - Fixed */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Environmental Clean Scanner
          </h2>
          <p className="text-gray-600 text-sm">
            Scan rooms for cleaning management
          </p>
        </div>

        {/* Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {!localSelectedStatus ? (
            /* Status Selection */
            <div className="space-y-3 pb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Select Room Status
              </h3>
              <div className="space-y-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleLocalStatusSelect(status.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      status.color === 'green'
                        ? 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100'
                        : status.color === 'yellow'
                          ? 'border-yellow-200 hover:border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                          : status.color === 'red'
                            ? 'border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100'
                            : status.color === 'purple'
                              ? 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100'
                              : status.color === 'gray'
                                ? 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                                : status.color === 'amber'
                                  ? 'border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100'
                                  : status.color === 'emerald'
                                    ? 'border-emerald-200 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          status.color === 'green'
                            ? 'bg-green-100'
                            : status.color === 'yellow'
                              ? 'bg-yellow-100'
                              : status.color === 'red'
                                ? 'bg-red-100'
                                : status.color === 'purple'
                                  ? 'bg-purple-100'
                                  : status.color === 'gray'
                                    ? 'bg-gray-100'
                                    : status.color === 'amber'
                                      ? 'bg-amber-100'
                                      : status.color === 'emerald'
                                        ? 'bg-emerald-100'
                                        : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          path={status.icon}
                          size={1}
                          className={
                            status.color === 'green'
                              ? 'text-green-600'
                              : status.color === 'yellow'
                                ? 'text-yellow-600'
                                : status.color === 'red'
                                  ? 'text-red-600'
                                  : status.color === 'purple'
                                    ? 'text-purple-600'
                                    : status.color === 'gray'
                                      ? 'text-gray-600'
                                      : status.color === 'amber'
                                        ? 'text-amber-600'
                                        : status.color === 'emerald'
                                          ? 'text-emerald-600'
                                          : 'text-gray-600'
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold text-sm ${
                              status.color === 'green'
                                ? 'text-green-800'
                                : status.color === 'yellow'
                                  ? 'text-yellow-800'
                                  : status.color === 'red'
                                    ? 'text-red-800'
                                    : status.color === 'purple'
                                      ? 'text-purple-800'
                                      : status.color === 'gray'
                                        ? 'text-gray-800'
                                        : status.color === 'amber'
                                          ? 'text-amber-800'
                                          : status.color === 'emerald'
                                            ? 'text-emerald-800'
                                            : 'text-gray-800'
                            }`}
                          >
                            {status.name}
                          </h4>
                          {status.isCore && (
                            <Icon
                              path={mdiLock}
                              size={0.5}
                              className="text-gray-200"
                              title="Core status - always available"
                            />
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            status.color === 'green'
                              ? 'text-green-600'
                              : status.color === 'yellow'
                                ? 'text-yellow-600'
                                : status.color === 'red'
                                  ? 'text-red-600'
                                  : status.color === 'purple'
                                    ? 'text-purple-600'
                                    : status.color === 'gray'
                                      ? 'text-gray-600'
                                      : status.color === 'amber'
                                        ? 'text-amber-600'
                                        : status.color === 'emerald'
                                          ? 'text-emerald-600'
                                          : 'text-gray-600'
                          }`}
                        >
                          {status.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Scanner Interface */
            <div className="space-y-6 pb-4">
              {/* Status Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-1">
                  {localSelectedStatus.charAt(0).toUpperCase() +
                    localSelectedStatus.slice(1)}{' '}
                  Status
                </h3>
                <p className="text-blue-600 text-sm">
                  {
                    availableStatuses.find((s) => s.id === localSelectedStatus)
                      ?.description
                  }
                </p>
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

                    {/* Scan Button Overlay */}
                    <button
                      onClick={handleScan}
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
                        ? 'Position room barcode in camera view'
                        : 'Use camera to scan room barcode'}
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
                          scanResult === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      />
                      <span
                        className={`font-medium ${
                          scanResult === 'success'
                            ? 'text-green-800'
                            : 'text-red-800'
                        }`}
                      >
                        {scanMessage || 'Room scanned successfully!'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={() => setLocalSelectedStatus('')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Status Selection
                </button>
                {scanResult === 'success' && (
                  <button
                    onClick={handleCompleteCleaning}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Complete Cleaning
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default EnvironmentalCleanScanModal;
