import { useState } from 'react';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { WorkflowService as _WorkflowService } from '../../../../services/workflowService';

export interface ScannerState {
  currentSessionId: string | null;
  isScanning: boolean;
  scanResult: 'success' | 'error' | null;
}

export const useScannerState = () => {
  const {
    workflowType,
    setWorkflowType,
    scannedData,
    setScannedData,
    availableTools,
    addToolToCycle,
  } = useSterilizationStore();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );

  const handleWorkflowSelect = async (workflow: string) => {
    setWorkflowType(workflow);

    // Start workflow session (mock implementation)
    try {
      const session = {
        id: `session-${Date.now()}`,
        workflowType: workflow,
        startedAt: new Date().toISOString(),
      };
      setCurrentSessionId(session.id);
    } catch (err) {
      console.error(err);
      // Error handling without console logging
    }
  };

  const handleBackToWorkflow = async () => {
    setWorkflowType('');
    setIsScanning(false);
    setScannedData('');

    // End workflow session (mock implementation)
    if (currentSessionId) {
      try {
        // Mock end session - just clear the session ID
        setCurrentSessionId(null);
      } catch (err) {
        console.error(err);
        // Error handling without console logging
      }
    }
  };

  const handleScan = async (barcode: string, onClose: () => void) => {
    if (!workflowType) return;

    setIsScanning(true);
    setScanResult(null);
    setScannedData(`Scanning tool for ${workflowType} workflow...`);

    // Simulate scanning
    setTimeout(async (): Promise<void> => {
      const tool = availableTools.find((t) => t.barcode === barcode);

      if (tool) {
        // Only add tool to cycle for non-problem workflows
        if (workflowType !== 'problem') {
          addToolToCycle(tool.id);
        }
        setScanResult('success');
        setScannedData(
          `Successfully processed ${tool.name} for ${workflowType} workflow`
        );

        // Log workflow event (mock implementation)
        if (currentSessionId) {
          try {
            // TODO: Implement tool logging when WorkflowService.addTool is available
            console.log('Tool scanned:', tool.id, tool.name, tool.barcode, workflowType);
          } catch (err) {
            console.error(err);
            // Error handling without console logging
          }
        }

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setScanResult('error');
        setScannedData('Tool not found or already in cycle');
      }

      setIsScanning(false);
    }, 1000);
  };

  return {
    workflowType,
    scannedData,
    currentSessionId,
    isScanning,
    scanResult,
    handleWorkflowSelect,
    handleBackToWorkflow,
    handleScan,
  };
};
