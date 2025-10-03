import { StateCreator } from 'zustand';

export type PaginationState = {
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
  };
};

export const createInventoryPaginationSlice: StateCreator<PaginationState> = (
  set
) => ({
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
});
