import { useCallback } from 'react';
import {
  LocalInventoryItem,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
} from '@/types/inventoryTypes';
import { inventoryService } from '@/services/inventoryService';

interface UseHandleSaveArgs {
  storeFormData: Partial<LocalInventoryItem>;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  currentScannedItemIndex: number;
  handleCloseAddModal: () => void;
  handleOpenAddItemModalWithBarcode: (barcodeData?: string) => void;
  resetScannedItems: () => void;
  setCurrentScannedItemIndex: (val: number) => void;
  setLocalInventoryData: React.Dispatch<React.SetStateAction<ToolItem[]>>;
  setLocalSuppliesData: React.Dispatch<React.SetStateAction<SupplyItem[]>>;
  setLocalEquipmentData: React.Dispatch<React.SetStateAction<EquipmentItem[]>>;
  setLocalOfficeHardwareData: React.Dispatch<React.SetStateAction<OfficeHardwareItem[]>>;
}

export function useHandleSave({
  storeFormData,
  scanMode,
  scannedItems,
  currentScannedItemIndex,
  handleCloseAddModal,
  handleOpenAddItemModalWithBarcode,
  resetScannedItems,
  setCurrentScannedItemIndex,
  setLocalInventoryData,
  setLocalSuppliesData,
  setLocalEquipmentData,
  setLocalOfficeHardwareData,
}: UseHandleSaveArgs) {
  /**
   * Handles saving inventory data from the modal.
   * - Validates required fields (`itemName`, `category`, `id`)
   * - Simulates save logic (mocked until Supabase is connected)
   * - Handles unexpected errors with fallback alert
   *
   * Future: Wire this to Supabase insert/upsert logic.
   */
  const handleSave = useCallback(async () => {
    try {
      const getItemId = (data: Partial<LocalInventoryItem>): string => {
        if ('toolId' in data && data.toolId) return data.toolId;
        if ('supplyId' in data && data.supplyId) return data.supplyId;
        if ('equipmentId' in data && data.equipmentId) return data.equipmentId;
        if ('hardwareId' in data && data.hardwareId) return data.hardwareId;
        return '';
      };

      if (
        !storeFormData.item?.trim() ||
        !storeFormData.category?.trim() ||
        !getItemId(storeFormData)?.trim()
      ) {
        alert('Please fill in all required fields before saving.');
        return;
      }

      const itemToSave = {
        id: getItemId(storeFormData),
        name: storeFormData.item || '',
        category: storeFormData.category || '',
        location: storeFormData.location || '',
        status: 'Available',
        lastUpdated: new Date().toISOString(),
        toolId: 'toolId' in storeFormData ? storeFormData.toolId : undefined,
        supplyId: 'supplyId' in storeFormData ? storeFormData.supplyId : undefined,
        equipmentId: 'equipmentId' in storeFormData ? storeFormData.equipmentId : undefined,
        hardwareId: 'hardwareId' in storeFormData ? storeFormData.hardwareId : undefined,
      };

      await inventoryService.addInventoryItem(itemToSave);

      const newItem = {
        item: storeFormData.item || '',
        category: storeFormData.category || '',
        location: storeFormData.location || '',
        cost: storeFormData.cost || 0,
      };

      if (storeFormData.category === 'tools') {
        setLocalInventoryData(prev => [
          ...prev,
          {
            ...newItem,
            toolId: 'toolId' in storeFormData ? storeFormData.toolId || '' : '',
            p2Status: 'clean',
          },
        ]);
      } else if (storeFormData.category === 'supplies') {
        setLocalSuppliesData(prev => [
          ...prev,
          {
            ...newItem,
            supplyId: 'supplyId' in storeFormData ? storeFormData.supplyId || '' : '',
            quantity: 1,
            expiration: '',
          },
        ]);
      } else if (storeFormData.category === 'equipment') {
        setLocalEquipmentData(prev => [
          ...prev,
          {
            ...newItem,
            equipmentId: 'equipmentId' in storeFormData ? storeFormData.equipmentId || '' : '',
            status: 'operational',
            lastServiced: '',
          },
        ]);
      } else if (storeFormData.category === 'officeHardware') {
        setLocalOfficeHardwareData(prev => [
          ...prev,
          {
            ...newItem,
            hardwareId: 'hardwareId' in storeFormData ? storeFormData.hardwareId || '' : '',
            status: 'active',
            warranty: '',
          },
        ]);
      } else {
        setLocalInventoryData(prev => [
          ...prev,
          {
            ...newItem,
            toolId: 'toolId' in storeFormData ? storeFormData.toolId || '' : '',
            p2Status: 'clean',
          },
        ]);
      }

      handleCloseAddModal();

      if (scanMode === 'add' && scannedItems.length > 0) {
        const nextIndex = currentScannedItemIndex + 1;
        if (nextIndex < scannedItems.length) {
          setCurrentScannedItemIndex(nextIndex);
          handleOpenAddItemModalWithBarcode(scannedItems[nextIndex]);
        } else {
          setCurrentScannedItemIndex(0);
          resetScannedItems();
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  }, [
    storeFormData,
    scanMode,
    scannedItems,
    currentScannedItemIndex,
    handleCloseAddModal,
    handleOpenAddItemModalWithBarcode,
    resetScannedItems,
    setCurrentScannedItemIndex,
    setLocalInventoryData,
    setLocalSuppliesData,
    setLocalEquipmentData,
    setLocalOfficeHardwareData,
  ]);

  return { handleSave };
}
