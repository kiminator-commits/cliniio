import { StateCreator } from 'zustand';

export interface SterilizationPhase {
  id: string;
  name: string;
  duration: number;
  completed: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface SterilizationCycle {
  id: string;
  phases: SterilizationPhase[];
  tools: string[];
  operator: string;
  startedAt: string;
  completedAt: string | null;
}

export interface SterilizationCycleState {
  currentCycle: SterilizationCycle | null;
  error: string | null;
  setCurrentCycle: (cycle: SterilizationCycle | null) => void;
  setError: (error: string | null) => void;
  startNewCycle: (operator: string) => void;
}

export const createSterilizationCycleSlice: StateCreator<
  SterilizationCycleState,
  [],
  [],
  SterilizationCycleState
> = set => ({
  currentCycle: null,
  error: null,
  setCurrentCycle: cycle => set({ currentCycle: cycle }),
  setError: error => set({ error }),
  startNewCycle: (operator: string) => {
    const cycleId = `cycle_${Date.now()}`;
    const newCycle: SterilizationCycle = {
      id: cycleId,
      phases: [],
      tools: [],
      operator,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    set({ currentCycle: newCycle });
  },
});
