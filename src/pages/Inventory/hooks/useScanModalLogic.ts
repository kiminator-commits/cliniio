import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useInventoryStore } from '@/store/useInventoryStore';
import {
  convertBarcodeToFormData,
  convertFormDataToInventoryFormData,
} from '@/utils/Inventory/barcodeUtils';
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { aiScanAssistService } from '@/services/aiScanAssistService';
import { supabase } from '@/lib/supabaseClient';

/**
 * Show toast notification with appropriate styling
 */
const showToastNotification = (
  message: string,
  type: 'success' | 'warning' | 'error' = 'success'
) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'warning':
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#fef3c7',
          color: '#92400e',
        },
      });
      break;
    case 'error':
      toast.error(message);
      break;
    default:
      toast(message);
  }
};

interface UseScanModalLogicProps {
  scanMode: 'add' | 'use' | null;
  onScan?: (barcode: string) => void;
}

export const useScanModalLogic = ({
  scanMode,
  onScan,
}: UseScanModalLogicProps) => {
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const {
    openAddModal,
    closeScanModal,
    setFormData,
    setEditMode,
    inventoryItems,
    refreshInventoryData,
  } = useInventoryStore();

  // Add Inventory workflow: Check if item exists, if not, open add modal with barcode data
  const handleAddInventoryWorkflow = useCallback(
    (barcode: string) => {
      // Check if item already exists in inventory
      const existingItem = inventoryItems.find(
        (item) => item.data?.barcode === barcode || item.id === barcode
      );

      if (existingItem) {
        // Item exists - show message or update quantity
        console.log('Item already exists:', existingItem);
        showToastNotification(
          `Item "${existingItem.name}" already exists in inventory.`,
          'warning'
        );
      } else {
        // Item doesn't exist - open add modal with barcode data
        const formData = convertBarcodeToFormData(barcode);
        const inventoryFormData = convertFormDataToInventoryFormData(formData);
        setFormData(inventoryFormData);
        setEditMode(false);
        closeScanModal();
        openAddModal();
      }
    },
    [inventoryItems, setFormData, setEditMode, closeScanModal, openAddModal]
  );

  // Use Inventory workflow: Decrement stock, log usage, and trigger AI enrichment
  const handleUseInventoryWorkflow = useCallback(async (barcode: string) => {
    try {
      // 1️⃣ Fetch item by barcode
      const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (fetchError || !item) {
        toast.error('Item not found in inventory.');
        return;
      }

      // 2️⃣ Decrement quantity (or mark as used)
      const newQuantity = Math.max((item.quantity ?? 1) - 1, 0);
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', item.id);

      if (updateError) {
        toast.error('Failed to update inventory.');
        return;
      }

      // 3️⃣ Log usage event for audit trail
      await supabase.from('inventory_usage').insert([
        {
          barcode,
          item_id: item.id,
          facility_id: item.facility_id,
          user_id: item.user_id || null,
          action: 'use',
          timestamp: new Date().toISOString(),
        },
      ]);

      // 4️⃣ Trigger AI enrichment (silent)
      aiScanAssistService
        .analyzeScan({
          barcode,
          mode: 'use',
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      // 5️⃣ Success feedback
      toast.success(`${item.name || 'Item'} used successfully.`);
    } catch (err) {
      console.error('Error in handleUseInventoryWorkflow:', err);
      toast.error('Unexpected error using item.');
    }
  }, []);

  // Handle barcode scanning for both add and use workflows
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      setScannedBarcodes((prev) => [...prev, barcode]);

      if (onScan) {
        try {
          onScan(barcode);
        } catch (error) {
          console.error('Error in onScan callback:', error);
        }
      }

      // ✅ Decide workflow based on scan mode
      if (scanMode === 'use') {
        handleUseInventoryWorkflow(barcode);
      } else if (scanMode === 'add') {
        // Add Inventory workflow
        handleAddInventoryWorkflow(barcode);
      }

      aiScanAssistService
        .analyzeScan({
          barcode,
          mode: scanMode,
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});
    },
    [scanMode, handleAddInventoryWorkflow, handleUseInventoryWorkflow, onScan]
  );

  return {
    scannedBarcodes,
    handleBarcodeScan,
  };
};
