import { StateCreator } from 'zustand';

export interface UIState {
  // Modal visibility
  isModalOpen: boolean;
  showAnalyticsModal: boolean;
  showCleaningLogModal: boolean;
  showBITestModal: boolean;
  showBatchCodeModal: boolean;

  // Workflow state
  workflowType: string;

  // Scanner state
  scannedData: string;

  // Actions
  setModalOpen: (value: boolean) => void;
  setShowAnalyticsModal: (show: boolean) => void;
  setShowCleaningLogModal: (show: boolean) => void;
  setShowBITestModal: (show: boolean) => void;
  setShowBatchCodeModal: (show: boolean) => void;
  setWorkflowType: (type: string) => void;
  setScannedData: (value: string) => void;

  resetUIState: () => void;
}

export const createUIStateSlice: StateCreator<UIState, [], [], UIState> = (
  set
) => ({
  isModalOpen: false,
  showAnalyticsModal: false,
  showCleaningLogModal: false,
  showBITestModal: false,
  showBatchCodeModal: false,
  workflowType: '',
  scannedData: '',

  setModalOpen: (value) => set({ isModalOpen: value }),
  setShowAnalyticsModal: (show) => set({ showAnalyticsModal: show }),
  setShowCleaningLogModal: (show) => set({ showCleaningLogModal: show }),
  setShowBITestModal: (show) => set({ showBITestModal: show }),
  setShowBatchCodeModal: (show) => set({ showBatchCodeModal: show }),
  setWorkflowType: (type) => set({ workflowType: type }),
  setScannedData: (value) => set({ scannedData: value }),
  resetUIState: () =>
    set({
      isModalOpen: false,
      showAnalyticsModal: false,
      showCleaningLogModal: false,
      showBITestModal: false,
      showBatchCodeModal: false,
      workflowType: '',
      scannedData: '',
    }),
});
