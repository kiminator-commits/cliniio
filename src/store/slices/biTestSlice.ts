import { StateCreator } from 'zustand';

export interface BITestSlice {
  lastBITestDate: string | null;
  setLastBITestDate: (date: string) => void;
}

export const createBITestSlice: StateCreator<BITestSlice> = set => ({
  lastBITestDate: null,
  setLastBITestDate: date => set({ lastBITestDate: date }),
});
