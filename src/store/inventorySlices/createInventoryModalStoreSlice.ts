import { StateCreator } from 'zustand';

export interface InventoryModalState {
  showAddModal: boolean;
  toggleAddModal: () => void;

  showTrackModal: boolean;
  toggleTrackModal: () => void;

  showUploadBarcodeModal: boolean;
  toggleUploadBarcodeModal: () => void;
}

export const createInventoryModalStoreSlice: StateCreator<
  InventoryModalState,
  [],
  [],
  InventoryModalState
> = (set, get) => ({
  showAddModal: false,
  toggleAddModal: () => set({ showAddModal: !get().showAddModal }),

  showTrackModal: false,
  toggleTrackModal: () => set({ showTrackModal: !get().showTrackModal }),

  showUploadBarcodeModal: false,
  toggleUploadBarcodeModal: () => set({ showUploadBarcodeModal: !get().showUploadBarcodeModal }),
});
