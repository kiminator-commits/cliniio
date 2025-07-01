import React from 'react';
import InventoryModals from '@/components/Inventory/modals/InventoryModals';
import { ModalFormState } from '@/types/inventoryTypes';
import { useInventoryDashboardContext } from '@/hooks/inventory/useInventoryDashboardContext';

const InventoryModalsWrapper = ({
  isEditMode,
  formData,
  progressInfo,
}: {
  isEditMode: boolean;
  formData: ModalFormState;
  progressInfo:
    | {
        current: number;
        total: number;
        currentItemName: string;
      }
    | undefined;
}) => {
  const context = useInventoryDashboardContext();

  const {
    searchTerm,
    expandedSections,
    favorites,
    filteredTools,
    setSearchTerm,
    handleCloseAddModal,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    handleToggleFavorite,
    getStatusBadge,
    getStatusText,
  } = context;

  return (
    <InventoryModals
      isEditMode={isEditMode}
      formData={formData}
      expandedSections={expandedSections}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      activeFilter="all"
      setActiveFilter={() => {}}
      favorites={new Set(favorites)}
      filteredTools={filteredTools}
      handleCloseAddModal={handleCloseAddModal}
      handleSave={handleSave}
      toggleSection={handleToggleSection}
      handleFormChange={handleFormChangeWrapper}
      toggleFavorite={handleToggleFavorite}
      getStatusBadge={getStatusBadge}
      getStatusText={getStatusText}
      progressInfo={progressInfo}
    />
  );
};

export default InventoryModalsWrapper;
