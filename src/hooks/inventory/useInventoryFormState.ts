import { useCallback } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { InventoryFormData, ExpandedSections } from '@/types/inventory';

/**
 * Custom hook for managing inventory form state and actions
 * Provides enhanced form handling with proper TypeScript typing
 * @returns Object containing form state, actions, and enhanced handlers
 */
export const useInventoryFormState = () => {
  const {
    // Form state from store
    formData,
    isEditMode,
    isDirty,
    expandedSections,

    // Form actions from store
    setFormData,
    updateField,
    setEditMode,
    setExpandedSections,
    resetForm,
    markAsDirty,
    markAsClean,

    // Convenience actions from store
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  } = useInventoryStore();

  // Enhanced actions that combine store actions
  /**
   * Handles form field changes with proper TypeScript typing
   * @param field - The form field to update
   * @param value - The new value for the field
   */
  const handleFormChange = useCallback(
    <K extends keyof InventoryFormData>(
      field: K,
      value: InventoryFormData[K]
    ) => {
      updateField(field, value);
    },
    [updateField]
  );

  /**
   * Handles toggling of form sections (expand/collapse)
   * @param section - The section to toggle
   */
  const handleToggleSection = useCallback(
    (section: keyof ExpandedSections) => {
      setExpandedSections({
        ...expandedSections,
        [section]: !expandedSections[section],
      });
    },
    [setExpandedSections, expandedSections]
  );

  /**
   * Handles form reset to default state
   */
  const handleResetForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

  /**
   * Handles setting complete form data
   * @param data - The complete form data to set
   */
  const handleSetFormData = useCallback(
    (data: InventoryFormData) => {
      setFormData(data);
    },
    [setFormData]
  );

  /**
   * Handles setting edit mode for the form
   * @param isEdit - Whether the form is in edit mode
   */
  const handleSetEditMode = useCallback(
    (isEdit: boolean) => {
      setEditMode(isEdit);
    },
    [setEditMode]
  );

  return {
    // Form state
    formData,
    isEditMode,
    isDirty,
    expandedSections,

    // Form actions
    setFormData: handleSetFormData,
    updateField,
    setEditMode: handleSetEditMode,
    setExpandedSections,
    toggleSection: handleToggleSection,
    resetForm: handleResetForm,
    markAsDirty,
    markAsClean,

    // Enhanced actions
    handleFormChange,
    handleToggleSection,
    handleResetForm,

    // Convenience actions
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
  };
};
