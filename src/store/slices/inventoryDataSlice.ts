import { StateCreator } from 'zustand';
import { InventoryItem } from '@/types/inventoryTypes';

export interface InventoryDataState {
  // Core data
  items: InventoryItem[];
  categories: string[];
  selectedItems: string[];

  // Loading states
  isLoading: boolean;
  isCategoriesLoading: boolean;

  // Data actions
  setItems: (items: InventoryItem[]) => void;
  setCategories: (categories: string[]) => void;
  addItem: (item: InventoryItem) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setSelectedItems: (items: string[]) => void;

  // Loading actions
  setLoading: (loading: boolean) => void;
  setCategoriesLoading: (loading: boolean) => void;
  setInventoryLoading: (loading: boolean) => void;

  // Data refresh methods
  refreshInventoryData: () => Promise<void>;
  getFilteredItems: () => InventoryItem[];
  getUniqueCategories: () => string[];

  // Legacy compatibility
  inventoryItems: InventoryItem[];
}

export const createInventoryDataSlice: StateCreator<
  InventoryDataState,
  [],
  [],
  InventoryDataState
> = (set) => ({
  // Core data
  items: [],
  categories: [],
  selectedItems: [],

  // Loading states
  isLoading: false,
  isCategoriesLoading: false,

  // Data actions
  setItems: (items) => set({ items, inventoryItems: items }),
  setCategories: (categories) => set({ categories }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      inventoryItems: [...state.items, item],
    })),
  updateItem: (id, updates) =>
    set((state) => {
      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      return {
        items: updatedItems,
        inventoryItems: updatedItems,
      };
    }),
  deleteItem: (id) =>
    set((state) => {
      const filteredItems = state.items.filter((item) => item.id !== id);
      return {
        items: filteredItems,
        inventoryItems: filteredItems,
      };
    }),
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),
  removeCategory: (category) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat !== category),
    })),
  setSelectedItems: (items) => set({ selectedItems: items }),

  // Loading actions
  setLoading: (loading) => set({ isLoading: loading }),
  setCategoriesLoading: (loading) => set({ isCategoriesLoading: loading }),
  setInventoryLoading: (loading) => set({ isLoading: loading }),

  // Data refresh methods
  refreshInventoryData: async () => {
    // This is a placeholder implementation
    // In a real implementation, this would trigger a data refresh
    console.log('Refreshing inventory data...');
  },
  getFilteredItems: () => {
    // This is a placeholder implementation
    // In a real implementation, this would return filtered items
    return [];
  },
  getUniqueCategories: () => {
    // This is a placeholder implementation
    // In a real implementation, this would return unique categories
    return [];
  },

  // Legacy compatibility
  inventoryItems: [],
});
