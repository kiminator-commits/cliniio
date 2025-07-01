import { StateCreator } from 'zustand';

export interface Tool {
  id: string;
  label: string;
  status: string;
  phase?: string;
}

export interface ToolCycleSlice {
  toolsInCycle: Tool[];
  addToolToCycle: (tool: Tool) => void;
  clearCycle: () => void;
}

export const createToolCycleSlice: StateCreator<ToolCycleSlice> = set => ({
  toolsInCycle: [],
  addToolToCycle: tool =>
    set(state => ({
      toolsInCycle: [...state.toolsInCycle, tool],
    })),
  clearCycle: () => set({ toolsInCycle: [] }),
});
