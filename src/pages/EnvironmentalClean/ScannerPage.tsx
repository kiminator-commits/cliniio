/**
 * ⚠️ CRITICAL: DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT ⚠️
 *
 * This environmental clean scanner page contains:
 * - Room scanning functionality with barcode simulation
 * - Status selection and room management
 * - Working scan interface and room cleaning completion
 * - Navigation and room status handling
 * - Original functionality and architecture
 *
 * ANY CHANGES TO THIS FILE REQUIRE EXPLICIT USER PERMISSION
 * DO NOT: Remove scan functionality, change room status handling, modify navigation
 * DO NOT: Simplify component, alter core architecture, or remove working features
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import { RoomScanService, Room } from './services/RoomScanService';
import { mdiBarcode, mdiArrowLeft } from '@mdi/js';
import { RoomStatusType } from './types';
import {
  createStatusMappingConfig,
  getStatusIcon,
  getStatusBgColor,
  getStatusTextColor,
} from './components/ui/utils/statusMappingUtils';
import { useStatusTypesStore } from '../../store/statusTypesStore';

const ScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllStatusTypes } = useStatusTypesStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );
  const [scanMessage, setScanMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RoomStatusType | ''>('');
  const [scannedRoom, setScannedRoom] = useState<Room | null>(null);

  // Get available statuses from the service
  const availableStatuses = useMemo(() => {
    const statuses = RoomScanService.getAvailableStatuses();
    const config = createStatusMappingConfig();

    // Map to the format expected by the UI using the same utilities as the main page
    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
      icon: getStatusIcon(status.icon || 'default', config.iconMap),
      color: status.color || '#4b5563', // Default gray color matching main page
      bgColor: getStatusBgColor(status.color || '#4b5563', config.bgColorMap),
      textColor: getStatusTextColor(
        status.color || '#4b5563',
        config.textColorMap
      ),
      description: status.description || '',
      isCore: status.isCore || false,
    }));
  }, [getAllStatusTypes]);

  const handleScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedRoom(null);

    try {
      // Simulate barcode scanning - in real implementation, this would come from camera
      const demoBarcodes = [
        'ROOM-001',
        'ROOM-002',
        'ROOM-003',
        'ROOM-004',
        'ROOM-005',
      ];
      const randomBarcode =
        demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];

      // Use the RoomScanService to scan the barcode
      const result = await RoomScanService.scanRoomBarcode(randomBarcode);

      if (result.success && result.room) {
        setScanResult('success');
        setScanMessage(result.message);
        setScannedRoom(result.room);
      } else {
        setScanResult('error');
        setScanMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setScanResult('error');
      setScanMessage('An error occurred during scanning. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleStatusSelect = (statusId: string) => {
    // Convert the status ID to RoomStatusType
    // This is a temporary fix - in a real app, you'd want to map the store status IDs to RoomStatusType
    const statusMap: Record<string, RoomStatusType> = {
      clean: 'clean',
      dirty: 'dirty',
      in_progress: 'in_progress',
      available: 'available',
      biohazard: 'biohazard',
      theft: 'theft',
      low_inventory: 'low_inventory',
      out_of_service: 'out_of_service',
      public_areas: 'public_areas',
    };

    const roomStatus = statusMap[statusId] || 'dirty'; // Default to dirty if unknown
    setSelectedStatus(roomStatus);
  };

  const handleCompleteCleaning = async () => {
    if (!scannedRoom) {
      setScanMessage('No room selected for cleaning completion');
      return;
    }

    try {
      const result = await RoomScanService.completeRoomCleaning(scannedRoom.id);

      if (result.success) {
        setScanMessage(result.message);
        // Navigate back after successful completion
        setTimeout(() => {
          navigate('/environmental-clean');
        }, 2000);
      } else {
        setScanMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setScanMessage(
        'An error occurred while completing cleaning. Please try again.'
      );
    }
  };

  const handleStatusUpdate = async () => {
    if (!scannedRoom || !selectedStatus) {
      setScanMessage('Please select a room and status');
      return;
    }

    try {
      const result = await RoomScanService.updateRoomStatus(
        scannedRoom.id,
        selectedStatus
      );

      if (result.success) {
        setScanMessage(result.message);
        // Navigate back after successful update
        setTimeout(() => {
          navigate('/environmental-clean');
        }, 2000);
      } else {
        setScanMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setScanMessage(
        'An error occurred while updating status. Please try again.'
      );
    }
  };

  const handleBack = () => {
    navigate('/environmental-clean');
  };

  return (
    <SharedLayout>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={handleBack}
        onKeyDown={(e) => e.key === 'Escape' && handleBack()}
        role="button"
        tabIndex={0}
      />

      {/* Drawer - Maintains the original modal styling */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed inset-y-0 right-0 w-[40%] bg-white shadow-2xl z-50"
      >
        <div className="h-full flex flex-col">
          <div className="bg-white overflow-hidden h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon
                  path={mdiArrowLeft}
                  size={1.2}
                  className="text-gray-600"
                />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Environmental Clean Scanner
                </h2>
                <p className="text-gray-600 text-sm">
                  Scan rooms for cleaning management
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar">
              {!selectedStatus ? (
                /* Status Selection */
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Select Room Status
                  </h3>
                  <div className="space-y-2">
                    {availableStatuses.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => handleStatusSelect(status.id)}
                        className="w-full p-3 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 text-left hover:shadow-md hover:-translate-y-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${status.bgColor} rounded-full p-2`}>
                            <Icon
                              path={status.icon}
                              size={1}
                              color={status.color}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-semibold text-sm ${status.textColor}`}
                            >
                              {status.name}
                            </h4>
                            <p
                              className={`text-xs ${status.textColor} opacity-75`}
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
                <div className="space-y-6">
                  {/* Status Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-1">
                      {selectedStatus.charAt(0).toUpperCase() +
                        selectedStatus.slice(1)}{' '}
                      Status
                    </h3>
                    <p className="text-blue-600 text-sm">
                      {
                        availableStatuses.find((s) => s.id === selectedStatus)
                          ?.description
                      }
                    </p>
                  </div>

                  {/* Room Info (if scanned) */}
                  {scannedRoom && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-1">
                        Scanned Room
                      </h3>
                      <p className="text-green-600 text-sm">
                        <strong>Name:</strong> {scannedRoom.name}
                        <br />
                        <strong>Department:</strong>{' '}
                        {scannedRoom.department || 'N/A'}
                        <br />
                        <strong>Floor:</strong> {scannedRoom.floor || 'N/A'}
                        <br />
                        <strong>Building:</strong>{' '}
                        {scannedRoom.building || 'N/A'}
                      </p>
                    </div>
                  )}

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
                          <span className="text-white text-xs">
                            Camera active
                          </span>
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
                            {scanMessage}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setSelectedStatus('')}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back to Status Selection
                    </button>
                    {scanResult === 'success' && scannedRoom && (
                      <>
                        <button
                          onClick={handleStatusUpdate}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={handleCompleteCleaning}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Complete Cleaning
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </SharedLayout>
  );
};

export default ScannerPage;
