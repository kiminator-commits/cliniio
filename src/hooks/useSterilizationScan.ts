import { useState } from 'react';
import { useSterilizationStore } from '../store/sterilizationStore';
import { SterilizationService } from '../services/SterilizationService';

type WorkflowType = 'clean' | 'dirty' | 'damaged' | 'import' | 'packaging' | null;

export const useSterilizationScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [scanMessage, setScanMessage] = useState('');
  const { availableTools, addToolToCycle } = useSterilizationStore();

  const simulateScan = (workflow: WorkflowType, onClose: () => void, isBatchMode = false) => {
    setIsScanning(true);
    setScanMessage(`Scanning tool for ${workflow} workflow...`);

    setTimeout(() => {
      const result = SterilizationService.scanTool(workflow, availableTools);
      setScannedCode(result.tool?.barcode || '');

      if (result.success && result.tool) {
        addToolToCycle(result.tool.id, 'bath1');
        setScanResult('success');
        setScanMessage(result.message);
        if (!isBatchMode) setTimeout(onClose, 2000);
      } else {
        setScanResult('error');
        setScanMessage(result.message);
      }

      setIsScanning(false);
    }, 1000);
  };

  return {
    isScanning,
    scannedCode,
    scanResult,
    scanMessage,
    simulateScan,
  };
};
