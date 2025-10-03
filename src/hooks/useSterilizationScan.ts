import { useState } from 'react';
import { useSterilizationStore } from '../store/sterilizationStore';
import { SterilizationService } from '../services/SterilizationService';
import { ToolService } from '../services/toolService';
import { WorkflowType } from '../config/workflowConfig';

export const useSterilizationScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );
  const [scanMessage, setScanMessage] = useState('');
  const { availableTools, addToolToCycle } = useSterilizationStore();

  const simulateScan = async (
    workflow: WorkflowType,
    onClose: () => void,
    isBatchMode = false
  ) => {
    setIsScanning(true);
    setScanMessage(`Scanning tool for ${workflow} workflow...`);

    try {
      // For clean workflow, use Supabase service
      if (workflow === 'clean') {
        // Simulate a barcode scan - in real implementation this would come from scanner
        const demoBarcodes = ['FORC001', 'RETR001', 'SCAL002', 'ENT001'];
        const randomBarcode =
          demoBarcodes[Math.floor(Math.random() * demoBarcodes.length)];

        const result =
          await ToolService.scanToolForCleanWorkflow(randomBarcode);
        setScannedCode(result.tool?.barcode || '');

        if (result.success && result.tool) {
          addToolToCycle(result.tool.id);
          setScanResult('success');
          setScanMessage(result.message);
          if (!isBatchMode) setTimeout(onClose, 2000);
        } else {
          setScanResult('error');
          setScanMessage(result.message);
        }
      } else {
        // For other workflows, use the existing service
        setTimeout(() => {
          const result = SterilizationService.scanTool(
            workflow,
            availableTools
          );
          setScannedCode(result.tool?.barcode || '');

          if (result.success && result.tool) {
            addToolToCycle(result.tool.id);
            setScanResult('success');
            setScanMessage(result.message);
            if (!isBatchMode) setTimeout(onClose, 2000);
          } else {
            setScanResult('error');
            setScanMessage(result.message);
          }

          setIsScanning(false);
        }, 1000);
        return; // Exit early for non-clean workflows
      }
    } catch (error) {
      console.error('Error during scan:', error);
      setScanResult('error');
      setScanMessage('An unexpected error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  };

  return {
    isScanning,
    scannedCode,
    scanResult,
    scanMessage,
    simulateScan,
  };
};
