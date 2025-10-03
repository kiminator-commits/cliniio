import { useCallback } from 'react';
import { InventoryItem } from '@/types/inventoryTypes';
import { InventoryServiceFacadeImpl } from '@/services/inventory/InventoryServiceFacade';

interface UseHandleSaveArgs {
  storeFormData: Partial<InventoryItem>;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  currentScannedItemIndex: number;
  handleCloseAddModal: () => void;
  handleOpenAddItemModalWithBarcode: (barcodeData?: string) => void;
  resetScannedItems: () => void;
  setCurrentScannedItemIndex: (val: number) => void;
  setLocalInventoryData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setLocalSuppliesData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setLocalEquipmentData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setLocalOfficeHardwareData: React.Dispatch<
    React.SetStateAction<InventoryItem[]>
  >;
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
   * - Validates required fields (`name`, `category`, `id`)
   * - Simulates save logic (mocked until Supabase is connected)
   * - Handles unexpected errors with fallback alert
   *
   * Future: Wire this to Supabase insert/upsert logic.
   */
  const handleSave = useCallback(async () => {
    try {
      const getItemId = (data: Partial<InventoryItem>): string => {
        if ('toolId' in data && data.toolId) return data.toolId;
        if ('supplyId' in data && data.supplyId) return data.supplyId;
        if ('equipmentId' in data && data.equipmentId) return data.equipmentId;
        if ('hardwareId' in data && data.hardwareId) return data.hardwareId;
        return data.id || '';
      };

      if (
        !storeFormData.name?.trim() ||
        !storeFormData.category?.trim() ||
        !getItemId(storeFormData)?.trim()
      ) {
        alert('Please fill in all required fields before saving.');
        return;
      }

      const itemToSave: InventoryItem = {
        id: getItemId(storeFormData),
        facility_id: 'unknown',
        name: storeFormData.name || '',
        quantity: storeFormData.quantity || 1,
        data: {
          toolId: 'toolId' in storeFormData ? storeFormData.toolId : undefined,
          supplyId:
            'supplyId' in storeFormData ? storeFormData.supplyId : undefined,
          equipmentId:
            'equipmentId' in storeFormData
              ? storeFormData.equipmentId
              : undefined,
          hardwareId:
            'hardwareId' in storeFormData
              ? storeFormData.hardwareId
              : undefined,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: null,
        expiration_date: null,
        unit_cost: storeFormData.unit_cost || 0,
        category: storeFormData.category || '',
        status: 'Available',
        location: storeFormData.location || '',
      };

      const inventoryService = InventoryServiceFacadeImpl.getInstance();
      await inventoryService.createItem(itemToSave);

      const newItem: InventoryItem = {
        id: getItemId(storeFormData),
        facility_id: 'unknown',
        name: storeFormData.name || '',
        quantity: storeFormData.quantity || 1,
        data: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: null,
        expiration_date: null,
        unit_cost: storeFormData.unit_cost || 0,
        category: storeFormData.category || '',
        status: 'Available',
        location: storeFormData.location || '',
      };

      if (storeFormData.category === 'Tools') {
        const toolItem: InventoryItem = {
          ...newItem,
          data: {
            toolId: 'toolId' in storeFormData ? storeFormData.toolId || '' : '',
            p2Status: 'clean',
          },
        };
        setLocalInventoryData((prev) => [...prev, toolItem]);
      } else if (storeFormData.category === 'Supplies') {
        const supplyItem: InventoryItem = {
          ...newItem,
          data: {
            supplyId:
              'supplyId' in storeFormData ? storeFormData.supplyId || '' : '',
            expiration: '',
          },
        };
        setLocalSuppliesData((prev) => [...prev, supplyItem]);
      } else if (storeFormData.category === 'Equipment') {
        const equipmentItem: InventoryItem = {
          ...newItem,
          data: {
            equipmentId:
              'equipmentId' in storeFormData
                ? storeFormData.equipmentId || ''
                : '',
            lastServiced: '',
          },
        };
        setLocalEquipmentData((prev) => [...prev, equipmentItem]);
      } else if (storeFormData.category === 'Office Hardware') {
        const hardwareItem: InventoryItem = {
          ...newItem,
          data: {
            hardwareId:
              'hardwareId' in storeFormData
                ? storeFormData.hardwareId || ''
                : '',
            warranty: '',
          },
        };
        setLocalOfficeHardwareData((prev) => [...prev, hardwareItem]);
      } else {
        const defaultItem: InventoryItem = {
          ...newItem,
          data: {
            toolId: 'toolId' in storeFormData ? storeFormData.toolId || '' : '',
            p2Status: 'clean',
          },
        };
        setLocalInventoryData((prev) => [...prev, defaultItem]);
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
