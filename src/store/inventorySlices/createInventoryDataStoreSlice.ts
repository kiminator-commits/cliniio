import { StateCreator } from 'zustand';
import { LocalInventoryItem, ExpandedSections } from '@/types/inventoryTypes';
import { getDefaultExpandedSections } from '@/utils/inventoryHelpers';

export interface InventoryDataState {
  formData: Partial<LocalInventoryItem>;
  setFormData: (data: Partial<LocalInventoryItem>) => void;

  isEditMode: boolean;
  setEditMode: (val: boolean) => void;

  resetFormData: () => void;

  expandedSections: ExpandedSections;
  setExpandedSections: (val: ExpandedSections) => void;

  // Pagination state
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
  };

  // Filter state
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  category: string;
  setCategoryFilter: (category: string) => void;
  location: string;
  setLocationFilter: (location: string) => void;
}

export const createInventoryDataStoreSlice: StateCreator<
  InventoryDataState,
  [],
  [],
  InventoryDataState
> = (set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data }),

  isEditMode: false,
  setEditMode: (val) => set({ isEditMode: val }),

  resetFormData: () => set({ formData: {} }),

  expandedSections: getDefaultExpandedSections(),
  setExpandedSections: (val) => set({ expandedSections: val }),

  // Pagination state
  itemsPerPage: 3,
  setItemsPerPage: (count: number) => set({ itemsPerPage: count }),
  currentPage: 1,
  setCurrentPage: (page: number) =>
    set((state) => ({
      currentPage: page,
      pagination: { ...state.pagination, currentPage: page },
    })),
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },

  // Filter state
  searchQuery: '',
  setSearchQuery: (value: string) => set({ searchQuery: value }),
  category: '',
  setCategoryFilter: (category: string) => set({ category }),
  location: '',
  setLocationFilter: (location: string) => set({ location }),
});
