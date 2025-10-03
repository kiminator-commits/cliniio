import React from 'react';
import { useInventoryPageLogic } from '@/hooks/inventory/useInventoryPageLogic';
import InventoryModals from '@/components/Inventory/modals/InventoryModals';
import { TransformedFormData } from '@/utils/Inventory/formDataUtils';

interface InventoryModalsWrapperProps {
  isEditMode: boolean;
  formData: unknown;
  progressInfo: unknown;
}

const InventoryModalsWrapper: React.FC<InventoryModalsWrapperProps> = ({
  isEditMode,
  formData,
  progressInfo,
}) => {
  const {
    expandedSections,
    handleCloseAddModal,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
  } = useInventoryPageLogic();

  return (
    <InventoryModals
      formData={formData as TransformedFormData}
      isEditMode={isEditMode}
      expandedSections={expandedSections}
      handleCloseAddModal={handleCloseAddModal}
      handleSave={handleSave}
      toggleSection={handleToggleSection}
      handleFormChange={handleFormChangeWrapper}
      progressInfo={
        progressInfo as
          | { current: number; total: number; currentItemName: string }
          | undefined
      }
    />
  );
};

export default InventoryModalsWrapper;
