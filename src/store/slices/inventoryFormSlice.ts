import { StateCreator } from 'zustand';
import { InventoryFormData, InventoryItem } from '@/types/inventory';

export interface InventoryFormState {
  formData: InventoryFormData;
  isEditMode: boolean;
  isDirty: boolean;
  isCloned: boolean;

  setFormData: (data: InventoryFormData) => void;
  mergeFormData: (data: Partial<InventoryFormData>) => void;
  updateField: <K extends keyof InventoryFormData>(
    field: K,
    value: InventoryFormData[K]
  ) => void;
  resetForm: () => void;
  setEditMode: (isEdit: boolean) => void;
  setIsCloned: (isCloned: boolean) => void;
  markAsDirty: () => void;
  markAsClean: () => void;

  openEditModal: (item: InventoryItem) => void;
  closeEditModal: () => void;
}

function getDefaultFormData(): InventoryFormData {
  return {
    id: '',
    itemName: '',
    category: '',
    location: '',
    status: '',
    quantity: 1,
    unitCost: 0,
    minimumQuantity: 0,
    maximumQuantity: 0,
    supplier: '',
    barcode: '',
    sku: '',
    description: '',
    notes: '',
    updated_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export const createInventoryFormSlice: StateCreator<
  InventoryFormState,
  [],
  [],
  InventoryFormState
> = (set, get) => ({
  formData: getDefaultFormData(),
  isEditMode: false,
  isDirty: false,
  isCloned: false,

  setFormData: (data: InventoryFormData) =>
    set({
      formData: data,
      isDirty: false,
    }),

  mergeFormData: (data: Partial<InventoryFormData>) => {
    console.log('🔍 mergeFormData called with:', data);
    set((state) => ({
      formData: { ...state.formData, ...data },
      isDirty: true,
    }));
  },

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
      isDirty: true,
    })),

  resetForm: () =>
    set({
      formData: getDefaultFormData(),
      isEditMode: false,
      isDirty: false,
      isCloned: false,
    }),

  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  setIsCloned: (isCloned) => set({ isCloned: isCloned }),
  markAsDirty: () => set({ isDirty: true }),
  markAsClean: () => set({ isDirty: false }),

  openEditModal: (item: InventoryItem) => {
    const { setFormData, setEditMode } = get();
    const formData: InventoryFormData = {
      id: item.id,
      itemName: item.name || item.item || '',
      category: item.category || '',
      location: item.location || '',
      status: item.status || '',
      quantity: item.quantity || 1,
      unitCost: item.unit_cost || 0,
      minimumQuantity: item.reorder_point || 0,
      maximumQuantity:
        ((item.data as Record<string, unknown>)?.maximumQuantity as number) ||
        0,
      supplier: item.supplier || '',
      barcode: item.barcode || '',
      sku: item.sku || '',
      description: item.description || '',
      notes: item.notes || '',
      updated_at: item.updated_at || new Date().toISOString(),
      createdAt: item.created_at || new Date().toISOString(),
    };
    setFormData(formData);
    setEditMode(true);
  },

  closeEditModal: () => {
    const { resetForm } = get();
    resetForm();
  },
});
