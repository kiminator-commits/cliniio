import React from 'react';
import { usePackagingWorkflow } from './hooks/usePackagingWorkflow';
import PackagingWorkflowHeader from './components/PackagingWorkflowHeader';
import PackagingScanner from './components/PackagingScanner';
import ScannedToolsList from './components/ScannedToolsList';
import PackageInformationForm from './components/PackageInformationForm';
import OperatorInputForm from './components/OperatorInputForm';
import AutoclaveReceiptUpload from '../../AutoclaveReceiptUpload/index';

interface PackagingWorkflowProps {
  onClose: () => void;
  isBatchMode: boolean;
}

const PackagingWorkflow: React.FC<PackagingWorkflowProps> = ({
  onClose,
  isBatchMode,
}) => {
  const workflowData = usePackagingWorkflow(onClose, isBatchMode);

  // Load tools ready for packaging on component mount
  React.useEffect(() => {
    if (workflowData?.loadToolsReadyForPackaging) {
      workflowData.loadToolsReadyForPackaging();
    }
  }, [workflowData]);

  // Guard against undefined store data
  if (!workflowData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packaging workflow...</p>
        </div>
      </div>
    );
  }

  const {
    // State
    operatorName,
    scannedBarcode,
    scanMessage,
    scanResult,
    packageInfo,
    showPackageForm,
    showReceiptUpload,
    scannedTools,
    batchLoading,
    currentPackagingSession,
    availableTools,

    // Actions
    setOperatorName,
    setScannedBarcode,
    setPackageInfo,
    setShowPackageForm,
    handleScan,
    simulateScan,
    handleNewAutoclaveLoad,
    handleImportReceipt,
    handleReceiptUploadSuccess,
    handleReceiptUploadCancel,
    handleFinalizePackage,
    handleEndSession,
    handleRemoveTool,
    handleStartSession,
  } = workflowData;

  // Show operator input form if no current packaging session
  if (!currentPackagingSession) {
    return (
      <OperatorInputForm
        operatorName={operatorName}
        onOperatorNameChange={setOperatorName}
        onStartSession={handleStartSession}
        onCancel={onClose}
      />
    );
  }

  // Show receipt upload modal if requested
  if (showReceiptUpload) {
    return (
      <AutoclaveReceiptUpload
        batchCode={currentPackagingSession.currentBatchId || ''}
        operator={operatorName}
        onSuccess={handleReceiptUploadSuccess}
        onCancel={handleReceiptUploadCancel}
      />
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <PackagingWorkflowHeader
        operatorName={operatorName}
        isBatchMode={isBatchMode}
        onEndSession={handleEndSession}
      />

      <PackagingScanner
        scannedBarcode={scannedBarcode}
        scanMessage={scanMessage}
        scanResult={scanResult}
        onScan={handleScan}
        onBarcodeChange={setScannedBarcode}
        onSimulateScan={simulateScan}
        onNewAutoclaveLoad={handleNewAutoclaveLoad}
        onImportReceipt={handleImportReceipt}
        currentBatchCode={currentPackagingSession.currentBatchId || undefined}
        availableTools={availableTools}
      />

      <ScannedToolsList
        scannedTools={scannedTools}
        onRemoveTool={handleRemoveTool}
        onFinalizePackage={() => setShowPackageForm(true)}
      />

      {showPackageForm && (
        <PackageInformationForm
          packageInfo={packageInfo}
          batchLoading={batchLoading}
          onPackageInfoChange={setPackageInfo}
          onFinalizePackage={handleFinalizePackage}
          onCancel={() => setShowPackageForm(false)}
        />
      )}

      {/* Session Info */}
      <div className="text-sm text-gray-600">
        <p>Session ID: {currentPackagingSession?.id}</p>
        <p>
          Started: {currentPackagingSession?.startTime.toLocaleTimeString()}
        </p>
        <p>Tools Ready: {availableTools.length}</p>
      </div>
    </div>
  );
};

export default PackagingWorkflow;
