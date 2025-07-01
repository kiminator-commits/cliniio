import { StateCreator } from 'zustand';

export interface UIState {
  isModalOpen: boolean;
  showScannerModal: boolean;
  showAnalyticsModal: boolean;
  showCleaningLogModal: boolean;
  showBITestModal: boolean;
  setModalOpen: (value: boolean) => void;
  setShowScannerModal: (show: boolean) => void;
  setShowAnalyticsModal: (show: boolean) => void;
  setShowCleaningLogModal: (show: boolean) => void;
  setShowBITestModal: (show: boolean) => void;
}

export const createUIStateSlice: StateCreator<UIState, [], [], UIState> = set => ({
  isModalOpen: false,
  showScannerModal: false,
  showAnalyticsModal: false,
  showCleaningLogModal: false,
  showBITestModal: false,
  setModalOpen: value => set({ isModalOpen: value }),
  setShowScannerModal: show => set({ showScannerModal: show }),
  setShowAnalyticsModal: show => set({ showAnalyticsModal: show }),
  setShowCleaningLogModal: show => set({ showCleaningLogModal: show }),
  setShowBITestModal: show => set({ showBITestModal: show }),
});
