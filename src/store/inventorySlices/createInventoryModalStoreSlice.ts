import { StateCreator } from 'zustand';

export interface InventoryModalState {
  showAddModal: boolean;
  toggleAddModal: () => void;
  setShowAddModal: (show: boolean) => void;

  showTrackModal: boolean;
  toggleTrackModal: () => void;

  showUploadBarcodeModal: boolean;
  toggleUploadBarcodeModal: () => void;

  // Scan modal state
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  setScanMode: (mode: 'add' | 'use' | null) => void;
  addScannedItem: (id: string) => void;
  removeScannedItem: (id: string) => void;
  resetScannedItems: () => void;
}

export const createInventoryModalStoreSlice: StateCreator<
  InventoryModalState,
  [],
  [],
  InventoryModalState
> = (set, get) => ({
  showAddModal: false,
  toggleAddModal: () => set({ showAddModal: !get().showAddModal }),
  setShowAddModal: (show: boolean) => set({ showAddModal: show }),

  showTrackModal: false,
  toggleTrackModal: () => set({ showTrackModal: !get().showTrackModal }),

  showUploadBarcodeModal: false,
  toggleUploadBarcodeModal: () =>
    set({ showUploadBarcodeModal: !get().showUploadBarcodeModal }),

  // Scan modal state
  showScanModal: false,
  setShowScanModal: (show: boolean) => set(() => ({ showScanModal: show })),
  scanMode: null,
  scannedItems: [],
  setScanMode: (mode: 'add' | 'use' | null) => set(() => ({ scanMode: mode })),
  addScannedItem: (id: string) =>
    set((state: InventoryModalState) => ({
      scannedItems: [...state.scannedItems, id],
    })),
  removeScannedItem: (id: string) =>
    set((state: InventoryModalState) => ({
      scannedItems: state.scannedItems.filter((item) => item !== id),
    })),
  resetScannedItems: () => set(() => ({ scannedItems: [] })),
});
