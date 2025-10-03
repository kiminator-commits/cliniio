import { StateCreator } from 'zustand';

export interface PackagingUIState {
  // UI state
  isPackagingMode: boolean;
  isBatchMode: boolean;
  showBatchCodeModal: boolean;
  showPackagingScanner: boolean;

  // Actions
  setPackagingMode: (mode: boolean) => void;
  setBatchMode: (mode: boolean) => void;
  setShowBatchCodeModal: (show: boolean) => void;
  setShowPackagingScanner: (show: boolean) => void;
  resetUIState: () => void;
}

export const createPackagingUISlice: StateCreator<
  PackagingUIState,
  [],
  [],
  PackagingUIState
> = (set) => ({
  // Initial state
  isPackagingMode: false,
  isBatchMode: false,
  showBatchCodeModal: false,
  showPackagingScanner: false,

  // UI State Actions
  setPackagingMode: (mode: boolean) => set({ isPackagingMode: mode }),
  setBatchMode: (mode: boolean) => set({ isBatchMode: mode }),
  setShowBatchCodeModal: (show: boolean) => set({ showBatchCodeModal: show }),
  setShowPackagingScanner: (show: boolean) =>
    set({ showPackagingScanner: show }),

  resetUIState: () =>
    set({
      isPackagingMode: false,
      isBatchMode: false,
      showBatchCodeModal: false,
      showPackagingScanner: false,
    }),
});
