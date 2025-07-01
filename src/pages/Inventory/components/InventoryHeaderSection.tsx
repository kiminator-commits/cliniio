import React from 'react';
import InventoryHeader from '../../components/Inventory/ui/InventoryHeader';

interface InventoryHeaderSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setScanMode: (mode: 'add' | 'use' | null) => void;
  resetScannedItems: () => void;
  setShowScanModal: (val: boolean) => void;
  handleShowAddModal: () => void;
}

const InventoryHeaderSection: React.FC<InventoryHeaderSectionProps> = ({
  searchTerm,
  setSearchTerm,
  setScanMode,
  resetScannedItems,
  setShowScanModal,
  handleShowAddModal,
}) => {
  return (
    <InventoryHeader
      onScanClick={() => {
        setScanMode(null);
        resetScannedItems();
        setShowScanModal(true);
      }}
      onAddClick={handleShowAddModal}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );
};

export default React.memo(InventoryHeaderSection);
