import React, { useRef, useEffect } from 'react';
import { useInventoryHeaderData } from '@/hooks/inventory/useInventoryHeaderData';
import { InventoryTabHeader } from './InventoryTabHeader';
import { InventoryActionButtons } from './InventoryActionButtons';
import { useInventoryHeaderKeyboard } from './hooks/useInventoryHeaderKeyboard';
import { useInventoryHeaderFocus } from './hooks/useInventoryHeaderFocus';

interface Props {
  activeTab: string;
  handleShowAddModal: () => void;
}

const InventoryHeaderSection: React.FC<Props> = ({
  activeTab,
  handleShowAddModal,
}) => {
  const { handleUploadBarcode } = useInventoryHeaderData(handleShowAddModal);

  // Refs for action buttons
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  // Custom hooks for keyboard navigation and focus management
  const { handleKeyDown } = useInventoryHeaderKeyboard({
    addButtonRef,
    uploadButtonRef,
    handleShowAddModal,
    handleUploadBarcode,
  });

  const { focusFirstButton } = useInventoryHeaderFocus(addButtonRef);

  // Focus management - focus first action button when component mounts
  useEffect(() => {
    focusFirstButton();
  }, [focusFirstButton]);

  // Only render for valid tabs
  if (
    !['tools', 'supplies', 'equipment', 'officeHardware'].includes(activeTab)
  ) {
    return null;
  }

  return (
    <InventoryTabHeader activeTab={activeTab}>
      <InventoryActionButtons
        activeTab={activeTab}
        addButtonRef={addButtonRef}
        uploadButtonRef={uploadButtonRef}
        handleShowAddModal={handleShowAddModal}
        handleUploadBarcode={handleUploadBarcode}
        handleKeyDown={handleKeyDown}
      />
    </InventoryTabHeader>
  );
};

export default InventoryHeaderSection;
