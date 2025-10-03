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

  // Legacy compatibility
  pagination: {
    currentPage: number;
    pageSize: number;
  };
}

export const createInventoryPaginationSlice: StateCreator<
  InventoryPaginationState,
  [],
  [],
  InventoryPaginationState
> = (set) => ({
  // Pagination state
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,

  // Pagination actions
  setCurrentPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),
  setTotalItems: (total) => set({ totalItems: total }),

  // Utility actions
  nextPage: () =>
    set((state) => {
      const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      return { currentPage: Math.min(state.currentPage + 1, totalPages) };
    }),
  previousPage: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    })),
  goToPage: (page) =>
    set((state) => {
      const totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
      return { currentPage: Math.max(1, Math.min(page, totalPages)) };
    }),
  resetPagination: () => set({ currentPage: 1 }),

  // Computed values
  get totalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  },
  get startIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  },
  get endIndex() {
    return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
  },

  // Legacy compatibility
  get pagination() {
    return {
      currentPage: this.currentPage,
      pageSize: this.itemsPerPage,
    };
  },
});
