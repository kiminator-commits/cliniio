import { useState, useCallback } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { Tool } from '@/types/sterilizationTypes';
import { PackagingService } from '@/services/packagingService';

// ✅ Connected to packagingSessionSlice for real batching and session control

interface LocalPackageInfo {
  packageType: string;
  packageSize: string;
  notes: string;
}

export const usePackagingWorkflow = (
  onClose: () => void,
  isBatchMode: boolean
) => {
  // ✅ Connected to packagingSessionSlice for real batching and session control
  const {
    currentSession,
    startPackagingSession,
    addToolToSession,
    removeToolFromSession,
    generateBatchId,
    assignBatchIdToSession,
    endPackagingSession,
  } = useSterilizationStore();

  // Local state - must be called before any early returns
  const [operatorName, setOperatorName] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );
  const [packageInfo, setPackageInfo] = useState<LocalPackageInfo>({
    packageType: '',
    packageSize: '',
    notes: '',
  });
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [scannedTools, setScannedTools] = useState<Tool[]>([]);

  // Extract other store data with defaults to avoid destructuring errors
  const currentBatch =
    useSterilizationStore((state) => state.currentBatch) || null;
  const batchLoading =
    useSterilizationStore((state) => state.batchLoading) || false;

  // Load tools ready for packaging from Supabase
  const loadToolsReadyForPackaging = useCallback(async () => {
    try {
      const tools = await PackagingService.getToolsReadyForPackaging();
      setAvailableTools(tools);
    } catch (error) {
      console.error('Error loading tools ready for packaging:', error);
      setScanMessage('Error loading tools ready for packaging');
    }
  }, []);

  // Handle barcode scanning
  const handleScan = useCallback(
    async (barcode: string) => {
      setScannedBarcode(barcode);
      setScanResult(null);
      setScanMessage('Processing scan...');

      // Find tool by barcode
      const tool = availableTools.find((t) => t.barcode === barcode);

      if (!tool) {
        setScanResult('error');
        setScanMessage('Tool not found or not ready for packaging');
        return;
      }

      // Check if tool is already scanned
      if (scannedTools.find((t) => t.id === tool.id)) {
        setScanResult('error');
        setScanMessage('Tool already added to package');
        return;
      }

      // Add tool to scanned tools
      setScannedTools((prev) => [...prev, tool]);

      // ✅ Connected to packagingSessionSlice for real batching and session control
      // Add tool barcode to session
      addToolToSession(barcode);

      // If in batch mode, also add to batch
      if (isBatchMode && currentBatch) {
        const addToolToBatch = useSterilizationStore.getState().addToolToBatch;
        addToolToBatch(tool.id);
      }

      setScanResult('success');
      setScanMessage(`Successfully added ${tool.name} to package`);

      // Clear scan after 2 seconds
      setTimeout(() => {
        setScannedBarcode('');
        setScanMessage('');
        setScanResult(null);
      }, 2000);
    },
    [availableTools, scannedTools, addToolToSession, isBatchMode, currentBatch]
  );

  // Simulate scanning for demo
  const simulateScan = useCallback(() => {
    if (availableTools.length === 0) {
      setScanResult('error');
      setScanMessage('No tools available for packaging');
      return;
    }

    const randomTool =
      availableTools[Math.floor(Math.random() * availableTools.length)];
    handleScan(randomTool.barcode);
  }, [availableTools, handleScan]);

  // Handle new autoclave load
  const handleNewAutoclaveLoad = useCallback(
    async (batchPrefix?: string) => {
      if (!currentSession) {
        setScanMessage('Please start a packaging session first');
        return;
      }

      try {
        setScanMessage('Creating new autoclave load...');

        // ✅ Connected to packagingSessionSlice for real batching and session control
        // Generate batch ID and assign to session
        const batchId = batchPrefix
          ? `${batchPrefix}${Math.floor(1000 + Math.random() * 9000)}`
          : generateBatchId();
        // ✅ Dynamic batch prefix from Packaging Settings
        assignBatchIdToSession(batchId);

        const createBatch = useSterilizationStore.getState().createBatch;
        await createBatch(operatorName, true);
        setScanMessage('New autoclave load created successfully!');

        // Clear message after 2 seconds
        setTimeout(() => {
          setScanMessage('');
        }, 2000);
      } catch (error) {
        setScanMessage('Error creating new autoclave load');
        console.error('Error creating new autoclave load:', error);
      }
    },
    [currentSession, operatorName, generateBatchId, assignBatchIdToSession]
  );

  // Handle import receipt
  const handleImportReceipt = useCallback(() => {
    if (!currentBatch?.batchCode) {
      setScanMessage('Please create a batch first before uploading receipts');
      return;
    }
    setShowReceiptUpload(true);
  }, [currentBatch?.batchCode]);

  // Handle receipt upload success
  const handleReceiptUploadSuccess = useCallback(() => {
    setShowReceiptUpload(false);
    setScanMessage('Receipt uploaded successfully!');

    // Clear message after 2 seconds
    setTimeout(() => {
      setScanMessage('');
    }, 2000);
  }, []);

  // Handle receipt upload cancel
  const handleReceiptUploadCancel = useCallback(() => {
    setShowReceiptUpload(false);
  }, []);

  // Handle finalize package
  const handleFinalizePackage = useCallback(async () => {
    if (scannedTools.length === 0) {
      setScanMessage('No tools selected for packaging');
      return;
    }

    if (!packageInfo.packageType) {
      setScanMessage('Please select a package type');
      return;
    }

    try {
      setScanMessage('Creating package...');

      const result = await PackagingService.createPackage(
        scannedTools.map((t) => t.id),
        packageInfo,
        operatorName
      );

      if (result.success) {
        setScanMessage(result.message);

        // Clear scanned tools
        setScannedTools([]);
        setShowPackageForm(false);

        // Reload available tools
        await loadToolsReadyForPackaging();

        // Close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setScanMessage(result.message);
      }
    } catch (error) {
      console.error('Error finalizing package:', error);
      setScanMessage('Error creating package. Please try again.');
    }
  }, [
    scannedTools,
    packageInfo,
    operatorName,
    loadToolsReadyForPackaging,
    onClose,
  ]);

  // Handle end session
  const handleEndSession = useCallback(() => {
    endPackagingSession();
    setScannedTools([]);
    setScanMessage('');
    setScanResult(null);
    onClose();
  }, [endPackagingSession, onClose]);

  // Handle remove tool
  const handleRemoveTool = useCallback(
    (toolId: string) => {
      const tool = scannedTools.find((t) => t.id === toolId);
      if (tool) {
        setScannedTools((prev) => prev.filter((t) => t.id !== toolId));

        // ✅ Connected to packagingSessionSlice for real batching and session control
        // Remove tool barcode from session
        removeToolFromSession(tool.barcode);

        if (isBatchMode && currentBatch) {
          const removeToolFromBatch =
            useSterilizationStore.getState().removeToolFromBatch;
          removeToolFromBatch(toolId);
        }
      }
    },
    [scannedTools, removeToolFromSession, isBatchMode, currentBatch]
  );

  // Handle start session
  const handleStartSession = useCallback(() => {
    if (!operatorName.trim()) {
      setScanMessage('Please enter operator name');
      return;
    }

    // ✅ Connected to packagingSessionSlice for real batching and session control
    // Start packaging session with operator name and facility ID
    const facilityId = 'default-facility'; // TODO: Get from context or props
    startPackagingSession(operatorName, facilityId);
  }, [operatorName, startPackagingSession]);

  return {
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
    loadToolsReadyForPackaging,
  };
};
