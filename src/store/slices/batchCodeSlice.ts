import { StateCreator } from 'zustand';
import {
  BatchCodeGeneration,
  SterilizationBatch,
} from '../../types/sterilizationTypes';

export interface BatchCodeState {
  // Batch code generation
  lastGeneratedCode: BatchCodeGeneration | null;
  generatedCodes: BatchCodeGeneration[];

  // Actions
  generateBatchCode: (operator: string, toolCount: number) => Promise<string>;
  validateBatchCode: (code: string) => boolean;
  getBatchByCode: (
    code: string,
    batches: SterilizationBatch[]
  ) => SterilizationBatch | null;
}

export const createBatchCodeSlice: StateCreator<
  BatchCodeState,
  [],
  [],
  BatchCodeState
> = (set) => ({
  // Initial state
  lastGeneratedCode: null,
  generatedCodes: [],

  // Batch Code Generation Actions
  generateBatchCode: async (operator: string, toolCount: number) => {
    const isSingleTool = toolCount === 1;

    // Generate a unique batch code: YYYYMMDD-HHMM-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toISOString().slice(11, 17).replace(/:/g, '');
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const batchCode = `${dateStr}-${timeStr}-${randomStr}`;

    const codeGeneration: BatchCodeGeneration = {
      code: batchCode,
      generatedAt: now,
      operator,
      toolCount,
      isSingleTool,
    };

    set((state) => ({
      lastGeneratedCode: codeGeneration,
      generatedCodes: [...state.generatedCodes, codeGeneration],
    }));

    return batchCode;
  },

  validateBatchCode: (code: string) => {
    // Basic validation: should match pattern YYYYMMDD-HHMM-XXX
    const codePattern = /^\d{8}-\d{4}-[A-Z0-9]{3}$/;
    return codePattern.test(code);
  },

  getBatchByCode: (code: string, batches: SterilizationBatch[]) => {
    return batches.find((batch) => batch.batchCode === code) || null;
  },
});
