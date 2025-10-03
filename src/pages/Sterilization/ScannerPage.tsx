/**
 * ⚠️ CRITICAL: DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER CONSENT ⚠️
 *
 * This sterilization scanner page contains:
 * - Sliding drawer functionality (motion.div with right-0 positioning)
 * - Multiple workflow interfaces (import, problem, clean, packaging, dirty)
 * - Working buttons and interactive function
 * - Original sliding behavior and container structure
 *
 * ANY CHANGES TO THIS FILE REQUIRE EXPLICIT USER PERMISSION
 * DO NOT: Remove workflows, change sliding behavior, modify button functionality
 * DO NOT: Convert to modal, simplify component, or alter core architecture
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode, mdiDelete, mdiAlertCircle } from '@mdi/js';
import { useScannerPage } from '../../hooks/useScannerPage';
import { WorkflowSelector } from '../../components/Sterilization/WorkflowSelector';
import { WorkflowInfo } from '../../components/Sterilization/WorkflowInfo';
import { ScannerInterface } from '../../components/Sterilization/ScannerInterface';
import AutoclaveReceiptUpload from '../../components/Sterilization/AutoclaveReceiptUpload/index';
import ToolProblemWorkflow from '../../components/Sterilization/workflows/ToolProblemWorkflow/index';
import CleanWorkflow from '../../components/Sterilization/workflows/CleanWorkflow';
import PackagingWorkflow from '../../components/Sterilization/workflows/PackagingWorkflow/index';
import { ToolReplacementAlert } from '../../components/Sterilization/ToolReplacementAlert';

const ScannerPage: React.FC = memo(() => {
  const {
    selectedWorkflow,
    scannedData,
    showWorkflowResult,
    scanMode,
    isScanning,
    scanMessage,
    scannedTools,
    dirtyScanMessage,
    isBath1Active,
    replacementAlert,

    // Actions
    handleWorkflowSelect,
    handleBackToWorkflow,
    handleScan,
    handleCloseWorkflow,
    handleReceiptUploadSuccess,
    handleReceiptUploadCancel,
    handleDeleteTool,
    handleCancelAll,
    handleSendScannedToBath1,
    handleScanModeChange,
    handleScanTool,
    handleReplaceTool,
    handleContinueAnyway,
    handleDismissReplacementAlert,
  } = useScannerPage();

  return (
    <>
      {/* Backdrop - Shows the sterilization dashboard in background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => window.history.back()}
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
                Sterilization Scanner
              </h2>
              <p className="text-gray-600 text-sm">
                Scan tools for sterilization workflows
              </p>
            </div>

            {/* Content */}
            <div
              className="p-4 overflow-y-auto flex-1 hide-scrollbar"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              {!selectedWorkflow ? (
                /* Workflow Selection */
                <WorkflowSelector onWorkflowSelect={handleWorkflowSelect} />
              ) : selectedWorkflow === 'import' ? (
                /* Import Autoclave Receipt Workflow */
                <div>
                  <AutoclaveReceiptUpload
                    batchCode=""
                    operator=""
                    onSuccess={handleReceiptUploadSuccess}
                    onCancel={handleReceiptUploadCancel}
                  />
                </div>
              ) : selectedWorkflow === 'problem' ? (
                /* Tool Problem Workflow */
                <div>
                  <ToolProblemWorkflow onClose={handleBackToWorkflow} />
                </div>
              ) : selectedWorkflow === 'clean' && showWorkflowResult ? (
                /* Clean Workflow Result */
                <div>
                  <CleanWorkflow
                    scannedData={scannedData}
                    onClose={handleCloseWorkflow}
                  />
                </div>
              ) : selectedWorkflow === 'packaging' ? (
                /* Packaging Workflow */
                <div>
                  <PackagingWorkflow
                    onClose={handleBackToWorkflow}
                    isBatchMode={scanMode === 'batch'}
                  />
                </div>
              ) : selectedWorkflow === 'dirty' ? (
                /* Dirty Workflow */
                <div className="space-y-4">
                  {/* Workflow Info */}
                  <WorkflowInfo workflowId="dirty" color="orange" />
                  {isBath1Active && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-1">
                        <Icon
                          path={mdiAlertCircle}
                          size={0.8}
                          className="text-red-600"
                        />
                        <span className="text-red-700 text-xs font-medium">
                          Bath 1 is currently active
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tool Replacement Alert */}
                  {replacementAlert.show && replacementAlert.tool && (
                    <ToolReplacementAlert
                      tool={replacementAlert.tool}
                      onDismiss={handleDismissReplacementAlert}
                      onReplace={handleReplaceTool}
                      onContinue={handleContinueAnyway}
                    />
                  )}

                  {/* Scan Mode Selection */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScanModeChange('single')}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        scanMode === 'single'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Single Scan
                    </button>
                    <button
                      onClick={() => handleScanModeChange('batch')}
                      className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        scanMode === 'batch'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Batch Scan
                    </button>
                  </div>

                  {/* Scan Interface */}
                  <ScannerInterface
                    isScanning={isScanning}
                    scanMessage={dirtyScanMessage}
                    onScan={handleScanTool}
                    size="small"
                  />

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
                        <p className="text-gray-500 text-sm">
                          No tools scanned yet
                        </p>
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
                              <span className="font-medium text-sm">
                                {tool.name}
                              </span>
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

                  {/* Bath 1 Status Warning */}
                  {isBath1Active && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <Icon
                          path={mdiAlertCircle}
                          size={1}
                          className="text-orange-600"
                        />
                        <span className="text-orange-800 text-sm font-medium">
                          ⚠️ Bath 1 timer is already in process
                        </span>
                      </div>
                      <p className="text-orange-600 text-xs mt-1">
                        Please wait for the current Bath 1 phase to complete
                        before starting a new one.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelAll}
                      disabled={scannedTools.length === 0}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scannedTools.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendScannedToBath1}
                      disabled={scannedTools.length === 0 || isBath1Active}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scannedTools.length === 0 || isBath1Active
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
                      }`}
                      title={
                        isBath1Active
                          ? 'Bath 1 timer is already in process'
                          : undefined
                      }
                    >
                      Send to Bath 1
                    </button>
                  </div>

                  {/* Back Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleBackToWorkflow}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      ← Back to Workflow Selection
                    </button>
                  </div>
                </div>
              ) : (
                /* Scanner Interface */
                <div className="space-y-6">
                  {/* Workflow Info */}
                  <WorkflowInfo workflowId={selectedWorkflow} color="blue" />

                  {/* Scan Interface */}
                  <ScannerInterface
                    isScanning={isScanning}
                    scanMessage={scanMessage}
                    onScan={handleScan}
                    size="large"
                  />

                  {/* Back Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleBackToWorkflow}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Back to Workflow Selection
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
});

ScannerPage.displayName = 'ScannerPage';

export default ScannerPage;
