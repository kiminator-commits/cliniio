import { useState } from 'react';
import { useSterilizationStore } from '../store/sterilizationStore';
import { useSterilizationScan } from './useSterilizationScan';
import { useDirtyWorkflow } from '../components/Sterilization/workflows/hooks/useDirtyWorkflow';
import { WorkflowType } from '../config/workflowConfig';
import { AutoclaveReceipt } from '../types/sterilizationTypes';

export const useScannerPage = () => {
  const { setWorkflowType, setScannedData, scannedData } =
    useSterilizationStore();
  const { isScanning, scanResult, scanMessage, simulateScan } =
    useSterilizationScan();

  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [showWorkflowResult, setShowWorkflowResult] = useState(false);
  const [scanMode, setScanMode] = useState<'single' | 'batch'>('single');

  const handleWorkflowSelect = (workflow: string) => {
    console.log('ScannerPage: Workflow selected:', workflow);
    setSelectedWorkflow(workflow);
    setWorkflowType(workflow);
    setShowWorkflowResult(false);
  };

  const handleBackToWorkflow = () => {
    console.log('🔧 handleBackToWorkflow called');
    setSelectedWorkflow('');
    setWorkflowType('');
    setScannedData('');
    setShowWorkflowResult(false);
    // Return to workflow selection within the scanner page
    console.log('🔧 Returning to workflow selection...');
  };

  // Initialize dirty workflow hook after handleBackToWorkflow is defined
  const {
    scannedTools,
    handleSendToBath1,
    handleScanTool,
    scanMessage: dirtyScanMessage,
    isBath1Active,
    clearScannedTools,
    replacementAlert,
    handleReplaceTool,
    handleContinueAnyway,
    handleDismissReplacementAlert,
  } = useDirtyWorkflow({
    scannedData: scannedData || '',
    onClose: () => {
      console.log(
        '🔧 Dirty workflow onClose called - navigating back to sterilization page'
      );
      window.history.back();
    },
    batchMode: scanMode === 'batch',
  });

  const handleScan = () => {
    if (!selectedWorkflow) return;

    // For clean workflow, we'll show the workflow result after scanning
    if (selectedWorkflow === 'clean') {
      simulateScan(
        selectedWorkflow as WorkflowType,
        () => {
          // After successful scan, show the workflow result
          setTimeout(() => {
            setShowWorkflowResult(true);
          }, 1000);
        },
        false
      );
    } else {
      simulateScan(selectedWorkflow as WorkflowType, () => {}, false);
    }
  };

  const handleCloseWorkflow = () => {
    setShowWorkflowResult(false);
    handleBackToWorkflow();
  };

  // Handle receipt upload success
  const handleReceiptUploadSuccess = (receipt: AutoclaveReceipt) => {
    console.log('Receipt uploaded successfully:', receipt);
    // You could navigate back or show a success message
    window.history.back();
  };

  // Handle receipt upload cancel
  const handleReceiptUploadCancel = () => {
    handleBackToWorkflow();
  };

  // Dirty workflow functions
  const handleDeleteTool = (id: string) => {
    // The hook manages scannedTools internally, so we'll need to filter it
    // This is a simplified approach - in a real implementation, you'd want to add a removeTool function to the hook
    console.log('Delete tool:', id);
  };

  const handleCancelAll = () => {
    clearScannedTools();
    console.log('Cancel all tools');
  };

  const handleSendScannedToBath1 = () => {
    console.log('🧪 scannedTools.length:', scannedTools.length);
    console.log('🧪 handleSendToBath1:', typeof handleSendToBath1);
    handleSendToBath1(scannedTools); // ✅ pass in current scannedTools directly
  };

  const handleScanModeChange = (mode: 'single' | 'batch') => {
    setScanMode(mode);
    // Clear scanned tools when switching modes
    clearScannedTools();
  };

  return {
    // State
    selectedWorkflow,
    showWorkflowResult,
    scanMode,
    isScanning,
    scanResult,
    scanMessage,
    scannedData,
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
    clearScannedTools,
  };
};
