import { StateCreator } from 'zustand';
import { ProblemType, Tool } from '../../types/sterilizationTypes';

export interface ToolActionsState {
  // Active tool state
  activeToolId: string | null;
  activeWorkflowType:
    | 'clean'
    | 'dirty'
    | 'problem'
    | 'imported'
    | 'packaged'
    | null;

  // Tool data (from toolDataSlice)
  availableTools: Tool[];
  toolsInCycle: Tool[];

  // Actions
  updateToolStatus: (
    toolId: string,
    status: 'bath1' | 'bath2' | 'airDry' | 'autoclave' | 'complete' | 'failed'
  ) => void;
  markToolAsDirty: (toolId: string) => void;
  markToolAsProblem: (
    toolId: string,
    problemType: ProblemType,
    notes?: string
  ) => Promise<void>;
  setActiveToolId: (id: string | null) => void;
  setActiveWorkflowType: (type: ToolActionsState['activeWorkflowType']) => void;
  resetWorkflow: () => void;
}

export const createToolActionsSlice: StateCreator<
  ToolActionsState,
  [],
  [],
  ToolActionsState
> = (set) => ({
  activeToolId: null,
  activeWorkflowType: null,
  availableTools: [],
  toolsInCycle: [],

  updateToolStatus: (
    toolId: string,
    status: 'bath1' | 'bath2' | 'airDry' | 'autoclave' | 'complete' | 'failed'
  ) => {
    set((state: ToolActionsState) => ({
      availableTools: (state.availableTools || []).map((tool: Tool) =>
        tool.id === toolId ? { ...tool, currentPhase: status } : tool
      ),
      toolsInCycle: (state.toolsInCycle || []).map((tool: Tool) =>
        tool.id === toolId ? { ...tool, currentPhase: status } : tool
      ),
    }));
  },

  markToolAsDirty: (toolId: string) => {
    set((state: ToolActionsState) => ({
      availableTools: (state.availableTools || []).map((tool: Tool) =>
        tool.id === toolId ? { ...tool, currentPhase: 'failed' } : tool
      ),
      toolsInCycle: (state.toolsInCycle || []).map((tool: Tool) =>
        tool.id === toolId ? { ...tool, currentPhase: 'failed' } : tool
      ),
    }));
  },

  markToolAsProblem: async (
    toolId: string,
    problemType: ProblemType,
    notes?: string
  ) => {
    const currentUser = 'Current User'; // This would come from auth context in real app

    set((state: ToolActionsState) => ({
      availableTools: (state.availableTools || []).map((tool: Tool) =>
        tool.id === toolId
          ? {
              ...tool,
              status: 'problem',
              problemType,
              problemNotes: notes,
              problemReportedBy: currentUser,
              problemReportedAt: new Date(),
            }
          : tool
      ),
      toolsInCycle: (state.toolsInCycle || []).map((tool: Tool) =>
        tool.id === toolId
          ? {
              ...tool,
              status: 'problem',
              problemType,
              problemNotes: notes,
              problemReportedBy: currentUser,
              problemReportedAt: new Date(),
            }
          : tool
      ),
    }));
  },

  setActiveToolId: (id: string | null) => set({ activeToolId: id }),
  setActiveWorkflowType: (type: ToolActionsState['activeWorkflowType']) =>
    set({ activeWorkflowType: type }),
  resetWorkflow: () => set({ activeToolId: null, activeWorkflowType: null }),
});
