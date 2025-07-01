import { useCallback } from 'react';
import { getDefaultExpandedSections, getFormDataFromItem } from '@/utils/inventoryHelpers';
import { LocalInventoryItem } from '@/types/inventoryTypes';

interface UseAddModalHandlersParams {
  toggleAddModal: () => void;
  setEditMode: (value: boolean) => void;
  resetFormData: () => void;
  setExpandedSections: (sections: Record<string, boolean>) => void;
  setFormData: (data: Partial<LocalInventoryItem>) => void;
}

export function useAddModalHandlers({
  toggleAddModal,
  setEditMode,
  resetFormData,
  setExpandedSections,
  setFormData,
}: UseAddModalHandlersParams) {
  const handleShowAddModal = useCallback(() => {
    toggleAddModal();
    setEditMode(false);
    setExpandedSections(getDefaultExpandedSections() as unknown as Record<string, boolean>);
  }, [toggleAddModal, setEditMode, setExpandedSections]);

  const handleCloseAddModal = useCallback(() => {
    toggleAddModal();
    resetFormData();
    setExpandedSections(getDefaultExpandedSections() as unknown as Record<string, boolean>);
  }, [toggleAddModal, resetFormData, setExpandedSections]);

  const handleEditClick = useCallback(
    (item: Record<string, unknown>) => {
      let localItem: LocalInventoryItem;

      if (item.toolId) {
        localItem = {
          item: item.item as string,
          category: item.category as string,
          location: item.location as string,
          cost: 0,
          toolId: item.toolId as string,
          p2Status: 'available',
        };
      } else if (item.supplyId) {
        localItem = {
          item: item.item as string,
          category: item.category as string,
          location: item.location as string,
          cost: 0,
          supplyId: item.supplyId as string,
          quantity: 1,
          expiration: '',
        };
      } else if (item.equipmentId) {
        localItem = {
          item: item.item as string,
          category: item.category as string,
          location: item.location as string,
          cost: 0,
          equipmentId: item.equipmentId as string,
          status: 'active',
          lastServiced: '',
        };
      } else if (item.hardwareId) {
        localItem = {
          item: item.item as string,
          category: item.category as string,
          location: item.location as string,
          cost: 0,
          hardwareId: item.hardwareId as string,
          status: 'active',
          warranty: '',
        };
      } else {
        localItem = {
          item: item.item as string,
          category: item.category as string,
          location: item.location as string,
          cost: 0,
          toolId: '',
          p2Status: 'available',
        };
      }

      setFormData(getFormDataFromItem(localItem) as unknown as Partial<LocalInventoryItem>);
      setEditMode(true);
      toggleAddModal();
    },
    [setFormData, setEditMode, toggleAddModal]
  );

  return {
    handleShowAddModal,
    handleCloseAddModal,
    handleEditClick,
  };
}
