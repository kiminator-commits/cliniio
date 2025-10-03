import { useEffect, useCallback, useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { ToolService } from '@/services/toolService';

interface UseCleanWorkflowProps {
  scannedData: string;
  toolId?: string;
}

/**
 * Custom hook for managing CleanWorkflow business logic.
 * Handles tool status updates and logging with Supabase integration.
 */
export const useCleanWorkflow = ({
  scannedData,
  toolId,
}: UseCleanWorkflowProps) => {
  const { markToolAsDirty, availableTools } = useSterilizationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Find the tool by barcode if toolId is not provided
  const findToolByBarcode = useCallback(
    (barcode: string) => {
      return availableTools.find((tool) => tool.barcode === barcode);
    },
    [availableTools]
  );

  useEffect(() => {
    if (!scannedData) return;

    const processCleanWorkflowScan = async () => {
      setIsProcessing(true);
      setScanResult(null);

      try {
        // Use Supabase service to scan tool and update status
        const result = await ToolService.scanToolForCleanWorkflow(scannedData);

        if (result.success && result.tool) {
          // Update local state to reflect the change
          markToolAsDirty(result.tool.id);

          setScanResult({
            success: true,
            message: result.message,
          });
        } else {
          setScanResult({
            success: false,
            message: result.message,
          });
        }
      } catch (error) {
        console.error('Error processing clean workflow scan:', error);
        setScanResult({
          success: false,
          message: 'An unexpected error occurred while processing the scan.',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Only process if we have scanned data and the tool is in complete phase
    const tool = toolId
      ? availableTools.find((t) => t.id === toolId)
      : findToolByBarcode(scannedData);

    if (tool && tool.currentPhase === 'complete') {
      processCleanWorkflowScan();
    } else if (tool && scannedData) {
      setScanResult({
        success: false,
        message: `Tool "${tool.name}" is not ready for clean workflow. Current status: ${tool.currentPhase}`,
      });
    }
  }, [scannedData, toolId, availableTools, markToolAsDirty, findToolByBarcode]);

  return {
    isProcessing,
    scanResult,
  };
};
