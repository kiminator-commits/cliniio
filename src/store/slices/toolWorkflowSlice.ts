import { StateCreator } from 'zustand';

export interface ToolWorkflowState {
  activeToolId: string | null;
  activeWorkflowType: 'clean' | 'dirty' | 'damaged' | 'imported' | 'packaged' | null;
  setActiveToolId: (id: string | null) => void;
  setActiveWorkflowType: (type: ToolWorkflowState['activeWorkflowType']) => void;
  resetWorkflow: () => void;
}

export const createToolWorkflowSlice: StateCreator<
  ToolWorkflowState,
  [],
  [],
  ToolWorkflowState
> = set => ({
  activeToolId: null,
  activeWorkflowType: null,
  setActiveToolId: id => set({ activeToolId: id }),
  setActiveWorkflowType: type => set({ activeWorkflowType: type }),
  resetWorkflow: () => set({ activeToolId: null, activeWorkflowType: null }),
});
