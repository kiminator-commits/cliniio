import { StateCreator } from 'zustand';

export interface InventoryFilterState {
  // Search and filter state
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
  statusFilter: string;

  // Sort state
  sortField: string;
  sortDirection: 'asc' | 'desc';

  // Filter actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;

  // Sort actions
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;

  // Utility actions
  clearFilters: () => void;
  resetFilters: () => void;
}

export const createInventoryFilterSlice: StateCreator<
  InventoryFilterState,
  [],
  [],
  InventoryFilterState
> = set => ({
  // Search and filter state
  searchQuery: '',
  categoryFilter: '',
  locationFilter: '',
  statusFilter: '',

  // Sort state
  sortField: 'name',
  sortDirection: 'asc',

  // Filter actions
  setSearchQuery: query => set({ searchQuery: query }),
  setCategoryFilter: filter => set({ categoryFilter: filter }),
  setLocationFilter: filter => set({ locationFilter: filter }),
  setStatusFilter: filter => set({ statusFilter: filter }),

  // Sort actions
  setSortField: field => set({ sortField: field }),
  setSortDirection: direction => set({ sortDirection: direction }),

  // Utility actions
  clearFilters: () =>
    set({
      searchQuery: '',
      categoryFilter: '',
      locationFilter: '',
      statusFilter: '',
    }),
  resetFilters: () =>
    set({
      searchQuery: '',
      categoryFilter: '',
      locationFilter: '',
      statusFilter: '',
      sortField: 'name',
      sortDirection: 'asc',
    }),
});
