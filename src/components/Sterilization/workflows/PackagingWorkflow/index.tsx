import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import { logReceiptUploaded } from '@/utils/auditLogger';
import { usePackagingWorkflow } from './hooks/usePackagingWorkflow';
import PackagingWorkflowHeader from './components/PackagingWorkflowHeader';
import PackagingScanner from './components/PackagingScanner';
import ScannedToolsList from './components/ScannedToolsList';
import PackageInformationForm from './components/PackageInformationForm';
import OperatorInputForm from './components/OperatorInputForm';
import AutoclaveReceiptUpload from '../../AutoclaveReceiptUpload/index';
import { AutoclaveReceipt } from '@/types/receiptTypes';

interface PackagingWorkflowProps {
  onClose: () => void;
  isBatchMode: boolean;
}

const PackagingWorkflow: React.FC<PackagingWorkflowProps> = ({
  onClose,
  isBatchMode,
}) => {
  const { currentUser } = useUser();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [packageTypes, setPackageTypes] = useState<string[]>([
    'pouch',
    'wrap',
    'container',
    'tray',
  ]);
  const [packageSizes, setPackageSizes] = useState<string[]>([
    'small',
    'medium',
    'large',
    'extra-large',
  ]);
  const [batchPrefix, setBatchPrefix] = useState('PKG-');
  const [maxToolsPerBatch, setMaxToolsPerBatch] = useState(25);
  const [requireReceiptUpload, setRequireReceiptUpload] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState<{
    url: string;
    id?: string;
  } | null>(null);

  // ✅ Loads facility-specific Packaging Settings (types, sizes, prefix, limits)
  useEffect(() => {
    const loadPackagingSettings = async () => {
      try {
        if (!currentUser?.facility_id) return;
        const { data, error } = await supabase
          .from('facility_settings')
          .select('packaging_settings')
          .eq('facility_id', currentUser.facility_id)
          .single();

        if (error) {
          console.warn('No packaging settings found, using defaults');
        } else if (data?.packaging_settings) {
          const s = data.packaging_settings;
          setPackageTypes((prev) => s.packageTypes || prev);
          setPackageSizes((prev) => s.packageSizes || prev);
          setBatchPrefix((prev) => s.batchPrefix || prev);
          setMaxToolsPerBatch((prev) => s.maxToolsPerBatch || prev);
          setRequireReceiptUpload(!!s.requireReceiptUpload);
        }
      } catch (err) {
        console.error('Error loading packaging settings:', err);
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadPackagingSettings();
  }, [currentUser]);

  const workflowData = usePackagingWorkflow(onClose, isBatchMode);

  // Load tools ready for packaging on component mount
  React.useEffect(() => {
    if (workflowData?.loadToolsReadyForPackaging) {
      workflowData.loadToolsReadyForPackaging();
    }
  }, [workflowData]);

  // Wrapper function to add batch size validation
  const handleScanWithValidation = (barcode: string) => {
    // ✅ Prevent adding tools beyond facility-defined maxToolsPerBatch limit
    if (scannedTools.length >= maxToolsPerBatch) {
      alert(
        `❗ Maximum batch size reached. You can only package up to ${maxToolsPerBatch} tools per batch.`
      );
      return;
    }
    // ✅ Enforce Packaging Settings batch size limit
    workflowData?.handleScan(barcode);
  };

  // Wrapper function to handle receipt upload success and track receipt
  const handleReceiptUploadSuccessWithTracking = async (
    receipt: AutoclaveReceipt
  ) => {
    setUploadedReceipt({ url: receipt.photoUrl, id: receipt.id });
    // ✅ Log RECEIPT_UPLOADED event for Packaging Workflow
    try {
      if (
        receipt &&
        currentSession?.currentBatchId &&
        currentUser?.facility_id
      ) {
        await logReceiptUploaded(
          receipt.id || receipt.photoUrl || 'unknown',
          currentSession.currentBatchId,
          currentUser?.name || 'Unknown Operator',
          currentUser.facility_id
        );
      }
    } catch (err) {
      console.error('Failed to log receipt upload audit event:', err);
    }
    workflowData?.handleReceiptUploadSuccess();
  };

  // Wrapper function to add receipt upload validation before finalizing
  const handleFinalizePackageWithValidation = () => {
    // ✅ Block batch completion until receipt is uploaded (enforced by Packaging Settings)
    // ✅ Require receipt upload before batch finalization (if enabled)
    if (requireReceiptUpload && (!uploadedReceipt || !uploadedReceipt.url)) {
      alert('📄 Receipt upload required before completing this batch.');
      return;
    }
    workflowData?.handleFinalizePackage();
  };

  if (!settingsLoaded)
    return (
      <p className="text-sm text-gray-500">Loading Packaging Settings...</p>
    );

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
    currentSession,
    availableTools,
    isAssigning,
    locationCode,
    locationStatus,

    // Actions
    setOperatorName,
    setScannedBarcode,
    setPackageInfo,
    setShowPackageForm,
    setLocationCode,
    setIsAssigning,
    handleScan: _handleScan,
    simulateScan,
    handleNewAutoclaveLoad,
    handleImportReceipt,
    handleReceiptUploadSuccess: _handleReceiptUploadSuccess,
    handleReceiptUploadCancel,
    handleFinalizePackage: _handleFinalizePackage,
    handleAssignLocation,
    handleEndSession,
    handleRemoveTool,
    handleStartSession,
  } = workflowData;

  // Show operator input form if no current packaging session
  if (!currentSession) {
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
        batchCode={currentSession.currentBatchId || ''}
        operator={operatorName}
        onSuccess={handleReceiptUploadSuccessWithTracking}
        onCancel={handleReceiptUploadCancel}
      />
    );
  }

  // Show room assignment modal if requested
  if (isAssigning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4">
        <div className="bg-white rounded-xl overflow-hidden w-full max-w-md shadow-2xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Room Assignment
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Scan or enter location barcode:
                </label>
                <input
                  id="location"
                  type="text"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  placeholder="e.g., ROOM-1-CUPBOARD-A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAssigning(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Assign Location
                </button>
              </div>
              {locationStatus && (
                <p className="text-sm text-gray-600">
                  Location Status: {locationStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
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
        onScan={handleScanWithValidation}
        onBarcodeChange={setScannedBarcode}
        onSimulateScan={simulateScan}
        onNewAutoclaveLoad={() => handleNewAutoclaveLoad(batchPrefix)}
        onImportReceipt={handleImportReceipt}
        currentBatchCode={currentSession.currentBatchId || undefined}
        availableTools={availableTools}
      />

      <ScannedToolsList
        scannedTools={scannedTools}
        onRemoveTool={handleRemoveTool}
        onFinalizePackage={() => setShowPackageForm(true)}
      />

      {/* ✅ Visual reminder for required receipt upload (per Packaging Settings) */}
      {requireReceiptUpload && !uploadedReceipt && (
        <div className="mb-4 rounded-md bg-yellow-100 border border-yellow-300 px-4 py-3 text-sm text-yellow-800 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-yellow-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Receipt upload required before finalizing this batch.</span>
        </div>
      )}

      {showPackageForm && (
        <PackageInformationForm
          packageInfo={packageInfo}
          batchLoading={batchLoading}
          onPackageInfoChange={setPackageInfo}
          onFinalizePackage={handleFinalizePackageWithValidation}
          onCancel={() => setShowPackageForm(false)}
          packageTypes={packageTypes}
          packageSizes={packageSizes}
        />
      )}

      {/* Session Info */}
      <div className="text-sm text-gray-600">
        <p>Session ID: {currentSession?.id}</p>
        <p>
          Started:{' '}
          {currentSession?.startedAt
            ? new Date(currentSession.startedAt).toLocaleTimeString()
            : 'N/A'}
        </p>
        <p>Tools Ready: {availableTools.length}</p>
      </div>
    </div>
  );
};

export default PackagingWorkflow;
