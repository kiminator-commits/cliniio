import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useInventoryStore } from '@/store/useInventoryStore';
import {
  convertBarcodeToFormData,
  convertFormDataToInventoryFormData,
} from '@/utils/Inventory/barcodeUtils';
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

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
  onScan?: (itemId: string) => void;
}

export const useScanModalLogic = ({ scanMode }: UseScanModalLogicProps) => {
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

  // Use Inventory workflow: Remove item from inventory
  const handleUseInventoryWorkflow = useCallback(
    async (barcode: string) => {
      try {
        // Find item in inventory
        const itemToRemove = inventoryItems.find(
          (item) => item.data?.barcode === barcode || item.id === barcode
        );

        if (itemToRemove) {
          // Confirm removal with user
          const confirmed = window.confirm(
            `Are you sure you want to remove "${itemToRemove.name}" from inventory?`
          );

          if (confirmed) {
            // Remove item from inventory using service
            await InventoryServiceFacade.deleteItem(itemToRemove.id);

            // Refresh inventory data
            await refreshInventoryData();

            console.log('Item removed from inventory:', itemToRemove);
            showToastNotification(
              `Successfully removed "${itemToRemove.name}" from inventory.`,
              'success'
            );
          }
        } else {
          // Item not found
          console.log('Item not found in inventory:', barcode);
          showToastNotification(
            `Item with barcode "${barcode}" not found in inventory.`,
            'error'
          );
        }
      } catch (error) {
        console.error('Error removing item from inventory:', error);
        showToastNotification(
          'Failed to remove item from inventory. Please try again.',
          'error'
        );
      }
    },
    [inventoryItems, refreshInventoryData]
  );

  // Handle barcode scanning for both add and use workflows
  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      if (scanMode === 'add') {
        // Add Inventory workflow
        handleAddInventoryWorkflow(barcode);
      } else if (scanMode === 'use') {
        // Use Inventory workflow
        handleUseInventoryWorkflow(barcode);
      }
    },
    [scanMode, handleAddInventoryWorkflow, handleUseInventoryWorkflow]
  );

  return {
    handleBarcodeScan,
    handleAddInventoryWorkflow,
    handleUseInventoryWorkflow,
  };
};
