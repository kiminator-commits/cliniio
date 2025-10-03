import { StateCreator } from 'zustand';

export interface InventoryUIState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCategoryChange: (tab: string) => void;

  showTrackedOnly: boolean;
  setShowTrackedOnly: (show: boolean) => void;

  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;

  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  trackedItems: Set<string>;
  trackingData: Map<string, { doctor: string; timestamp: string }>;
  toggleTrackedItem: (itemId: string, doctor: string) => void;

  isInventoryLoading: boolean;
  setInventoryLoading: (loading: boolean) => void;
  isCategoriesLoading: boolean;
  setCategoriesLoading: (loading: boolean) => void;

  favorites: string[];
  setFavorites: (favorites: string[]) => void;
  handleToggleFavorite: (itemId: string) => void;

  // Data State
  inventoryItems: Record<string, unknown>[];
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setPagination: (pagination: {
    currentPage: number;
    pageSize: number;
  }) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
  };
  sorting: {
    field: string | null;
    direction: 'asc' | 'desc';
  };
  setSorting: (sorting: {
    field: string | null;
    direction: 'asc' | 'desc';
  }) => void;
  filters: Record<string, unknown>;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;

  // Utility Actions
  resetFilters: () => void;
}

export const createInventoryUIStoreSlice: StateCreator<
  InventoryUIState,
  [],
  [],
  InventoryUIState
> = (set) => ({
  activeTab: 'tools',
  setActiveTab: (tab) => set({ activeTab: tab }),
  onCategoryChange: (tab) => set({ activeTab: tab }),

  showTrackedOnly: false,
  setShowTrackedOnly: (val) => set({ showTrackedOnly: val }),

  showFavoritesOnly: false,
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  showFilters: false,
  setShowFilters: (show) => set({ showFilters: show }),

  trackedItems: new Set(),
  trackingData: new Map(),
  toggleTrackedItem: (itemId: string, doctor: string) =>
    set((state) => {
      const newTrackedItems = new Set(state.trackedItems);
      const newTrackingData = new Map(state.trackingData);

      if (newTrackedItems.has(itemId)) {
        newTrackedItems.delete(itemId);
        newTrackingData.delete(itemId);
      } else {
        newTrackedItems.add(itemId);
        newTrackingData.set(itemId, {
          doctor,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        trackedItems: newTrackedItems,
        trackingData: newTrackingData,
      };
    }),

  isInventoryLoading: false,
  setInventoryLoading: (loading) => set({ isInventoryLoading: loading }),
  isCategoriesLoading: false,
  setCategoriesLoading: (loading) => set({ isCategoriesLoading: loading }),

  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  handleToggleFavorite: (itemId: string) =>
    set((state) => {
      const newFavorites = [...state.favorites];
      const index = newFavorites.indexOf(itemId);

      if (index > -1) {
        newFavorites.splice(index, 1);
      } else {
        newFavorites.push(itemId);
      }

      return { favorites: newFavorites };
    }),

  // Data State
  inventoryItems: [],
  categories: [],
  addCategory: (category: string) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),
  removeCategory: (category: string) =>
    set((state) => ({
      categories: state.categories.filter((c) => c !== category),
    })),
  setPagination: (pagination: { currentPage: number; pageSize: number }) =>
    set({ pagination }),
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
  sorting: {
    field: null,
    direction: 'asc',
  },
  setSorting: (sorting: { field: string | null; direction: 'asc' | 'desc' }) =>
    set({ sorting }),
  filters: {},
  selectedItems: [],
  setSelectedItems: (items: string[]) => set({ selectedItems: items }),

  // Utility Actions
  resetFilters: () =>
    set(() => ({
      showTrackedOnly: false,
      showFavoritesOnly: false,
      showFilters: false,
    })),
});
