import { StateCreator } from 'zustand';

// Helper functions for localStorage persistence
const getFavoritesFromStorage = (): string[] => {
  try {
    const stored = localStorage.getItem('cliniio-favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load favorites from localStorage:', error);
    return [];
  }
};

const saveFavoritesToStorage = (favorites: string[]): void => {
  try {
    localStorage.setItem('cliniio-favorites', JSON.stringify(favorites));
  } catch (error) {
    console.warn('Failed to save favorites to localStorage:', error);
  }
};

export interface InventoryFilterState {
  // Search and filter state
  searchQuery: string;
  searchTerm: string; // Legacy compatibility
  categoryFilter: string;
  locationFilter: string;
  statusFilter: string;
  activeFilter: string; // Legacy compatibility

  // Favorites state
  favorites: string[];
  showFavoritesOnly: boolean;

  // Sort state
  sortField: string;
  sortDirection: 'asc' | 'desc';

  // Filter actions
  setSearchQuery: (query: string) => void;
  setSearchTerm: (term: string) => void; // Legacy compatibility
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setActiveFilter: (filter: string) => void; // Legacy compatibility

  // Favorites actions
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (itemId: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;

  // Sort actions
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;

  // Utility actions
  clearFilters: () => void;
  resetFilters: () => void;
  clearSearch: () => void;
}

export const createInventoryFilterSlice: StateCreator<
  InventoryFilterState,
  [],
  [],
  InventoryFilterState
> = (set) => ({
  // Search and filter state
  searchQuery: '',
  searchTerm: '', // Legacy compatibility
  categoryFilter: '',
  locationFilter: '',
  statusFilter: '',
  activeFilter: '', // Legacy compatibility

  // Favorites state - initialize from localStorage
  favorites: getFavoritesFromStorage(),
  showFavoritesOnly: false,

  // Sort state
  sortField: 'name',
  sortDirection: 'asc',

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query, searchTerm: query }), // Sync both for compatibility
  setSearchTerm: (term) => set({ searchTerm: term, searchQuery: term }), // Sync both for compatibility
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setLocationFilter: (filter) => set({ locationFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setActiveFilter: (filter) => set({ activeFilter: filter }), // Legacy compatibility

  // Favorites actions with persistence
  setFavorites: (favorites) => {
    set({ favorites });
    saveFavoritesToStorage(favorites);
  },
  toggleFavorite: (itemId) =>
    set((state) => {
      const newFavorites = state.favorites.includes(itemId)
        ? state.favorites.filter((id) => id !== itemId)
        : [...state.favorites, itemId];

      // Save to localStorage
      saveFavoritesToStorage(newFavorites);

      return { favorites: newFavorites };
    }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  // Sort actions
  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),

  // Utility actions
  clearFilters: () =>
    set({
      searchQuery: '',
      searchTerm: '',
      categoryFilter: '',
      locationFilter: '',
      statusFilter: '',
      activeFilter: '',
    }),
  resetFilters: () =>
    set({
      searchQuery: '',
      searchTerm: '',
      categoryFilter: '',
      locationFilter: '',
      statusFilter: '',
      activeFilter: '',
      sortField: 'name',
      sortDirection: 'asc',
      showFavoritesOnly: false,
    }),
  clearSearch: () =>
    set({
      searchQuery: '',
      searchTerm: '',
    }),
});
