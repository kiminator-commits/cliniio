export interface ScanModalState {
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  setScanMode: (mode: 'add' | 'use' | null) => void;
  addScannedItem: (id: string) => void;
  removeScannedItem: (id: string) => void;
  resetScannedItems: () => void;
}

export const createScanModalSlice = (
  set: (fn: (state: ScanModalState) => Partial<ScanModalState>) => void
): ScanModalState => ({
  showScanModal: false,
  setShowScanModal: (show: boolean) => set(() => ({ showScanModal: show })),
  scanMode: null,
  scannedItems: [],
  setScanMode: (mode: 'add' | 'use' | null) => set(() => ({ scanMode: mode })),
  addScannedItem: (id: string) =>
    set((state: ScanModalState) => ({
      scannedItems: [...state.scannedItems, id],
    })),
  removeScannedItem: (id: string) =>
    set((state: ScanModalState) => ({
      scannedItems: state.scannedItems.filter(item => item !== id),
    })),
  resetScannedItems: () => set(() => ({ scannedItems: [] })),
});
