import { StateCreator } from 'zustand';

export interface InventoryModalState {
  // Modal visibility states
  showAddModal: boolean;
  showTrackModal: boolean;
  showUploadBarcodeModal: boolean;
  showScanModal: boolean;

  // Scan modal state
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];

  // Modal actions
  setShowAddModal: (show: boolean) => void;
  setShowTrackModal: (show: boolean) => void;
  setShowUploadBarcodeModal: (show: boolean) => void;
  setShowScanModal: (show: boolean) => void;

  // Scan modal actions
  setScanMode: (mode: 'add' | 'use' | null) => void;
  addScannedItem: (id: string) => void;
  removeScannedItem: (id: string) => void;
  resetScannedItems: () => void;

  // Convenience actions
  openAddModal: () => void;
  closeAddModal: () => void;
  openTrackModal: () => void;
  closeTrackModal: () => void;
  openScanModal: () => void;
  closeScanModal: () => void;
}

export const createInventoryModalSlice: StateCreator<
  InventoryModalState,
  [],
  [],
  InventoryModalState
> = set => ({
  // Modal visibility states
  showAddModal: false,
  showTrackModal: false,
  showUploadBarcodeModal: false,
  showScanModal: false,

  // Scan modal state
  scanMode: null,
  scannedItems: [],

  // Modal actions
  setShowAddModal: show => set({ showAddModal: show }),
  setShowTrackModal: show => set({ showTrackModal: show }),
  setShowUploadBarcodeModal: show => set({ showUploadBarcodeModal: show }),
  setShowScanModal: show => set({ showScanModal: show }),

  // Scan modal actions
  setScanMode: mode => set({ scanMode: mode }),
  addScannedItem: id =>
    set(state => ({
      scannedItems: [...state.scannedItems, id],
    })),
  removeScannedItem: id =>
    set(state => ({
      scannedItems: state.scannedItems.filter(item => item !== id),
    })),
  resetScannedItems: () => set({ scannedItems: [] }),

  // Convenience actions
  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),
  openTrackModal: () => set({ showTrackModal: true }),
  closeTrackModal: () => set({ showTrackModal: false }),
  openScanModal: () => set({ showScanModal: true }),
  closeScanModal: () => set({ showScanModal: false }),
});
