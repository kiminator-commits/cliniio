import { StateCreator } from 'zustand';

export interface WorkflowState {
  workflowType: string;
  setWorkflowType: (type: string) => void;
}

export const createWorkflowStateSlice: StateCreator<
  WorkflowState,
  [],
  [],
  WorkflowState
> = set => ({
  workflowType: '',
  setWorkflowType: type => set({ workflowType: type }),
});
