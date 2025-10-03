import { StateCreator } from 'zustand';
import { Tool } from '../../types/toolTypes';

export interface ToolDataState {
  availableTools: Tool[];
  toolsInCycle: Tool[];
  addToolToCycle: (toolId: string) => void;
  clearCycle: () => void;
  incrementToolCycleCount: (toolId: string) => void;
  checkToolReplacementNeeded: (toolId: string) => boolean;
  getToolCycleCount: (toolId: string) => number;
  setAvailableTools: (tools: Tool[]) => void;
}

export const createToolDataSlice: StateCreator<
  ToolDataState,
  [],
  [],
  ToolDataState
> = (set, get) => ({
  availableTools: [], // Empty array - data should be fetched from Supabase
  toolsInCycle: [],

  setAvailableTools: (tools: Tool[]) => {
    set({ availableTools: tools });
  },

  addToolToCycle: (toolId: string) => {
    const tool = get().availableTools.find((t) => t.id === toolId);
    if (tool) {
      set((state) => ({
        toolsInCycle: [...state.toolsInCycle, tool],
      }));
    }
  },

  clearCycle: () => {
    set({ toolsInCycle: [] });
  },

  incrementToolCycleCount: (toolId: string) => {
    set((state) => ({
      availableTools: state.availableTools.map((tool) =>
        tool.id === toolId ? { ...tool, cycleCount: tool.cycleCount + 1 } : tool
      ),
    }));
  },

  checkToolReplacementNeeded: (toolId: string) => {
    const tool = get().availableTools.find((t) => t.id === toolId);
    return tool ? tool.cycleCount >= (tool.maxCycles || 200) : false;
  },

  getToolCycleCount: (toolId: string) => {
    const tool = get().availableTools.find((t) => t.id === toolId);
    return tool ? tool.cycleCount : 0;
  },
});
