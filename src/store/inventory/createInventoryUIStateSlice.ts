import { StateCreator } from 'zustand';

export interface InventoryUIStateSlice {
  isAddItemModalOpen: boolean;
  isEditMode: boolean;
  setAddItemModalOpen: (open: boolean) => void;
  setEditMode: (editMode: boolean) => void;
}

export const createInventoryUIStateSlice: StateCreator<
  InventoryUIStateSlice,
  [],
  [],
  InventoryUIStateSlice
> = set => ({
  isAddItemModalOpen: false,
  isEditMode: false,
  setAddItemModalOpen: open => set({ isAddItemModalOpen: open }),
  setEditMode: editMode => set({ isEditMode: editMode }),
});
