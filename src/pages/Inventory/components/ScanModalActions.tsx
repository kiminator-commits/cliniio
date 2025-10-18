import * as React from 'react';
import { getScanModeDisplayText } from '../services/scanInventoryModalService';
import { useInventoryStore } from '../../../store/useInventoryStore';
import {
  convertBarcodeToFormData,
  convertFormDataToInventoryFormData,
} from '../../../utils/Inventory/barcodeUtils';
import { inventoryServiceFacade } from '../../../services/inventory';

interface InventoryItemData {
  barcode?: string;
  [key: string]: unknown;
}

interface _InventoryItem {
  id: string;
  name: string;
  data: InventoryItemData;
}

interface ScanModalActionsProps {
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  onSelectMode: (mode: 'add' | 'use') => void;
  onProcess?: () => void;
  onClose?: () => void;
  onOpenAddItemModal?: (barcodeData?: string) => void;
}

const ScanModalActions: React.FC<ScanModalActionsProps> = ({
  scanMode,
  scannedItems,
  onSelectMode,
}) => {
  const {
    openAddModal,
    closeScanModal,
    setFormData,
    setEditMode,
    inventoryItems,
  } = useInventoryStore();

  // Handle processing scanned items based on mode
  const handleProcessScannedItems = async () => {
    if (scanMode === 'add' && scannedItems.length > 0) {
      // Add Inventory workflow: Open add modal with first scanned item
      const barcode = scannedItems[0];
      const existingItem = inventoryItems.find(
        (item) => {
          const hasBarcode = item.data && 
            typeof item.data === 'object' && 
            item.data !== null && 
            'barcode' in item.data && 
            typeof (item.data as Record<string, unknown>).barcode === 'string' &&
            (item.data as Record<string, unknown>).barcode === barcode;
          return hasBarcode || item.id === barcode;
        }
      );

      if (existingItem) {
        // Item exists - show message
        alert(`Item with barcode ${barcode} already exists in inventory.`);
        return;
      }

      // Item doesn't exist - open add modal with barcode data
      const formData = convertBarcodeToFormData(barcode);
      const inventoryFormData = convertFormDataToInventoryFormData(formData);
      setFormData(inventoryFormData);
      setEditMode(false);
      closeScanModal();
      openAddModal();
    } else if (scanMode === 'use' && scannedItems.length > 0) {
      // Use Inventory workflow: Remove scanned items
      const removalPromises = scannedItems.map(async (barcode) => {
        const itemToRemove = inventoryItems.find(
          (item) => (item.data as Record<string, unknown>)?.barcode === barcode || item.id === barcode
        );

        if (itemToRemove) {
          try {
            await inventoryServiceFacade.deleteItem(itemToRemove.id);
            console.log(
              'Successfully removed item from inventory:',
              itemToRemove.name
            );
            return { success: true, item: itemToRemove };
          } catch (error) {
            console.error('Failed to remove item:', itemToRemove.name, error);
            return { success: false, item: itemToRemove, error };
          }
        } else {
          console.log('Item not found in inventory:', barcode);
          return { success: false, item: null, error: 'Item not found' };
        }
      });

      // Wait for all removals to complete
      const results = await Promise.all(removalPromises);
      const successfulRemovals = results.filter((r) => r.success).length;
      const failedRemovals = results.filter((r) => !r.success).length;

      if (successfulRemovals > 0) {
        alert(
          `Successfully removed ${successfulRemovals} item(s) from inventory.`
        );
      }
      if (failedRemovals > 0) {
        alert(
          `Failed to remove ${failedRemovals} item(s). Please check the console for details.`
        );
      }

      // Close scan modal after processing
      closeScanModal();
    }
  };

  if (!scanMode) {
    return null;
  }

  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex gap-2">
        <button
          onClick={() => handleProcessScannedItems().catch(console.error)}
          className="flex-1 bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#4ECDC4] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {getScanModeDisplayText(scanMode)}
        </button>
        <button
          onClick={() => onSelectMode('add')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ScanModalActions;
