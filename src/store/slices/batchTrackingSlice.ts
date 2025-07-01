import { StateCreator } from 'zustand';

export interface BatchTrackingState {
  currentBatchId: string | null;
  batchedToolIds: string[];
  setCurrentBatchId: (id: string | null) => void;
  addToolToBatch: (toolId: string) => void;
  resetBatch: () => void;
}

export const createBatchTrackingSlice: StateCreator<
  BatchTrackingState,
  [],
  [],
  BatchTrackingState
> = (set, get) => ({
  currentBatchId: null,
  batchedToolIds: [],
  setCurrentBatchId: id => set({ currentBatchId: id }),
  addToolToBatch: toolId => set({ batchedToolIds: [...get().batchedToolIds, toolId] }),
  resetBatch: () => set({ currentBatchId: null, batchedToolIds: [] }),
});
