import { StateCreator } from 'zustand';

export interface BiologicalIndicatorState {
  biTestCompleted: boolean;
  biTestDate: string | null;
  setBiTestCompleted: (completed: boolean) => void;
  setBiTestDate: (date: string) => void;
}

export const createBiologicalIndicatorSlice: StateCreator<
  BiologicalIndicatorState,
  [],
  [],
  BiologicalIndicatorState
> = set => ({
  biTestCompleted: false,
  biTestDate: null,
  setBiTestCompleted: completed => set({ biTestCompleted: completed }),
  setBiTestDate: date => set({ biTestDate: date }),
});
