import { StateCreator } from 'zustand';

export interface InventoryUIState {
  isAddModalOpen: boolean;
  selectedItemId: string | null;
  setAddModalOpen: (isOpen: boolean) => void;
  setSelectedItemId: (id: string | null) => void;
}

export const createInventoryUIStateSlice: StateCreator<InventoryUIState> = set => ({
  isAddModalOpen: false,
  selectedItemId: null,
  setAddModalOpen: isOpen => set({ isAddModalOpen: isOpen }),
  setSelectedItemId: id => set({ selectedItemId: id }),
});
