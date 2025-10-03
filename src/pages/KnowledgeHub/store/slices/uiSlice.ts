import { StateCreator } from 'zustand';

// UI State interface
export interface UIState {
  selectedCategory: string;
  validationError: string | null;
}

// UI Actions interface
export interface UIActions {
  setSelectedCategory: (category: string) => void;
  setValidationError: (error: string | null) => void;
  clearValidationError: () => void;
}

// Combined UI slice type
export type UISlice = UIState & UIActions;

// UI slice creator
export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Initial state
  selectedCategory: '',
  validationError: null,

  // UI Actions
  setSelectedCategory: (category: string) =>
    set({ selectedCategory: category }),
  setValidationError: (error: string | null) => set({ validationError: error }),
  clearValidationError: () => set({ validationError: null }),
});
