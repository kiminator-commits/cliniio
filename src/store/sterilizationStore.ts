import { create } from 'zustand';
import {
  createBiologicalIndicatorSlice,
  BiologicalIndicatorState,
} from './slices/biologicalIndicatorSlice';
import { createToolWorkflowSlice, ToolWorkflowState } from './slices/toolWorkflowSlice';
import {
  createComplianceSettingsSlice,
  ComplianceSettingsState,
} from './slices/complianceSettingsSlice';
import { createBatchTrackingSlice, BatchTrackingState } from './slices/batchTrackingSlice';
import {
  createSterilizationCycleSlice,
  SterilizationCycleState,
} from './slices/sterilizationCycleSlice';
import { createUIStateSlice, UIState } from './slices/uiStateSlice';
import { createWorkflowStateSlice, WorkflowState } from './slices/workflowStateSlice';
import { createScannerStateSlice, ScannerState } from './slices/scannerStateSlice';
import { createToolManagementSlice, ToolManagementState } from './slices/toolManagementSlice';

// Add additional slice interfaces as they're created

type SterilizationStore = BiologicalIndicatorState &
  ToolWorkflowState &
  ComplianceSettingsState &
  BatchTrackingState &
  SterilizationCycleState &
  UIState &
  WorkflowState &
  ScannerState &
  ToolManagementState;

export const useSterilizationStore = create<SterilizationStore>()((...a) => ({
  ...createBiologicalIndicatorSlice(...a),
  ...createToolWorkflowSlice(...a),
  ...createComplianceSettingsSlice(...a),
  ...createBatchTrackingSlice(...a),
  ...createSterilizationCycleSlice(...a),
  ...createUIStateSlice(...a),
  ...createWorkflowStateSlice(...a),
  ...createScannerStateSlice(...a),
  ...createToolManagementSlice(...a),
}));
