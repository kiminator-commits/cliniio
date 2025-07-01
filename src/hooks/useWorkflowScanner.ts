import { useCallback } from 'react';
import { WorkflowType } from '@/types/sterilizationTypes';
import { SterilizationService } from '@/services/SterilizationService';
import { useSterilizationStore } from '@/store/sterilizationStore';

export const useWorkflowScanner = () => {
  const { updateScanResult, logScanActivity, setError } = useSterilizationStore();

  const scanWorkflow = useCallback(
    async (workflow: WorkflowType, barcode: string, isBatchMode: boolean) => {
      try {
        console.log(`[SCAN] ${workflow} → ${barcode}`);
        const result = await SterilizationService.processScan(workflow, barcode, isBatchMode);
        updateScanResult(result);
        logScanActivity({ workflow, barcode, timestamp: Date.now() });
      } catch (err: unknown) {
        console.error('Workflow scan failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown scan error');
      }
    },
    [updateScanResult, logScanActivity, setError]
  );

  return { scanWorkflow };
};
