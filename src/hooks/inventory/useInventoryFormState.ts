import { useState, useCallback } from 'react';
import { LocalInventoryItem } from '@/types/inventoryTypes';
import { getDefaultFormData, getDefaultExpandedSections } from '@/utils/inventoryHelpers';

interface FormState {
  formData: Partial<LocalInventoryItem>;
  expandedSections: Record<string, boolean>;
  isEditMode: boolean;
  isDirty: boolean;
}

interface UseInventoryFormStateReturn {
  formState: FormState;
  updateField: (field: keyof LocalInventoryItem, value: unknown) => void;
  updateMultipleFields: (fields: Partial<LocalInventoryItem>) => void;
  toggleSection: (section: string) => void;
  setEditMode: (isEdit: boolean) => void;
  resetForm: () => void;
  setFormData: (data: Partial<LocalInventoryItem>) => void;
  markAsDirty: () => void;
  markAsClean: () => void;
}

export const useInventoryFormState = (): UseInventoryFormStateReturn => {
  const [formState, setFormState] = useState<FormState>({
    formData: getDefaultFormData(),
    expandedSections: getDefaultExpandedSections(),
    isEditMode: false,
    isDirty: false,
  });

  const updateField = useCallback((field: keyof LocalInventoryItem, value: unknown) => {
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      isDirty: true,
    }));
  }, []);

  const updateMultipleFields = useCallback((fields: Partial<LocalInventoryItem>) => {
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...fields,
      },
      isDirty: true,
    }));
  }, []);

  const toggleSection = useCallback((section: string) => {
    setFormState(prev => ({
      ...prev,
      expandedSections: {
        ...prev.expandedSections,
        [section]: !prev.expandedSections[section],
      },
    }));
  }, []);

  const setEditMode = useCallback((isEdit: boolean) => {
    setFormState(prev => ({
      ...prev,
      isEditMode: isEdit,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      formData: getDefaultFormData(),
      expandedSections: getDefaultExpandedSections(),
      isEditMode: false,
      isDirty: false,
    });
  }, []);

  const setFormData = useCallback((data: Partial<LocalInventoryItem>) => {
    setFormState(prev => ({
      ...prev,
      formData: data,
      isDirty: false,
    }));
  }, []);

  const markAsDirty = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      isDirty: true,
    }));
  }, []);

  const markAsClean = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      isDirty: false,
    }));
  }, []);

  return {
    formState,
    updateField,
    updateMultipleFields,
    toggleSection,
    setEditMode,
    resetForm,
    setFormData,
    markAsDirty,
    markAsClean,
  };
};
