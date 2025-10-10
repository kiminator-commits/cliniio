import React from 'react';
import { useInventoryPageLogic } from '@/hooks/inventory/useInventoryPageLogic';
import InventoryModals from '@/components/Inventory/modals/InventoryModals';

interface InventoryModalsWrapperProps {
  isEditMode: boolean;
  formData: unknown;
  progressInfo: unknown;
}

const InventoryModalsWrapper: React.FC<InventoryModalsWrapperProps> = ({
  isEditMode: _isEditMode,
  formData: _formData,
  progressInfo: _progressInfo,
}) => {
  const {
    expandedSections: _expandedSections,
    handleCloseAddModal: _handleCloseAddModal,
    handleSave: _handleSave,
    handleToggleSection: _handleToggleSection,
    handleFormChangeWrapper: _handleFormChangeWrapper,
  } = useInventoryPageLogic();

  return <InventoryModals />;
};

export default InventoryModalsWrapper;
