import { StateCreator } from 'zustand';

export interface InventoryPaginationState {
  // Pagination state
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalItems: (total: number) => void;

  // Utility actions
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  resetPagination: () => void;

  // Computed values
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export const createInventoryPaginationSlice: StateCreator<
  InventoryPaginationState,
  [],
  [],
  InventoryPaginationState
> = (set, get) => ({
  // Pagination state
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,

  // Pagination actions
  setCurrentPage: page => set({ currentPage: page }),
  setItemsPerPage: items => set({ itemsPerPage: items, currentPage: 1 }),
  setTotalItems: total => set({ totalItems: total }),

  // Utility actions
  nextPage: () =>
    set(state => {
      const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      return { currentPage: Math.min(state.currentPage + 1, totalPages) };
    }),
  previousPage: () =>
    set(state => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    })),
  goToPage: page =>
    set(state => {
      const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      return { currentPage: Math.max(1, Math.min(page, totalPages)) };
    }),
  resetPagination: () => set({ currentPage: 1 }),

  // Computed values
  get totalPages() {
    return Math.ceil(get().totalItems / get().itemsPerPage);
  },
  get startIndex() {
    return (get().currentPage - 1) * get().itemsPerPage;
  },
  get endIndex() {
    return Math.min(get().startIndex + get().itemsPerPage, get().totalItems);
  },
});
