import { useCallback } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';

type ScanningWorkflowType = 'sterilization' | 'inventory' | 'tracking';

interface ScanResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

export const useWorkflowScanner = () => {
  const { setScannedData, setError } = useSterilizationStore();

  const scanWorkflow = useCallback(
    async (
      workflow: ScanningWorkflowType,
      barcode: string
    ): Promise<ScanResult> => {
      try {
        console.log(`[SCAN] ${workflow} → ${barcode}`);

        // Validate barcode format
        if (!barcode || barcode.trim().length === 0) {
          throw new Error('Invalid barcode: Empty or null value');
        }

        // Process scan based on workflow type
        let scanData;
        switch (workflow) {
          case 'sterilization':
            scanData = await processSterilizationScan(barcode);
            break;
          case 'inventory':
            scanData = await processInventoryScan(barcode);
            break;
          case 'tracking':
            scanData = await processTrackingScan(barcode);
            break;
          default:
            throw new Error(`Unsupported workflow type: ${workflow}`);
        }

        // Update store with scanned data
        setScannedData(barcode);

        const result: ScanResult = {
          success: true,
          data: scanData,
          timestamp: new Date().toISOString(),
        };

        console.log(`[SCAN SUCCESS] ${workflow} → ${barcode}`, scanData);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown scan error';
        console.error('Workflow scan failed:', err);
        setError(errorMessage);

        const result: ScanResult = {
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };

        return result;
      }
    },
    [setScannedData, setError]
  );

  return { scanWorkflow };
};

/**
 * Process sterilization workflow scan
 */
async function processSterilizationScan(
  barcode: string
): Promise<Record<string, unknown>> {
  // Validate sterilization barcode format (e.g., STER-YYYYMMDD-XXXX)
  const sterilizationPattern = /^STER-\d{8}-\d{4}$/;
  if (!sterilizationPattern.test(barcode)) {
    throw new Error('Invalid sterilization barcode format');
  }

  // Extract sterilization cycle information
  const [, dateStr, cycleId] = barcode.split('-');
  const cycleDate = new Date(
    parseInt(dateStr.substring(0, 4)),
    parseInt(dateStr.substring(4, 6)) - 1,
    parseInt(dateStr.substring(6, 8))
  );

  return {
    type: 'sterilization',
    cycleId,
    cycleDate: cycleDate.toISOString(),
    barcode,
    status: 'validated',
  };
}

/**
 * Process inventory workflow scan
 */
async function processInventoryScan(
  barcode: string
): Promise<Record<string, unknown>> {
  // Validate inventory barcode format (e.g., INV-XXXXX-YYYY)
  const inventoryPattern = /^INV-[A-Z0-9]{5}-\d{3}$/;
  if (!inventoryPattern.test(barcode)) {
    throw new Error('Invalid inventory barcode format');
  }

  // Extract inventory item information
  const [, itemCode, quantity] = barcode.split('-');

  return {
    type: 'inventory',
    itemCode,
    quantity: parseInt(quantity),
    barcode,
    status: 'validated',
  };
}

/**
 * Process tracking workflow scan
 */
async function processTrackingScan(
  barcode: string
): Promise<Record<string, unknown>> {
  // Validate tracking barcode format (e.g., TRK-XXXXX-YYYYMMDD)
  const trackingPattern = /^TRK-[A-Z0-9]{5}-\d{8}$/;
  if (!trackingPattern.test(barcode)) {
    throw new Error('Invalid tracking barcode format');
  }

  // Extract tracking information
  const [, trackingId, dateStr] = barcode.split('-');
  const trackingDate = new Date(
    parseInt(dateStr.substring(0, 4)),
    parseInt(dateStr.substring(4, 6)) - 1,
    parseInt(dateStr.substring(6, 8))
  );

  return {
    type: 'tracking',
    trackingId,
    trackingDate: trackingDate.toISOString(),
    barcode,
    status: 'validated',
  };
}
