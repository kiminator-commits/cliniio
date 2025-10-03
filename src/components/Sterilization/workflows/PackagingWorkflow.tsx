import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiDelete,
  mdiCheckCircle,
  mdiIdentifier,
  mdiAlertCircle,
} from '@mdi/js';
import { Tool } from '@/types/sterilizationTypes';
import { PackagingService } from '@/services/packagingService';

interface PackagingWorkflowProps {
  onClose: () => void;
}

interface ScanMessage {
  type: 'success' | 'error';
  text: string;
}

export default function PackagingWorkflow({ onClose }: PackagingWorkflowProps) {
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<ScanMessage | null>(null);
  const [scannedTools, setScannedTools] = useState<Tool[]>([]);
  const [ciAdded, setCiAdded] = useState(false);
  const [uniquePackageId, setUniquePackageId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolsReadyForPackaging, setToolsReadyForPackaging] = useState<Tool[]>(
    []
  );
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  // Load tools ready for packaging from Supabase
  useEffect(() => {
    const loadToolsReadyForPackaging = async () => {
      try {
        setIsLoadingTools(true);

        // Add a small delay to ensure authentication is ready
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const tools = await PackagingService.getToolsReadyForPackaging();
        setToolsReadyForPackaging(tools);
        setScanMessage(null); // Clear any previous error messages
      } catch (error) {
        console.error('Error loading tools ready for packaging:', error);

        // If authentication error, show a more user-friendly message
        if (
          error instanceof Error &&
          error.message.includes('not authenticated')
        ) {
          setScanMessage({
            type: 'error',
            text: 'Please wait while authentication loads, or refresh the page.',
          });
        } else {
          setScanMessage({
            type: 'error',
            text: 'Failed to load tools ready for packaging. Please try again.',
          });
        }

        // Set empty array to prevent further errors
        setToolsReadyForPackaging([]);
      } finally {
        setIsLoadingTools(false);
      }
    };

    loadToolsReadyForPackaging();
  }, []);

  // Manual retry function
  const handleRetryLoadTools = useCallback(async () => {
    try {
      setIsLoadingTools(true);
      setScanMessage(null);

      const tools = await PackagingService.getToolsReadyForPackaging();
      setToolsReadyForPackaging(tools);
    } catch (error) {
      console.error('Error retrying load tools:', error);
      setScanMessage({
        type: 'error',
        text: 'Failed to load tools. Please check your connection and try again.',
      });
      setToolsReadyForPackaging([]);
    } finally {
      setIsLoadingTools(false);
    }
  }, []);

  // Find the tool by barcode from tools ready for packaging
  const findToolByBarcode = useCallback(
    (barcode: string) => {
      return toolsReadyForPackaging.find((tool) => tool.barcode === barcode);
    },
    [toolsReadyForPackaging]
  );

  // Handle tool scanning
  const handleScanTool = useCallback(async () => {
    if (toolsReadyForPackaging.length === 0) {
      setScanMessage({
        type: 'error',
        text: 'No tools available for packaging. Please check tool status.',
      });
      return;
    }

    setIsScanning(true);
    setScanMessage(null);

    try {
      // Simulate scanning delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use real barcodes from tools ready for packaging
      const availableBarcodes = toolsReadyForPackaging
        .filter((tool) => tool.barcode)
        .map((tool) => tool.barcode!);

      if (availableBarcodes.length === 0) {
        setScanMessage({
          type: 'error',
          text: 'No tools with barcodes available for packaging.',
        });
        return;
      }

      // Simulate a barcode scan - in real implementation this would come from scanner
      const randomBarcode =
        availableBarcodes[Math.floor(Math.random() * availableBarcodes.length)];

      const foundTool = findToolByBarcode(randomBarcode);

      if (!foundTool) {
        setScanMessage({
          type: 'error',
          text: `Tool with barcode "${randomBarcode}" not found in packaging-ready tools.`,
        });
        return;
      }

      // Check if tool is already scanned
      if (scannedTools.find((t) => t.id === foundTool.id)) {
        setScanMessage({
          type: 'error',
          text: `Tool "${foundTool.name}" already scanned.`,
        });
        return;
      }

      // Add tool to scanned tools
      setScannedTools((prev) => [...prev, foundTool]);
      setScanMessage({
        type: 'success',
        text: `Tool "${foundTool.name}" added to package.`,
      });

      // In batch mode, continue scanning automatically
      if (scanMode === 'batch') {
        setTimeout(() => {
          if (scannedTools.length < toolsReadyForPackaging.length - 1) {
            handleScanTool();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error scanning tool:', error);
      setScanMessage({
        type: 'error',
        text: 'Scanning failed. Please try again.',
      });
    } finally {
      setIsScanning(false);
    }
  }, [findToolByBarcode, scannedTools, scanMode, toolsReadyForPackaging]);

  // Clear scanned tools
  const clearScannedTools = useCallback(() => {
    setScannedTools([]);
    setScanMessage(null);
  }, []);

  // Handle CI button
  const handleCIButton = useCallback(() => {
    setCiAdded(true);
    setScanMessage({
      type: 'success',
      text: 'Chemical Indicator added to package.',
    });
  }, []);

  // Handle Unique Package ID button
  const handleUniquePackageId = useCallback(() => {
    // Generate simple ID: PKG-001, PKG-002, etc.
    const randomNum = Math.floor(Math.random() * 999) + 1; // 1-999
    const newId = `PKG-${randomNum.toString().padStart(3, '0')}`;
    setUniquePackageId(newId);
    setScanMessage({
      type: 'success',
      text: `Unique Package ID generated: ${newId}`,
    });
  }, []);

  // Handle Done button - now creates package in Supabase
  const handleDone = useCallback(async () => {
    if (scannedTools.length === 0) {
      setScanMessage({
        type: 'error',
        text: 'No tools scanned. Please scan tools first.',
      });
      return;
    }

    if (!ciAdded) {
      setScanMessage({
        type: 'error',
        text: 'Chemical Indicator must be added before completing package.',
      });
      return;
    }

    if (!uniquePackageId) {
      setScanMessage({
        type: 'error',
        text: 'Unique Package ID must be generated before completing package.',
      });
      return;
    }

    setIsProcessing(true);
    setScanMessage({
      type: 'success',
      text: 'Creating package in database...',
    });

    try {
      // Create package in Supabase
      const result = await PackagingService.createPackage(
        scannedTools.map((t) => t.id),
        {
          packageType: 'pouch', // Default package type
          packageSize: 'standard', // Default package size
          notes: `Package created with ${scannedTools.length} tools. CI: ${ciAdded ? 'Added' : 'Not added'}. ID: ${uniquePackageId}`,
        },
        'Operator' // Default operator name
      );

      if (result.success) {
        setScanMessage({
          type: 'success',
          text: `Package created successfully! ID: ${result.packageId}`,
        });

        // Refresh tools ready for packaging
        const updatedTools = await PackagingService.getToolsReadyForPackaging();
        setToolsReadyForPackaging(updatedTools);

        // Close workflow after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setScanMessage({
          type: 'error',
          text: `Failed to create package: ${result.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating package:', error);
      setScanMessage({
        type: 'error',
        text: 'Error creating package. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [scannedTools, ciAdded, uniquePackageId, onClose]);

  // Handle delete tool
  const handleDeleteTool = useCallback((toolId: string) => {
    setScannedTools((prev) => prev.filter((tool) => tool.id !== toolId));
  }, []);

  return (
    <div className="space-y-4 pb-8">
      {/* Workflow Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="font-semibold text-purple-800 text-sm">
          Packaging Workflow
        </h3>
        <p className="text-purple-600 text-xs">
          {isLoadingTools
            ? 'Loading tools ready for packaging...'
            : `${toolsReadyForPackaging.length} tools ready for packaging`}
        </p>
        {toolsReadyForPackaging.length > 0 && (
          <p className="text-purple-500 text-xs mt-1">
            Available barcodes:{' '}
            {toolsReadyForPackaging
              .slice(0, 3)
              .map((t) => t.barcode)
              .join(', ')}
            {toolsReadyForPackaging.length > 3 && '...'}
          </p>
        )}
        {!isLoadingTools &&
          toolsReadyForPackaging.length === 0 &&
          scanMessage?.type === 'error' && (
            <button
              onClick={handleRetryLoadTools}
              className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
            >
              Retry Load Tools
            </button>
          )}
      </div>

      {/* Scan Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setScanMode('single');
            clearScannedTools();
          }}
          disabled={isProcessing || isLoadingTools}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            scanMode === 'single'
              ? 'bg-blue-500 text-white'
              : isProcessing || isLoadingTools
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Single Scan
        </button>
        <button
          onClick={() => {
            setScanMode('batch');
            clearScannedTools();
          }}
          disabled={isProcessing || isLoadingTools}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            scanMode === 'batch'
              ? 'bg-green-500 text-white'
              : isProcessing || isLoadingTools
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Batch Scan
        </button>
      </div>

      {/* Scan Interface */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center space-y-3">
          {/* Camera Viewfinder */}
          <div className="relative bg-black rounded-lg h-32 flex items-center justify-center">
            {/* Viewfinder corners */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-32 h-24 rounded-lg">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#4ECDC4] rounded-tl"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#4ECDC4] rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#4ECDC4] rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#4ECDC4] rounded-br"></div>
            </div>

            {/* Camera status indicator */}
            <div className="absolute bottom-2 right-2 flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></div>
              <span className="text-white text-xs">Camera active</span>
            </div>

            {/* Scan Button Overlay */}
            <button
              onClick={handleScanTool}
              disabled={
                isScanning ||
                isProcessing ||
                isLoadingTools ||
                toolsReadyForPackaging.length === 0
              }
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-200 ${
                isScanning ||
                isProcessing ||
                isLoadingTools ||
                toolsReadyForPackaging.length === 0
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#4ECDC4] hover:bg-[#3db8b0] shadow-lg hover:shadow-xl'
              }`}
            >
              <Icon
                path={mdiBarcode}
                size={1.2}
                className={`${isScanning || isProcessing || isLoadingTools || toolsReadyForPackaging.length === 0 ? 'text-gray-400' : 'text-white'}`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-800 mb-1">
              {isScanning ? 'Scanning...' : 'Click to Scan'}
            </h3>
            <p className="text-gray-600 text-xs">
              {isScanning
                ? 'Position barcode in camera view'
                : isLoadingTools
                  ? 'Loading tools...'
                  : toolsReadyForPackaging.length === 0
                    ? 'No tools ready for packaging'
                    : `Use camera to scan tool barcode (${scanMode} mode)`}
            </p>
          </div>
        </div>

        {/* Scan Result */}
        {scanMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-3 rounded-lg ${
              scanMessage.type === 'success'
                ? 'bg-green-100 border border-green-200'
                : 'bg-red-100 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon
                path={mdiBarcode}
                size={0.8}
                className={
                  scanMessage.type === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              />
              <span
                className={`font-medium text-sm ${
                  scanMessage.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {scanMessage.text}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Scanned Tools List */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-800 text-sm">
          Scanned Tools ({scannedTools.length})
        </h4>
        {scannedTools.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded text-center">
            <Icon
              path={mdiBarcode}
              size={1.5}
              className="text-gray-400 mx-auto mb-1"
            />
            <p className="text-gray-500 text-sm">No tools scanned yet</p>
            <p className="text-xs text-gray-400">
              Use the scanner above to add tools
            </p>
          </div>
        ) : (
          <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-hide hide-scrollbar">
            {scannedTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between bg-gray-100 p-2 rounded"
              >
                <div>
                  <span className="font-medium text-sm">{tool.name}</span>
                  <span className="text-gray-600 text-xs ml-2">
                    ({tool.barcode})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteTool(tool.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove tool"
                >
                  <Icon path={mdiDelete} size={0.7} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Status */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-800 text-sm">Package Status</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon
              path={ciAdded ? mdiCheckCircle : mdiAlertCircle}
              size={0.8}
              className={ciAdded ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={`text-sm ${ciAdded ? 'text-green-700' : 'text-gray-500'}`}
            >
              Chemical Indicator: {ciAdded ? 'Added' : 'Not Added'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Icon
              path={uniquePackageId ? mdiCheckCircle : mdiIdentifier}
              size={0.8}
              className={uniquePackageId ? 'text-green-600' : 'text-gray-400'}
            />
            <span
              className={`text-sm ${uniquePackageId ? 'text-green-700' : 'text-gray-500'}`}
            >
              Package ID: {uniquePackageId || 'Not Generated'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCIButton}
          disabled={ciAdded || isProcessing}
          className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
            ciAdded
              ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
              : isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {ciAdded ? 'CI Added ✓' : 'CI Button'}
        </button>
        <button
          onClick={handleUniquePackageId}
          disabled={!!uniquePackageId || isProcessing}
          className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
            uniquePackageId
              ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
              : isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {uniquePackageId ? 'ID Generated ✓' : 'Unique Package ID'}
        </button>
        <button
          onClick={handleDone}
          disabled={
            scannedTools.length === 0 ||
            !ciAdded ||
            !uniquePackageId ||
            isProcessing
          }
          className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
            scannedTools.length === 0 ||
            !ciAdded ||
            !uniquePackageId ||
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Done'}
        </button>
      </div>

      {/* Back Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
        >
          ← Back to Workflow Selection
        </button>
      </div>
    </div>
  );
}
