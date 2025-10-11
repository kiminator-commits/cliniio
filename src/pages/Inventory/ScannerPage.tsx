/**
 * ⚠️ CRITICAL: DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT ⚠️
 *
 * This inventory scanner page contains:
 * - Sliding drawer functionality (motion.div with right-0 positioning)
 * - Add/Use inventory modes with working scan functionality
 * - Camera interface with scanning animation and manual barcode input
 * - Working buttons and interactive elements
 * - Original sliding behavior and container structure
 *
 * ANY CHANGES TO THIS FILE REQUIRE EXPLICIT USER PERMISSION
 * DO NOT: Remove scan modes, change sliding behavior, modify button functionality
 * DO NOT: Convert to modal, simplify component, or alter core architecture
 * DO NOT: Change backdrop navigation behavior without permission
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiPlus,
  mdiMinus,
  mdiCheckCircle,
  mdiAlertCircle,
} from '@mdi/js';
import { useScanModalLogic } from './hooks/useScanModalLogic';

const ScannerPage: React.FC = () => {
  const [scanMode, setScanMode] = useState<'add' | 'use' | null>(null);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const { handleBarcodeScan } = useScanModalLogic({
    scanMode,
    onScan: (barcode: string) => {
      setScannedItems((prev) => [...prev, barcode]);
    },
  });

  const handleScan = async () => {
    if (!scanMode) return;

    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning with demo barcodes
    setTimeout(async () => {
      const demoBarcodes = [
        'ITEM-001',
        'ITEM-002',
        'ITEM-003',
        'ITEM-004',
        'ITEM-005',
      ];
      const randomBarcode =
        demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];

      try {
        // Call the hook helper to trigger the workflow
        handleBarcodeScan(randomBarcode);

        // Preserve local UI updates
        if (scanMode === 'add') {
          // Add Inventory workflow
          if (!scannedItems.includes(randomBarcode)) {
            setScanResult({
              type: 'success',
              message: `Item ${randomBarcode} scanned successfully! Ready to add to inventory.`,
            });
          } else {
            setScanResult({
              type: 'warning',
              message: `Item ${randomBarcode} already scanned.`,
            });
          }
        } else if (scanMode === 'use') {
          // Use Inventory workflow - simple removal
          if (scannedItems.includes(randomBarcode)) {
            setScanResult({
              type: 'success',
              message: `Item ${randomBarcode} used successfully! Removed from inventory.`,
            });
            setScannedItems((prev) =>
              prev.filter((item) => item !== randomBarcode)
            );
          } else {
            setScanResult({
              type: 'error',
              message: `Item ${randomBarcode} not found in inventory.`,
            });
          }
        }
      } catch (error) {
        setScanResult({
          type: 'error',
          message: error instanceof Error ? error.message : 'Scan failed',
        });
      } finally {
        setIsScanning(false);
      }
    }, 1000);
  };

  const handleManualBarcodeInput = async (barcodeId: string) => {
    if (!barcodeId.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      // Call the hook helper to trigger the workflow
      handleBarcodeScan(barcodeId);

      // Preserve local UI updates
      if (scanMode === 'add') {
        // Add Inventory workflow
        if (!scannedItems.includes(barcodeId)) {
          setScanResult({
            type: 'success',
            message: `Item ${barcodeId} scanned successfully! Ready to add to inventory.`,
          });
        } else {
          setScanResult({
            type: 'warning',
            message: `Item ${barcodeId} already scanned.`,
          });
        }
      } else if (scanMode === 'use') {
        // Use Inventory workflow - simple removal
        if (scannedItems.includes(barcodeId)) {
          setScanResult({
            type: 'success',
            message: `Item ${barcodeId} used successfully! Removed from inventory.`,
          });
          setScannedItems((prev) => prev.filter((item) => item !== barcodeId));
        } else {
          setScanResult({
            type: 'error',
            message: `Item ${barcodeId} not found in inventory.`,
          });
        }
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Manual scan failed',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const availableModes = [
    {
      id: 'add',
      name: 'Add Inventory',
      icon: mdiPlus,
      color: 'green',
      description: 'Add new items to inventory',
    },
    {
      id: 'use',
      name: 'Use Inventory',
      icon: mdiMinus,
      color: 'blue',
      description: 'Remove items from inventory',
    },
  ];

  const getScanResultIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return mdiCheckCircle;
      case 'error':
        return mdiAlertCircle;
      case 'warning':
        return mdiAlertCircle;
      default:
        return mdiBarcode;
    }
  };

  const getScanResultColor = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getScanResultBgColor = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-200';
      case 'error':
        return 'bg-red-100 border-red-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop - Shows the inventory dashboard in background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => (window.location.href = '/inventory')}
      />

      {/* Drawer */}
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
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Inventory Scanner
              </h2>
              <p className="text-gray-600 text-sm">
                Scan items for inventory management
              </p>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar">
              {!scanMode ? (
                /* Mode Selection */
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Select Operation
                  </h3>
                  <div className="space-y-3">
                    {availableModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setScanMode(mode.id as 'add' | 'use')}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          mode.color === 'green'
                            ? 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100'
                            : 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              mode.color === 'green'
                                ? 'bg-green-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            <Icon
                              path={mode.icon}
                              size={1.2}
                              className={
                                mode.color === 'green'
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              }
                            />
                          </div>
                          <div>
                            <h4
                              className={`font-semibold text-sm ${
                                mode.color === 'green'
                                  ? 'text-green-800'
                                  : 'text-blue-800'
                              }`}
                            >
                              {mode.name}
                            </h4>
                            <p
                              className={`text-xs ${
                                mode.color === 'green'
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {mode.description}
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
                  {/* Mode Info */}
                  <div
                    className={`border rounded-lg p-4 ${
                      scanMode === 'add'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-1 ${
                        scanMode === 'add' ? 'text-green-800' : 'text-blue-800'
                      }`}
                    >
                      {scanMode.charAt(0).toUpperCase() + scanMode.slice(1)}{' '}
                      Operation
                    </h3>
                    <p
                      className={`text-sm ${
                        scanMode === 'add' ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {
                        availableModes.find((m) => m.id === scanMode)
                          ?.description
                      }
                    </p>
                  </div>

                  {/* Manual Barcode Input */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label
                      htmlFor="manual-barcode-input"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Manual Barcode Entry
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="manual-barcode-input"
                        type="text"
                        placeholder="Enter barcode manually..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            handleManualBarcodeInput(input.value);
                            input.value = '';
                          }
                        }}
                        disabled={isScanning}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector(
                            'input[placeholder="Enter barcode manually..."]'
                          ) as HTMLInputElement;
                          if (input) {
                            handleManualBarcodeInput(input.value);
                            input.value = '';
                          }
                        }}
                        disabled={isScanning}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Scan
                      </button>
                    </div>
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
                            ? 'Position barcode in camera view'
                            : 'Use camera to scan item barcode'}
                        </p>
                      </div>
                    </div>

                    {/* Scan Result */}
                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-lg border ${getScanResultBgColor(scanResult.type)}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            path={getScanResultIcon(scanResult.type)}
                            size={1}
                            className={getScanResultColor(scanResult.type)}
                          />
                          <span
                            className={`font-medium ${getScanResultColor(scanResult.type)}`}
                          >
                            {scanResult.message}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Scanned Items Summary */}
                  {scannedItems.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Scanned Items ({scannedItems.length})
                      </h4>
                      <div className="space-y-1">
                        {scannedItems.map((item, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <Icon
                              path={mdiBarcode}
                              size={0.8}
                              className="text-gray-400"
                            />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setScanMode(null);
                        setScannedItems([]);
                        setScanResult(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back to Operation Selection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ScannerPage;
