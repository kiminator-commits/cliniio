import React from 'react';
import InventoryHeaderSection from '@/components/Inventory/InventoryHeaderSection';
import InventoryTableSection from '@/components/Inventory/InventoryTableSection';
import InventoryFooterControls from '@/components/Inventory/InventoryFooterControls';
import { useInventoryTableData } from '@/hooks/inventory/useInventoryTableData';
import { useInventoryFooterData } from '@/hooks/inventory/useInventoryFooterData';

const InventoryTableWrapper: React.FC = () => {
  const {
    // Data
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    currentTabCount,
    compatibleFilters,

    // UI State
    activeTab,
    showFilters,
    itemsPerPage,
    showTrackedOnly,
    showFavoritesOnly,

    // Actions
    handleShowAddModal,
    handleEditClick,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    handleDeleteItem,
    handleToggleFavorite,

    // Store setters
    setShowFilters,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    setItemsPerPage,
  } = useInventoryTableData();

  const { footerControlsProps } = useInventoryFooterData({
    itemsPerPage,
    setItemsPerPage,
    currentTabCount,
    activeTab,
  });

  return (
    <div
      className="bg-white rounded-lg shadow p-6 w-full max-w-full h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] flex flex-col"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <InventoryHeaderSection activeTab={activeTab} handleShowAddModal={handleShowAddModal} />
      <InventoryTableSection
        activeTab={activeTab}
        compatibleFilters={compatibleFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setSearchQuery={setSearchQuery}
        setCategoryFilter={setCategoryFilter}
        setLocationFilter={setLocationFilter}
        filteredData={filteredData}
        filteredSuppliesData={filteredSuppliesData}
        filteredEquipmentData={filteredEquipmentData}
        filteredOfficeHardwareData={filteredOfficeHardwareData}
        handleEditClick={handleEditClick}
        handleDeleteItem={handleDeleteItem}
        handleToggleFavorite={handleToggleFavorite}
        showTrackedOnly={showTrackedOnly}
        showFavoritesOnly={showFavoritesOnly}
        itemsPerPage={itemsPerPage}
        onToggleTrackedFilter={handleToggleTrackedFilter}
        onToggleFavoritesFilter={handleToggleFavoritesFilter}
      />
      <InventoryFooterControls {...footerControlsProps} />
    </div>
  );
};

export default InventoryTableWrapper;
