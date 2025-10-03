import React from 'react';
import { InventoryHeaderTitle } from './InventoryHeaderTitle';
import { InventoryHeaderActions } from './InventoryHeaderActions';

export interface InventoryHeaderSectionProps {
  activeTab: string;
  handleShowAddModal: () => void;
}

export const InventoryHeaderSection: React.FC<InventoryHeaderSectionProps> = ({
  activeTab,
  handleShowAddModal,
}) => {
  const getAriaLabel = () => {
    const sectionType =
      activeTab === 'tools'
        ? 'Tool management'
        : activeTab === 'supplies'
          ? 'Supplies management'
          : activeTab === 'equipment'
            ? 'Equipment management'
            : 'Office hardware management';
    return `${sectionType} section`;
  };

  return (
    <div
      className="flex items-center justify-between mb-6 flex-shrink-0"
      role="banner"
      aria-label={getAriaLabel()}
    >
      <InventoryHeaderTitle activeTab={activeTab} />
      <InventoryHeaderActions
        activeTab={activeTab}
        handleShowAddModal={handleShowAddModal}
      />
    </div>
  );
};
