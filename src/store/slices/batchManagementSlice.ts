import { StateCreator } from 'zustand';
import { SterilizationCycle } from './types/sterilizationCycleTypes';

export interface BatchManagementState {
  // Batch tracking
  currentBatchId: string | null;
  batchedToolIds: string[];

  // Current cycle reference
  currentCycle: SterilizationCycle | null;

  // Actions
  setCurrentBatchId: (id: string | null) => void;
  addToolToBatch: (toolId: string) => void;
  resetBatch: () => void;
}

export const createBatchManagementSlice: StateCreator<
  BatchManagementState,
  [],
  [],
  BatchManagementState
> = (set, get) => ({
  currentBatchId: null,
  batchedToolIds: [],
  currentCycle: null,

  setCurrentBatchId: (id: string | null) => set({ currentBatchId: id }),
  addToolToBatch: (toolId: string) =>
    set({ batchedToolIds: [...get().batchedToolIds, toolId] }),
  resetBatch: () => set({ currentBatchId: null, batchedToolIds: [] }),
});
