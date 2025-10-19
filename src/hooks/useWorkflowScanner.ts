import { useState, useCallback } from 'react';
import { notifyDuplicateBarcode, notifyMissingItem } from '@/services/inventory/inventoryFeedbackService';
import { uploadScannedItems } from '@/services/inventory/inventoryDataTransfer';
import { logger } from '@/services/loggerService';

export function useWorkflowScanner() {
interface ScannedItem {
  id: string;
  barcode: string;
  name: string;
  status: string;
  timestamp: string;
}

  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [processing, setProcessing] = useState(false);

  // ✅ Normalizes barcode (trims, uppercases)
  const normalizeBarcode = useCallback((code: string) => {
    return code.trim().toUpperCase();
  }, []);

  // ✅ Main scan handler
  const handleScan = useCallback(
    async (rawBarcode: string) => {
      const barcode = normalizeBarcode(rawBarcode);
      if (!barcode) return;

      // Duplicate check
      const isDuplicate = scannedItems.some((i) => i.barcode === barcode);
      if (isDuplicate) {
        notifyDuplicateBarcode(barcode);
        return;
      }

      setProcessing(true);
      try {
        // Simulate lookup (replace with real query later)
        const foundItem = await fakeBarcodeLookup(barcode);

        if (!foundItem) {
          notifyMissingItem(barcode);
          return;
        }

        const newItem = {
          id: foundItem.id,
          barcode,
          name: foundItem.name,
          status: 'scanned',
          timestamp: new Date().toISOString(),
        };

        const updatedList = [...scannedItems, newItem];
        setScannedItems(updatedList);

        // Immediately persist the scanned item list
        await uploadScannedItems(updatedList);
        logger.info(`✅ Processed and uploaded barcode: ${barcode}`);
      } catch (err: unknown) {
        logger.error(`❌ Workflow scan failed for barcode ${rawBarcode}`, err);
      } finally {
        setProcessing(false);
      }
    },
    [scannedItems, normalizeBarcode]
  );

  // ✅ Mock lookup for now (until real Supabase endpoint is wired)
  async function fakeBarcodeLookup(barcode: string) {
    const mockInventory = [
      { id: 'ITEM001', barcode: 'ABC123', name: 'Scalpel Set' },
      { id: 'ITEM002', barcode: 'XYZ789', name: 'Dental Mirror' },
      { id: 'ITEM003', barcode: 'LMN456', name: 'Autoclave Tray' },
    ];
    return mockInventory.find((item) => item.barcode === barcode) || null;
  }

  return { scannedItems, processing, handleScan };
}
