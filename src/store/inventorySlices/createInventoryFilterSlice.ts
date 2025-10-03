import { StateCreator } from 'zustand';

export type FilterState = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  category: string;
  setCategoryFilter: (category: string) => void;
  location: string;
  setLocationFilter: (location: string) => void;
};

export const createInventoryFilterSlice: StateCreator<FilterState> = (set) => ({
  searchQuery: '',
  setSearchQuery: (value: string) => set({ searchQuery: value }),
  category: '',
  setCategoryFilter: (category: string) => set({ category }),
  location: '',
  setLocationFilter: (location: string) => set({ location }),
});
