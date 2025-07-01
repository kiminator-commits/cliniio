import { create } from 'zustand';

interface InventoryModalStore {
  showAddModal: boolean;
  showEditModal: boolean;
  showTrackModal: boolean;
  showScanModal: boolean;
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowTrackModal: (show: boolean) => void;
  setShowScanModal: (show: boolean) => void;
}

export const useInventoryModalStore = create<InventoryModalStore>(set => ({
  showAddModal: false,
  showEditModal: false,
  showTrackModal: false,
  showScanModal: false,
  setShowAddModal: show => set({ showAddModal: show }),
  setShowEditModal: show => set({ showEditModal: show }),
  setShowTrackModal: show => set({ showTrackModal: show }),
  setShowScanModal: show => set({ showScanModal: show }),
}));
