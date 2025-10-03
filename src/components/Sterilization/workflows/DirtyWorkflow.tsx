import React, { useEffect } from 'react';
import {
  useDirtyWorkflowState,
  WorkflowHeader,
  ScanMessageDisplay,
  CriticalAlert,
  ScanInterface,
  CurrentToolDisplay,
  DirtyToolsList,
  ActionButtons,
} from './DirtyWorkflow/index';

interface DirtyWorkflowProps {
  scannedData: string;
  onBeginCycle: () => void;
  onClose?: () => void;
}

export default function DirtyWorkflow({
  scannedData,
  onBeginCycle,
  onClose,
}: DirtyWorkflowProps) {
  const {
    // State
    isScanning,
    scanMessage,
    dirtyTools,
    currentTool,
    isProcessing,
    cycleStarted,
    showBarcodeInfo,

    // Actions
    setShowBarcodeInfo,
    handleScanBarcode,
    handleManualBarcodeEntry,
    removeDirtyTool,
    clearAllDirtyTools,
    handleSendToBath1,
    resetCycle,
    simulateScan,
  } = useDirtyWorkflowState(onBeginCycle);

  // Handle scanned data from props
  useEffect(() => {
    if (scannedData && scannedData.trim()) {
      handleScanBarcode(scannedData);
    }
  }, [scannedData, handleScanBarcode]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <WorkflowHeader
        showBarcodeInfo={showBarcodeInfo}
        onToggleBarcodeInfo={() => setShowBarcodeInfo(!showBarcodeInfo)}
        onClose={onClose}
      />

      <ScanMessageDisplay scanMessage={scanMessage} />
      <CriticalAlert scanMessage={scanMessage} />

      <ScanInterface
        isScanning={isScanning}
        onManualBarcodeEntry={handleManualBarcodeEntry}
        onSimulateScan={simulateScan}
        isProcessing={isProcessing}
      />

      <CurrentToolDisplay currentTool={currentTool} />

      <DirtyToolsList
        dirtyTools={dirtyTools}
        onRemoveTool={removeDirtyTool}
        onClearAll={clearAllDirtyTools}
      />

      <ActionButtons
        dirtyToolsCount={dirtyTools.length}
        isProcessing={isProcessing}
        cycleStarted={cycleStarted}
        onSendToBath1={handleSendToBath1}
        onResetCycle={resetCycle}
      />
    </div>
  );
}
