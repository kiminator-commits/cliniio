import { create } from 'zustand';
import {
  createBiologicalIndicatorSlice,
  BiologicalIndicatorState,
} from './slices/biologicalIndicatorSlice';
import {
  createComplianceSettingsSlice,
  ComplianceSettingsState,
} from './slices/complianceSettingsSlice';
import { createSterilizationCycleSlice } from './slices/sterilizationCycleSlice';
import { SterilizationCycleState } from './slices/types/sterilizationCycleTypes';
import { createUIStateSlice, UIState } from './slices/uiStateSlice';
import {
  createToolManagementSlice,
  ToolManagementState,
} from './slices/toolManagementSlice';
import {
  createBatchManagementSlice,
  BatchManagementState,
} from './slices/batchManagementSlice';
import { createBatchCodeSlice, BatchCodeState } from './slices/batchCodeSlice';
import { createBatchSlice, BatchState } from './slices/batchSlice';
import { createToolDataSlice, ToolDataState } from './slices/toolDataSlice';
import {
  createToolActionsSlice,
  ToolActionsState,
} from './slices/toolActionsSlice';
import {
  createPackagingSessionSlice,
  PackagingSessionState,
} from './slices/packagingSessionSlice';

// Consolidated store type with only the necessary slices
type SterilizationStore = BiologicalIndicatorState &
  ComplianceSettingsState &
  SterilizationCycleState &
  UIState &
  ToolManagementState &
  BatchManagementState &
  BatchCodeState &
  BatchState &
  ToolDataState &
  ToolActionsState &
  PackagingSessionState;

export const useSterilizationStore = create<SterilizationStore>()((...a) => ({
  ...createBiologicalIndicatorSlice(...a),
  ...createComplianceSettingsSlice(...a),
  ...createSterilizationCycleSlice(...a),
  ...createUIStateSlice(...a),
  ...createToolManagementSlice(...a),
  ...createBatchManagementSlice(...a),
  ...createBatchCodeSlice(...a),
  ...createBatchSlice(...a),
  ...createToolDataSlice(...a),
  ...createToolActionsSlice(...a),
  ...createPackagingSessionSlice(...a),
}));

// Re-export types for convenience
export type {
  SterilizationPhase,
  SterilizationCycle,
} from './slices/types/sterilizationCycleTypes';
export type { BITestResult } from '../types/toolTypes';
