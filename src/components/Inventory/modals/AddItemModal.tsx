import React from 'react';
import ModalContent from './ModalContent';
import {
  INVENTORY_MODAL_CONFIGS,
  ADD_EDIT_ITEM_SECTIONS,
} from '@/config/modalConfig';
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import { validateFormData } from '@/config/modalConfig';

/**
 * Refactored AddItemModal that uses the new modal management system
 * Separates modal content from modal management
 */
const AddItemModal: React.FC = () => {
  const {
    // Modal state
    showAddModal,
    closeAddModal,
    formData,
    isEditMode,
    expandedSections,

    // Form handlers
    handleFormChange,
    toggleSection,
    handleSaveItem,
  } = useInventoryModals();

  // Validate form data before saving
  const handleSave = () => {
    console.log('🔍 Validating form data before save...');
    console.log('📝 Current form data:', formData);

    const errors = validateFormData(formData);
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
  };

  // Wrapper function to convert the type mismatch
  const handleToggleSection = (section: string) => {
    toggleSection(section as keyof typeof expandedSections);
  };

  return (
    <ModalContent
      modalConfig={INVENTORY_MODAL_CONFIGS.ADD_ITEM}
      show={showAddModal}
      onHide={closeAddModal}
      formData={formData}
      isEditMode={isEditMode}
      expandedSections={expandedSections}
      toggleSection={handleToggleSection}
      handleFormChange={handleFormChange}
      onSave={handleSave}
      sections={ADD_EDIT_ITEM_SECTIONS}
    />
  );
};

export default AddItemModal;
