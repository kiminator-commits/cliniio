import { useEffect, useCallback, useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { getCurrentTraceabilityCode } from '@/utils/generateTraceabilityCode';

interface UseCleanWorkflowWithTraceabilityProps {
  scannedData: string;
  toolId?: string;
}

export const useCleanWorkflowWithTraceability = ({
  scannedData,
  toolId,
}: UseCleanWorkflowWithTraceabilityProps) => {
  const { availableTools } = useSterilizationStore();
  const [traceabilityCode] = useState(getCurrentTraceabilityCode());
  const [copied, setCopied] = useState(false);

  // Find the tool by barcode if toolId is not provided
  const findToolByBarcode = useCallback(
    (barcode: string) => {
      return availableTools.find((tool) => tool.barcode === barcode);
    },
    [availableTools]
  );

  // Get the current tool
  const getCurrentTool = useCallback(() => {
    return toolId
      ? availableTools.find((t) => t.id === toolId)
      : findToolByBarcode(scannedData);
  }, [toolId, availableTools, findToolByBarcode, scannedData]);

  useEffect(() => {
    const tool = getCurrentTool();

    if (tool && tool.currentPhase === 'complete' && scannedData) {
      // Tool marking functionality would go here
      console.log(`Tool ${tool.id} marked as dirty`);
    }
  }, [scannedData, getCurrentTool, traceabilityCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(traceabilityCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return {
    tool: getCurrentTool(),
    traceabilityCode,
    copied,
    handleCopyCode,
  };
};
