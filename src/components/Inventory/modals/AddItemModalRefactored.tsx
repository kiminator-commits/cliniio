import React from 'react';
import ModalContent from './ModalContent';
import { INVENTORY_MODAL_CONFIGS, ADD_EDIT_ITEM_SECTIONS } from '@/config/modalConfig';
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import { validateFormData } from '@/config/modalConfig';

/**
 * Refactored AddItemModal that uses the new modal management system
 * Separates modal content from modal management
 */
const AddItemModalRefactored: React.FC = () => {
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
    const errors = validateFormData(formData);
    if (Object.keys(errors).length === 0) {
      handleSaveItem();
    } else {
      // Handle validation errors - could show toast or error messages
      console.error('Validation errors:', errors);
      // For now, just prevent save
      return;
    }
  };

  return (
    <ModalContent
      modalConfig={INVENTORY_MODAL_CONFIGS.ADD_ITEM}
      show={showAddModal}
      onHide={closeAddModal}
      formData={formData}
      isEditMode={isEditMode}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      handleFormChange={handleFormChange}
      onSave={handleSave}
      sections={ADD_EDIT_ITEM_SECTIONS}
    />
  );
};

export default AddItemModalRefactored;
