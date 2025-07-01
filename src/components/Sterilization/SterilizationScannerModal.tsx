import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiClose,
  mdiCheck,
  mdiAlert,
  mdiCamera,
  mdiSpray,
  mdiWashingMachine,
  mdiAlertCircle,
  mdiArrowLeft,
  mdiPackageVariant,
  mdiFileDocument,
  mdiPackage,
} from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { workflowConfig, WorkflowType, PHASE_CONFIG } from '../../config/workflowConfig';
import { logSterilizationEvent } from '@/utils/auditLogger';
import { ScanWorkflowSection } from './ScanWorkflowSection';
import WorkflowComponent from './workflows/WorkflowComponent';
import {
  toolMetadataTags,
  updateToolMetadata,
  getToolMetadataSnapshot,
} from '@/hooks/usePhaseTimer';

const isValidOperator = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length >= 2;
};

const isValidBarcode = (code: string): boolean => {
  const regex = /^[A-Z]{4}[0-9]{3}$/; // Example: SCAL001
  return regex.test(code.trim());
};

const safeExecute = async (fn: () => Promise<void>, context: string) => {
  try {
    await fn();
  } catch (err) {
    console.error(`Sterilization error in ${context}:`, err);
    // Optionally: log error to Supabase or show a UI toast later
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleScanSubmit = async (operator: string, barcode: string, phase: string) => {
  if (!isValidOperator(operator) || !isValidBarcode(barcode)) return;

  await safeExecute(async () => {
    const phaseInfo = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];

    logSterilizationEvent({
      timestamp: new Date().toISOString(),
      action: 'TOOL_SCANNED',
      operator,
      toolId: barcode,
      phase,
      metadata: {
        requiresCI: phaseInfo?.requiresCI ?? false,
        requiresBI: phaseInfo?.requiresBI ?? false,
      },
    });

    // Existing logic continues...
  }, 'handleScanSubmit');
};

const SterilizationScannerModal: React.FC = () => {
  const {
    isModalOpen,
    setModalOpen,
    workflowType,
    setWorkflowType,
    scannedData,
    setScannedData,
    availableTools,
    currentCycle,
    addToolToCycle,
    startNewCycle,
  } = useSterilizationStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showUniqueId, setShowUniqueId] = useState(false);
  const [uniqueTrackingId, setUniqueTrackingId] = useState('');
  const [isPackageBatching, setIsPackageBatching] = useState(false);
  const [isAutoclaveBatching, setIsAutoclaveBatching] = useState(false);
  const [manualKitId, setManualKitId] = useState('');
  const [error, setError] = useState<string>('');
  const [toolStatus, setToolStatus] = useState<'clean' | 'dirty' | 'problem'>('clean');

  const availableWorkflows = useMemo(() => {
    return Object.entries(workflowConfig)
      .filter(([, config]) => config.isAvailable)
      .map(([key]) => key as WorkflowType);
  }, []);

  const getWorkflowConfig = (workflow: WorkflowType | null) => {
    if (!workflow || !workflowConfig[workflow]) {
      return workflowConfig.default;
    }
    return workflowConfig[workflow];
  };

  const workflowStyle = useMemo(() => {
    const config = getWorkflowConfig(workflowType as WorkflowType);
    return `mb-6 p-4 ${config?.bgColor} border ${config?.borderColor} rounded-lg`;
  }, [workflowType]);

  useEffect(() => {
    if (isModalOpen) {
      setWorkflowType('');
      setIsScanning(false);
      setScanResult(null);
      setScannedData('');
      setIsBatchMode(false);
      setIsPackageBatching(false);
      setIsAutoclaveBatching(false);
      setManualKitId('');
      setError('');
    }
  }, [isModalOpen, setWorkflowType, setScannedData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setModalOpen]);

  const handleWorkflowSelect = (workflow: WorkflowType) => {
    console.log('Workflow selected:', workflow);
    if (workflow) {
      setWorkflowType(workflow);
    }
  };

  const handleBackToWorkflow = () => {
    setWorkflowType('');
    setIsScanning(false);
    setScannedData('');
  };

  const handleScan = () => {
    if (!workflowType) return;

    // Check for operator identity before proceeding
    const operatorName = currentCycle?.operator || 'Current User';
    if (!operatorName || operatorName.trim().length < 2) {
      alert('Operator name must be set before proceeding.');
      return;
    }

    setError('');
    setIsScanning(true);
    setScannedData(`Scanning tool for ${workflowType} workflow...`);

    // Automatically load mock data for testing
    setTimeout(() => {
      // Create a cycle if none exists with automatic user info
      if (!currentCycle) {
        console.log('Creating new cycle...');
        const currentUser = 'Current User'; // In real app, get from auth context
        startNewCycle(currentUser);
      }

      // Generate a random barcode for demo
      const demoBarcodes = ['SCAL001', 'FORC001', 'RETR001', 'SCAL002', 'FORC002'];
      const randomBarcode = demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];

      console.log('Selected barcode:', randomBarcode);
      console.log('Tool metadata:', toolMetadataTags);
      updateToolMetadata({ sanitizedByAi: true });
      updateToolMetadata({ validatedByOperator: true });
      getToolMetadataSnapshot();

      if (!isValidBarcode(randomBarcode)) {
        setError('Invalid barcode format.');
        return;
      }

      // Determine tool status from barcode (programmatic logic)
      let determinedToolStatus: 'clean' | 'dirty' | 'problem' = 'clean';
      if (randomBarcode.includes('SCAL')) {
        determinedToolStatus = 'clean';
      } else if (randomBarcode.includes('FORC')) {
        determinedToolStatus = 'dirty';
      } else if (randomBarcode.includes('RETR')) {
        determinedToolStatus = 'problem';
      }
      setToolStatus(determinedToolStatus);

      // Check if tool exists and is available
      const tool = availableTools.find(t => t.barcode === randomBarcode);
      console.log('Found tool:', tool);

      if (tool) {
        console.log('Adding tool to cycle:', tool.id);
        // Add tool to cycle based on workflow
        addToolToCycle(tool.id);
        setScanResult('success');
        setScannedData(`Successfully processed ${tool.name} for ${workflowType} workflow`);

        // Auto-close after success (only in single mode)
        if (!isBatchMode) {
          setTimeout(() => {
            setModalOpen(false);
          }, 2000);
        }
      } else {
        console.log('Tool not found!');
        setScanResult('error');
        setScannedData('Tool not found or already in cycle');
      }

      setIsScanning(false);
    }, 1000); // Short delay to show scanning animation
  };

  // Generate a random tracking ID
  const generateUniqueId = () => {
    if (showUniqueId) {
      // Hide the ID if it's already showing
      setShowUniqueId(false);
      setUniqueTrackingId('');
    } else {
      // Show a new ID if it's not showing
      const fourDigitCode = Math.floor(1000 + Math.random() * 9000).toString();
      setUniqueTrackingId(fourDigitCode);
      setShowUniqueId(true);

      // Log the tracking ID
      console.log('Generated 4-digit tracking code for patient chart linking:', fourDigitCode);
    }
  };

  if (!isModalOpen) return null;

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
        onClick={() => setModalOpen(false)}
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
              {workflowType && (
                <button
                  onClick={handleBackToWorkflow}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Icon path={mdiArrowLeft} size={1.2} className="text-gray-500" />
                </button>
              )}
              <h3 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
                <Icon path={mdiBarcode} size={1.2} className="text-[#4ECDC4] mr-3" />
                {workflowType
                  ? (() => {
                      const config = getWorkflowConfig(workflowType as WorkflowType);
                      return 'title' in config ? config.title : 'Workflow';
                    })()
                  : 'Tool Processing Workflow'}
              </h3>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon path={mdiClose} size={1.2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
            {!workflowType ? (
              /* Workflow Selection */
              <div className="space-y-2">
                <p className="text-gray-600 text-sm mb-3">
                  Select the type of tool processing workflow you want to perform:
                </p>

                {/* Clean Tool */}
                {availableWorkflows.includes('clean') && (
                  <button
                    onClick={() => handleWorkflowSelect('clean')}
                    className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Icon path={mdiSpray} size={1.2} className="text-green-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-green-800 text-sm">Clean Tool</h4>
                        <p className="text-xs text-green-600">Ready to use on patients</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Dirty Tool */}
                {availableWorkflows.includes('dirty') && (
                  <button
                    onClick={() => handleWorkflowSelect('dirty')}
                    className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <Icon path={mdiWashingMachine} size={1.2} className="text-orange-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-orange-800 text-sm">Dirty Tool</h4>
                        <p className="text-xs text-orange-600">
                          Ready to go through the cleaning process
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Autoclave */}
                {availableWorkflows.includes('packaging') && (
                  <button
                    onClick={() => handleWorkflowSelect('packaging')}
                    className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Icon path={mdiPackage} size={1.2} className="text-purple-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-purple-800 text-sm">Autoclave</h4>
                        <p className="text-xs text-purple-600">
                          Tools that are ready for autoclave processing
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Damaged Tool */}
                {availableWorkflows.includes('damaged') && (
                  <button
                    onClick={() => handleWorkflowSelect('damaged')}
                    className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-red-100 rounded-lg">
                        <Icon path={mdiAlertCircle} size={1.2} className="text-red-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-red-800 text-sm">Damaged Tool</h4>
                        <p className="text-xs text-red-600">Tools needing repair/replacement</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Import Autoclave Receipt */}
                {availableWorkflows.includes('import') && (
                  <button
                    onClick={() => handleWorkflowSelect('import')}
                    className="w-full p-3 rounded-lg border-2 transition-all duration-200 border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Icon path={mdiFileDocument} size={1.2} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-800 text-sm">
                          Import Autoclave Receipt
                        </h4>
                        <p className="text-xs text-blue-600">
                          Import physical autoclave cycle documentation
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              /* Scanner Interface */
              <div>
                {/* Workflow Info */}
                <div className={workflowStyle}>
                  <div className="flex items-center gap-3">
                    <Icon
                      path={getWorkflowConfig(workflowType as WorkflowType)?.icon || mdiBarcode}
                      size={1.5}
                      className={`text-${(() => {
                        const config = getWorkflowConfig(workflowType as WorkflowType);
                        return 'color' in config ? config.color : 'gray';
                      })()}-500`}
                    />
                    <div>
                      <h4
                        className={`text-sm font-medium ${(() => {
                          const config = getWorkflowConfig(workflowType as WorkflowType);
                          return 'textColor' in config ? config.textColor : 'text-gray-600';
                        })()}`}
                      >
                        {(() => {
                          const config = getWorkflowConfig(workflowType as WorkflowType);
                          return 'title' in config ? config.title : 'Workflow';
                        })()}
                      </h4>
                      <p
                        className={`text-xs ${(() => {
                          const config = getWorkflowConfig(workflowType as WorkflowType);
                          return 'textColor' in config ? config.textColor : 'text-gray-600';
                        })()} opacity-80`}
                      >
                        {(() => {
                          const config = getWorkflowConfig(workflowType as WorkflowType);
                          return 'description' in config
                            ? config.description
                            : 'No description available';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clean Workflow */}
                {workflowType === 'clean' && (
                  <WorkflowComponent toolStatus={toolStatus} onClose={() => setModalOpen(false)} />
                )}

                {/* Dirty Workflow */}
                {workflowType === 'dirty' && (
                  <WorkflowComponent toolStatus={toolStatus} onClose={handleScan} />
                )}

                {/* Problem Workflow */}
                {workflowType === 'problem' && (
                  <WorkflowComponent toolStatus={toolStatus} onClose={handleScan} />
                )}

                {/* 2P Workflow */}
                {workflowType === '2P' && (
                  <WorkflowComponent toolStatus={toolStatus} onClose={handleScan} />
                )}

                {/* Batch Mode Toggle */}
                {workflowType !== 'import' && workflowType !== 'damaged' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="space-y-4">
                      {/* Package Batching Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon path={mdiPackageVariant} size={1} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Package Batching</p>
                            <p className="text-xs text-gray-500">
                              {isPackageBatching
                                ? 'Batch processing for packaging'
                                : 'Single tool packaging'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsPackageBatching(!isPackageBatching)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isPackageBatching ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isPackageBatching ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Autoclave Batching Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon path={mdiWashingMachine} size={1} className="text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">Autoclave Batching</p>
                            <p className="text-xs text-gray-500">
                              {isAutoclaveBatching
                                ? 'Batch processing for autoclave'
                                : 'Single tool autoclave'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsAutoclaveBatching(!isAutoclaveBatching)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isAutoclaveBatching ? 'bg-[#4ECDC4]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isAutoclaveBatching ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Kit ID Section */}
                      {workflowType !== 'dirty' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={generateUniqueId}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-all"
                          >
                            Kit ID
                          </button>
                          <input
                            type="text"
                            placeholder="Enter Kit ID manually"
                            value={manualKitId}
                            onChange={e => setManualKitId(e.target.value)}
                            className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            aria-label="Kit ID input"
                          />
                        </div>
                      )}
                    </div>
                    {showUniqueId && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                        <p className="text-xs text-gray-600">
                          {workflowType === 'packaging' ? 'Kit ID: ' : 'Tracking ID: '}
                          <span className="font-mono font-bold text-green-700">
                            {uniqueTrackingId}
                          </span>
                        </p>
                        {workflowType === 'packaging' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Write this ID on the packaging with CI
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Camera Viewfinder */}
                {workflowType !== 'import' ? (
                  <div
                    className="relative bg-black h-48 rounded-lg overflow-hidden mb-6 cursor-pointer"
                    onClick={handleScan}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleScan();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Scan barcode"
                  >
                    {/* Camera feed simulation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>

                    {/* Scanning animation */}
                    {isScanning && (
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
                    )}

                    {/* Barcode outline */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-48 h-32 rounded-lg">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#4ECDC4] rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4ECDC4] rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#4ECDC4] rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#4ECDC4] rounded-br"></div>
                    </div>

                    {/* Camera status indicator */}
                    <div
                      role="region"
                      aria-label="Sterilization status and timers"
                      className="absolute bottom-4 right-4 flex items-center"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${isScanning ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
                      ></div>
                      <span className="text-white text-xs">
                        {isScanning ? 'Camera active' : 'Camera ready'}
                      </span>
                    </div>

                    {/* Scan result overlay */}
                    {scanResult && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center ${
                          scanResult === 'success'
                            ? 'bg-green-500 bg-opacity-20'
                            : 'bg-red-500 bg-opacity-20'
                        }`}
                      >
                        <div className="text-center">
                          <Icon
                            path={scanResult === 'success' ? mdiCheck : mdiAlert}
                            size={3}
                            className={scanResult === 'success' ? 'text-green-400' : 'text-red-400'}
                          />
                          <p
                            className={`text-sm font-medium mt-2 ${
                              scanResult === 'success' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {scanResult === 'success' ? 'Success!' : 'Error'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* File Upload Interface for Import */
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                      <Icon path={mdiCamera} size={3} className="text-blue-500 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-blue-800 mb-2">
                        Import Autoclave Receipt
                      </h4>
                      <p className="text-sm text-blue-600 mb-4">
                        Take a photo of the physical autoclave cycle documentation
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={handleScan}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Icon path={mdiCamera} size={1} />
                          Take Photo
                        </button>
                        <button className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Icon path={mdiFileDocument} size={1} />
                          Choose from Gallery
                        </button>
                      </div>
                      <p className="text-xs text-blue-500 mt-3">
                        Ensure the receipt is clearly visible and well-lit
                      </p>
                    </div>
                  </div>
                )}

                {/* Scan Controls */}
                <div className="space-y-4">
                  {/* ScanWorkflowSection Component */}
                  <ScanWorkflowSection
                    operator="Current User"
                    barcode="SCAL001"
                    phase="bath1"
                    onScan={toolId => {
                      console.log('Tool scanned:', toolId);
                      // Add tool to sterilization store
                      addToolToCycle(toolId);
                    }}
                  />

                  {/* Available Tools */}
                  {workflowType !== 'import' && (
                    <div>
                      <label
                        htmlFor="available-tools"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Available Tools for Scanning
                      </label>
                      <div
                        id="available-tools"
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto"
                      >
                        {availableTools.length > 0 ? (
                          <div className="space-y-2">
                            {availableTools.map(tool => (
                              <div
                                key={tool.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="font-medium text-gray-800">{tool.name}</span>
                                <span className="text-gray-500 font-mono">{tool.barcode}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No tools available for scanning</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scan Result Message */}
                  {scannedData && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        scanResult === 'success'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {scannedData}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-xs text-gray-500">
              {workflowType ? (
                workflowType === 'import' ? (
                  <>
                    <span>Position receipt within camera frame</span>
                    <span>Ensure good lighting and focus</span>
                  </>
                ) : (
                  <>
                    <span>Position barcode within the frame</span>
                    <span>Camera will scan automatically</span>
                  </>
                )
              ) : (
                <>
                  <span>Select a workflow to begin</span>
                  <span>Cycle will be created automatically</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default SterilizationScannerModal;
