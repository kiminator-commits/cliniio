import { StateCreator } from 'zustand';
import { InventoryItem } from '@/types/inventoryTypes';

export interface InventoryModalState {
  // Modal visibility states
  showAddModal: boolean;
  showTrackModal: boolean;
  showUploadBarcodeModal: boolean;
  showScanModal: boolean;
  showDeleteModal: boolean;

  // Delete modal state
  itemToDelete: InventoryItem | null;

  // Scan modal state
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];

  // Modal actions
  setShowAddModal: (show: boolean) => void;
  setShowTrackModal: (show: boolean) => void;
  setShowUploadBarcodeModal: (show: boolean) => void;
  setShowScanModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;

  // Delete modal actions
  setItemToDelete: (item: InventoryItem | null) => void;
  openDeleteModal: (item: InventoryItem) => void;
  closeDeleteModal: () => void;

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
  openUploadBarcodeModal: () => void;
  closeUploadBarcodeModal: () => void;
  toggleUploadBarcodeModal: () => void;
  openScanModal: () => void;
  closeScanModal: () => void;
}

export const createInventoryModalSlice: StateCreator<
  InventoryModalState,
  [],
  [],
  InventoryModalState
> = (set) => ({
  // Modal visibility states
  showAddModal: false,
  showTrackModal: false,
  showUploadBarcodeModal: false,
  showScanModal: false,
  showDeleteModal: false,

  // Delete modal state
  itemToDelete: null,

  // Scan modal state
  scanMode: null,
  scannedItems: [],

  // Modal actions
  setShowAddModal: (show) => set({ showAddModal: show }),
  setShowTrackModal: (show) => set({ showTrackModal: show }),
  setShowUploadBarcodeModal: (show) => set({ showUploadBarcodeModal: show }),
  setShowScanModal: (show) => set({ showScanModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),

  // Delete modal actions
  setItemToDelete: (item) => set({ itemToDelete: item }),
  openDeleteModal: (item) => set({ showDeleteModal: true, itemToDelete: item }),
  closeDeleteModal: () => set({ showDeleteModal: false, itemToDelete: null }),

  // Scan modal actions
  setScanMode: (mode) => set({ scanMode: mode }),
  addScannedItem: (id) =>
    set((state) => ({
      scannedItems: [...state.scannedItems, id],
    })),
  removeScannedItem: (id) =>
    set((state) => ({
      scannedItems: state.scannedItems.filter((item) => item !== id),
    })),
  resetScannedItems: () => set({ scannedItems: [] }),

  // Convenience actions
  openAddModal: () => set({ showAddModal: true }),
  closeAddModal: () => set({ showAddModal: false }),
  openTrackModal: () => set({ showTrackModal: true }),
  closeTrackModal: () => set({ showTrackModal: false }),
  openUploadBarcodeModal: () => set({ showUploadBarcodeModal: true }),
  closeUploadBarcodeModal: () => set({ showUploadBarcodeModal: false }),
  toggleUploadBarcodeModal: () =>
    set((state) => ({ showUploadBarcodeModal: !state.showUploadBarcodeModal })),
  openScanModal: () => set({ showScanModal: true }),
  closeScanModal: () => set({ showScanModal: false }),
});
