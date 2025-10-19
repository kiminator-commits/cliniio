import React from 'react';
import ModalContent from './ModalContent';
import {
  INVENTORY_MODAL_CONFIGS,
  ADD_EDIT_ITEM_SECTIONS,
} from '@/config/modalConfig';
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import { useInventoryModalSave } from '@/hooks/inventory/useInventoryModalSave';

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

// Use shared save validation hook
const { handleSave } = useInventoryModalSave({
  formData,
  isEditMode,
  handleSaveItem,
});

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
