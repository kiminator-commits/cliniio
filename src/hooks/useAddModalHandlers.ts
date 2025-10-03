import { useCallback } from 'react';
import {
  getDefaultExpandedSections,
  getFormDataFromItem,
} from '@/utils/inventoryHelpers';
import { LocalInventoryItem, ExpandedSections } from '@/types/inventoryTypes';
import { InventoryFormData } from '@/types/inventory';

interface UseAddModalHandlersParams {
  openAddModal: () => void;
  closeAddModal: () => void;
  setEditMode: (value: boolean) => void;
  resetForm: () => void;
  setExpandedSections: (sections: ExpandedSections) => void;
  setFormData: (data: InventoryFormData) => void;
}

export function useAddModalHandlers({
  openAddModal,
  closeAddModal,
  setEditMode,
  resetForm,
  setExpandedSections,
  setFormData,
}: UseAddModalHandlersParams) {
  const handleShowAddModal = useCallback(() => {
    openAddModal();
    setEditMode(false);
    setExpandedSections(getDefaultExpandedSections());
  }, [openAddModal, setEditMode, setExpandedSections]);

  const handleCloseAddModal = useCallback(() => {
    closeAddModal();
    resetForm();
    setExpandedSections(getDefaultExpandedSections());
  }, [closeAddModal, resetForm, setExpandedSections]);

  const handleEditClick = useCallback(
    (item: Record<string, unknown>) => {
      let localItem: LocalInventoryItem;
      const itemData = item.data as Record<string, unknown> | undefined;

      if (itemData?.toolId) {
        localItem = {
          id: (item.id as string) || '',
          facility_id: 'unknown',
          name: item.item as string,
          quantity: 1,
          data: {
            toolId: itemData.toolId as string,
            p2Status: 'available',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: null,
          expiration_date: null,
          unit_cost: 0,
          category: item.category as string,
          status: 'active',
          location: item.location as string,
        };
      } else if (itemData?.supplyId) {
        localItem = {
          id: (item.id as string) || '',
          facility_id: 'unknown',
          name: item.item as string,
          quantity: 1,
          data: {
            supplyId: itemData.supplyId as string,
            expiration: '',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: null,
          expiration_date: null,
          unit_cost: 0,
          category: item.category as string,
          status: 'active',
          location: item.location as string,
        };
      } else if (itemData?.equipmentId) {
        localItem = {
          id: (item.id as string) || '',
          facility_id: 'unknown',
          name: item.item as string,
          quantity: 1,
          data: {
            equipmentId: itemData.equipmentId as string,
            lastServiced: '',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: null,
          expiration_date: null,
          unit_cost: 0,
          category: item.category as string,
          status: 'active',
          location: item.location as string,
        };
      } else if (itemData?.hardwareId) {
        localItem = {
          id: (item.id as string) || '',
          facility_id: 'unknown',
          name: item.item as string,
          quantity: 1,
          data: {
            hardwareId: itemData.hardwareId as string,
            warranty: '',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: null,
          expiration_date: null,
          unit_cost: 0,
          category: item.category as string,
          status: 'active',
          location: item.location as string,
        };
      } else {
        localItem = {
          id: (item.id as string) || '',
          facility_id: 'unknown',
          name: item.item as string,
          quantity: 1,
          data: {
            toolId: '',
            p2Status: 'available',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          reorder_point: null,
          expiration_date: null,
          unit_cost: 0,
          category: item.category as string,
          status: 'active',
          location: item.location as string,
        };
      }

      setFormData(getFormDataFromItem(localItem));
      setEditMode(true);
      openAddModal();
    },
    [setFormData, setEditMode, openAddModal]
  );

  return {
    handleShowAddModal,
    handleCloseAddModal,
    handleEditClick,
  };
}
