import { StateCreator } from 'zustand';
import { LocalInventoryItem } from '@/types/inventoryTypes';

export interface InventoryDataState {
  // Core data
  items: LocalInventoryItem[];
  categories: string[];
  favorites: string[];

  // Form data
  formData: Partial<LocalInventoryItem>;
  isEditMode: boolean;
  expandedSections: Record<string, boolean>;

  // Loading states
  isLoading: boolean;
  isCategoriesLoading: boolean;

  // Data actions
  setItems: (items: LocalInventoryItem[]) => void;
  setCategories: (categories: string[]) => void;
  addItem: (item: LocalInventoryItem) => void;
  updateItem: (id: string, updates: Partial<LocalInventoryItem>) => void;
  deleteItem: (id: string) => void;

  // Form actions
  setFormData: (data: Partial<LocalInventoryItem>) => void;
  setEditMode: (editMode: boolean) => void;
  setExpandedSections: (sections: Record<string, boolean>) => void;
  resetFormData: () => void;

  // Favorites actions
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (itemId: string) => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setCategoriesLoading: (loading: boolean) => void;
}

export const createInventoryDataSlice: StateCreator<
  InventoryDataState,
  [],
  [],
  InventoryDataState
> = set => ({
  // Core data
  items: [],
  categories: [],
  favorites: [],

  // Form data
  formData: {},
  isEditMode: false,
  expandedSections: {},

  // Loading states
  isLoading: false,
  isCategoriesLoading: false,

  // Data actions
  setItems: items => set({ items }),
  setCategories: categories => set({ categories }),
  addItem: item => set(state => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...updates } : item)),
    })),
  deleteItem: id =>
    set(state => ({
      items: state.items.filter(item => item.id !== id),
    })),

  // Form actions
  setFormData: data => set({ formData: data }),
  setEditMode: editMode => set({ isEditMode: editMode }),
  setExpandedSections: sections => set({ expandedSections: sections }),
  resetFormData: () => set({ formData: {}, isEditMode: false, expandedSections: {} }),

  // Favorites actions
  setFavorites: favorites => set({ favorites }),
  toggleFavorite: itemId =>
    set(state => {
      const newFavorites = state.favorites.includes(itemId)
        ? state.favorites.filter(id => id !== itemId)
        : [...state.favorites, itemId];
      return { favorites: newFavorites };
    }),

  // Loading actions
  setLoading: loading => set({ isLoading: loading }),
  setCategoriesLoading: loading => set({ isCategoriesLoading: loading }),
});
