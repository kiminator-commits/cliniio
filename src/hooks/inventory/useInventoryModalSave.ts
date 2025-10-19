import { useCallback } from 'react';
import { validateFormData } from '@/config/modalConfig';
import { InventoryFormData } from '@/types/inventory';

interface UseInventoryModalSaveProps {
  formData: InventoryFormData;
  isEditMode: boolean;
  handleSaveItem: () => void;
}

/**
 * Shared hook for inventory modal save validation and handling
 * Consolidates the duplicate save guard logic across modal components
 */
export const useInventoryModalSave = ({
  formData,
  isEditMode,
  handleSaveItem,
}: UseInventoryModalSaveProps) => {
  const handleSave = useCallback(() => {
    console.log('🔍 Validating form data before save...');
    console.log('📝 Current form data:', formData);
    console.log('🔍 Is edit mode:', isEditMode);

    const errors = validateFormData(formData, isEditMode);
    console.log('✅ Validation errors:', errors);

    if (Object.keys(errors).length === 0) {
      console.log('✅ Validation passed, calling handleSaveItem...');
      handleSaveItem();
    } else {
      // Handle validation errors - could show toast or error messages
      console.error('❌ Validation failed:', errors);
      // For now, just prevent save
      return;
    }
  }, [formData, isEditMode, handleSaveItem]);

  return { handleSave };
};
