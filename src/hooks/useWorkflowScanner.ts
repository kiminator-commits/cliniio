import { useCallback } from 'react';
import { sterilizationWorkflowService } from '@/services/sterilization/sterilizationWorkflowService';
import { environmentalService } from '@/services/environmental/environmentalService';

interface ScanResult {
  type: 'sterilization' | 'environmental' | 'unknown';
  code: string;
  timestamp: string;
}

export function useWorkflowScanner() {
  const handleScan = useCallback(
    async (scannedCode: string): Promise<ScanResult> => {
      const timestamp = new Date().toISOString();
      console.info('🔍 Workflow scan received:', scannedCode);

      try {
        // Determine the scan domain by prefix or pattern
        if (scannedCode.startsWith('ST-')) {
          console.info('Routing to sterilization workflow');
          await sterilizationWorkflowService.processScan(scannedCode);
          return { type: 'sterilization', code: scannedCode, timestamp };
        }

        if (scannedCode.startsWith('EC-')) {
          console.info('Routing to environmental cleaning workflow');
          await environmentalService.processScan(scannedCode);
          return { type: 'environmental', code: scannedCode, timestamp };
        }

        console.warn('Unrecognized scan pattern:', scannedCode);
        return { type: 'unknown', code: scannedCode, timestamp };
      } catch (err: unknown) {
        console.error(
          'Error processing scan:',
          err instanceof Error ? err.message : String(err)
        );
        return { type: 'unknown', code: scannedCode, timestamp };
      }
    },
    []
  );

  return { handleScan };
}
