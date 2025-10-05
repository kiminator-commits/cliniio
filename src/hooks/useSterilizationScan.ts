import { useState } from 'react';
import { useSterilizationStore } from '../store/sterilizationStore';
import { SterilizationService } from '../services/SterilizationService';
import { ToolService } from '../services/toolService';
import { WorkflowType } from '../config/workflowConfig';
import { supabase } from '../lib/supabaseClient';

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
        // Get clean tools from database instead of hardcoded barcodes
        const { data: cleanTools } = await supabase
          .from('tools')
          .select('barcode')
          .eq('status', 'clean')
          .eq('facility_id', '550e8400-e29b-41d4-a716-446655440000')
          .limit(10);

        // If no clean tools found, use mock data for testing
        let barcodeToUse: string;
        if (!cleanTools || cleanTools.length === 0) {
          console.log(
            '🧪 No clean tools found in database, using mock data for testing'
          );
          barcodeToUse = 'TEST-CLEAN-001'; // Mock barcode for testing
        } else {
          barcodeToUse =
            cleanTools[Math.floor(Math.random() * cleanTools.length)].barcode;
        }

        const result = await ToolService.scanToolForCleanWorkflow(barcodeToUse);
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
