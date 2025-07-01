import { StateCreator } from 'zustand';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { getDefaultExpandedSections } from '@/utils/inventoryHelpers';

export interface InventoryDataState {
  formData: Partial<LocalInventoryItem>;
  setFormData: (data: Partial<LocalInventoryItem>) => void;

  isEditMode: boolean;
  setEditMode: (val: boolean) => void;

  resetFormData: () => void;

  favorites: string[];
  setFavorites: (val: string[]) => void;

  expandedSections: Record<string, boolean>;
  setExpandedSections: (val: Record<string, boolean>) => void;
}

export const createInventoryDataStoreSlice: StateCreator<
  InventoryDataState,
  [],
  [],
  InventoryDataState
> = set => ({
  formData: {},
  setFormData: data => set({ formData: data }),

  isEditMode: false,
  setEditMode: val => set({ isEditMode: val }),

  resetFormData: () => set({ formData: {} }),

  favorites: [],
  setFavorites: val => set({ favorites: val }),

  expandedSections: getDefaultExpandedSections() as unknown as Record<string, boolean>,
  setExpandedSections: val => set({ expandedSections: val }),
});
