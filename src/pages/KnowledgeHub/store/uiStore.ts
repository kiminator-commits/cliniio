import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// UI State interface
interface UIState {
  selectedCategory: string;
  validationError: string | null;
}

// UI Actions interface
interface UIActions {
  setSelectedCategory: (category: string) => void;
  setValidationError: (error: string | null) => void;
  clearValidationError: () => void;
}

// Combined UI store type
type UIStore = UIState & UIActions;

// Create the UI store
export const useUIStore = create<UIStore>()(
  devtools((set) => ({
    // Initial state
    selectedCategory: '',
    validationError: null,

    // UI Actions
    setSelectedCategory: (category: string) =>
      set({ selectedCategory: category }),
    setValidationError: (error: string | null) =>
      set({ validationError: error }),
    clearValidationError: () => set({ validationError: null }),
  }))
);

// Selector hooks for UI state
export const useSelectedCategory = () =>
  useUIStore((state) => state.selectedCategory);
export const useValidationError = () =>
  useUIStore((state) => state.validationError);

// Action hooks for UI
export const useSetSelectedCategory = () =>
  useUIStore((state) => state.setSelectedCategory);
export const useSetValidationError = () =>
  useUIStore((state) => state.setValidationError);
export const useClearValidationError = () =>
  useUIStore((state) => state.clearValidationError);
