import { StateCreator } from 'zustand';
import { SterilizationBatch } from '../../types/sterilizationTypes';
import { BatchCodeService } from '../shared/batchCodeService';

export interface BatchState {
  // Batch state
  currentBatch: SterilizationBatch | null;
  batches: SterilizationBatch[];
  batchHistory: SterilizationBatch[];
  batchLoading: boolean;

  // Actions
  createBatch: (operator: string, isBatchMode: boolean) => Promise<string>;
  addToolToBatch: (toolId: string) => void;
  removeToolFromBatch: (toolId: string) => void;
  finalizeBatch: (packageInfo: {
    packageType: string;
    packageSize: string;
    notes?: string;
  }) => Promise<void>;
  updateBatchStatus: (
    batchId: string,
    status: SterilizationBatch['status']
  ) => void;
  getBatchById: (batchId: string) => SterilizationBatch | null;
  getBatchesByStatus: (
    status: SterilizationBatch['status']
  ) => SterilizationBatch[];
  clearCurrentBatch: () => void;
  setBatchLoading: (loading: boolean) => void;
}

export const createBatchSlice: StateCreator<BatchState, [], [], BatchState> = (
  set,
  get
) => ({
  // Initial state
  currentBatch: null,
  batches: [],
  batchHistory: [],
  batchLoading: false,

  // Batch Management Actions
  createBatch: async (operator: string, isBatchMode: boolean) => {
    set({ batchLoading: true });

    try {
      const batchId = `batch_${Date.now()}`;
      const newBatch: SterilizationBatch = {
        id: batchId,
        batchCode: '', // Will be generated when finalized
        createdAt: new Date(),
        createdBy: operator,
        status: 'creating',
        tools: [],
        packageInfo: {
          packageType: '',
          packageSize: '',
        },
        sterilizationInfo: {},
        auditTrail: [
          {
            id: `audit_${Date.now()}`,
            timestamp: new Date(),
            action: 'created',
            operator,
            details: `Batch created in ${isBatchMode ? 'batch' : 'single tool'} mode`,
          },
        ],
      };

      set((state) => ({
        currentBatch: newBatch,
        batches: [...state.batches, newBatch],
        batchLoading: false,
      }));

      return batchId;
    } catch (error) {
      set({ batchLoading: false });
      throw error;
    }
  },

  addToolToBatch: (toolId: string) => {
    const { currentBatch } = get();
    if (!currentBatch) return;

    if (!currentBatch.tools.includes(toolId)) {
      const updatedBatch: SterilizationBatch = {
        ...currentBatch,
        tools: [...currentBatch.tools, toolId],
        auditTrail: [
          ...currentBatch.auditTrail,
          {
            id: `audit_${Date.now()}`,
            timestamp: new Date(),
            action: 'tool_added',
            operator: currentBatch.createdBy,
            details: `Tool ${toolId} added to batch`,
            metadata: { toolId },
          },
        ],
      };

      set((state) => ({
        currentBatch: updatedBatch,
        batches: state.batches.map((batch) =>
          batch.id === currentBatch.id ? updatedBatch : batch
        ),
      }));
    }
  },

  removeToolFromBatch: (toolId: string) => {
    const { currentBatch } = get();
    if (!currentBatch) return;

    const updatedBatch: SterilizationBatch = {
      ...currentBatch,
      tools: currentBatch.tools.filter((id) => id !== toolId),
      auditTrail: [
        ...currentBatch.auditTrail,
        {
          id: `audit_${Date.now()}`,
          timestamp: new Date(),
          action: 'tool_removed',
          operator: currentBatch.createdBy,
          details: `Tool ${toolId} removed from batch`,
          metadata: { toolId },
        },
      ],
    };

    set((state) => ({
      currentBatch: updatedBatch,
      batches: state.batches.map((batch) =>
        batch.id === currentBatch.id ? updatedBatch : batch
      ),
    }));
  },

  finalizeBatch: async (packageInfo: {
    packageType: string;
    packageSize: string;
    notes?: string;
  }) => {
    const { currentBatch } = get();
    if (!currentBatch) throw new Error('No current batch to finalize');

    set({ batchLoading: true });

    try {
      // Generate batch code using the shared service
      const batchCodeResult = await BatchCodeService.generateBatchCode(
        currentBatch.createdBy,
        currentBatch.tools.length
      );

      if (!batchCodeResult.success) {
        throw new Error(
          batchCodeResult.error || 'Failed to generate batch code'
        );
      }

      const batchCode = batchCodeResult.batchCode;

      const updatedBatch: SterilizationBatch = {
        ...currentBatch,
        batchCode,
        status: 'ready',
        packageInfo,
        auditTrail: [
          ...currentBatch.auditTrail,
          {
            id: `audit_${Date.now()}`,
            timestamp: new Date(),
            action: 'ready_for_autoclave',
            operator: currentBatch.createdBy,
            details: `Batch finalized with code ${batchCode}`,
            metadata: { batchCode, packageInfo },
          },
        ],
      };

      set((state) => ({
        currentBatch: updatedBatch,
        batches: state.batches.map((batch) =>
          batch.id === currentBatch.id ? updatedBatch : batch
        ),
        batchHistory: [...state.batchHistory, updatedBatch],
        batchLoading: false,
      }));
    } catch (error) {
      set({ batchLoading: false });
      throw error;
    }
  },

  updateBatchStatus: (
    batchId: string,
    status: SterilizationBatch['status']
  ) => {
    set((state) => ({
      batches: state.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status,
              auditTrail: [
                ...batch.auditTrail,
                {
                  id: `audit_${Date.now()}`,
                  timestamp: new Date(),
                  action:
                    status === 'in_autoclave'
                      ? 'autoclave_started'
                      : status === 'completed'
                        ? 'autoclave_completed'
                        : 'tool_added',
                  operator: batch.createdBy,
                  details: `Batch status updated to ${status}`,
                  metadata: { status },
                },
              ],
            }
          : batch
      ),
      currentBatch:
        state.currentBatch?.id === batchId
          ? { ...state.currentBatch, status }
          : state.currentBatch,
    }));
  },

  getBatchById: (batchId: string) => {
    const { batches, batchHistory } = get();
    return (
      [...batches, ...batchHistory].find((batch) => batch.id === batchId) ||
      null
    );
  },

  getBatchesByStatus: (status: SterilizationBatch['status']) => {
    const { batches, batchHistory } = get();
    return [...batches, ...batchHistory].filter(
      (batch) => batch.status === status
    );
  },

  clearCurrentBatch: () => set({ currentBatch: null }),
  setBatchLoading: (loading: boolean) => set({ batchLoading: loading }),
});
