import React from 'react';
import InventoryFilters from '../filters/InventoryFilters';
import InventoryTables from '../tables/InventoryTables';
import ExpandedFiltersPanel from '../forms/ExpandedFiltersPanel';
import InventoryModals from '../modals/InventoryModals';
import {
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
  ExpandedSections,
  InventoryItem,
} from '../../../types/inventoryTypes';

interface InventoryContentProps {
  // Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  locationFilter: string;
  showTrackedOnly: boolean;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Modal state
  isEditMode: boolean;

  // Form state
  formData: Partial<InventoryItem>;
  expandedSections: ExpandedSections;

  // Data
  filteredData: ToolItem[];
  filteredSuppliesData: SupplyItem[];
  filteredEquipmentData: EquipmentItem[];
  filteredOfficeHardwareData: OfficeHardwareItem[];

  // Actions
  handleToggleTrackedFilter: () => void;
  handleSetCategoryFilter: (category: string) => void;
  handleSetLocationFilter: (location: string) => void;
  handleToggleSectionWrapper: (section: string) => void;
  handleFormChangeWrapper: (field: string, value: unknown) => void;
  handleCloseAddModal: () => void;
  handleDeleteItem: (item: InventoryItem) => void;
  handleToggleFavorite: (itemId: string) => void;

  // Table state
  activeTab: string;
  handleEditItem: (item: InventoryItem) => void;
}

const InventoryContent: React.FC<InventoryContentProps> = ({
  // Filter state
  searchQuery,
  setSearchQuery,
  categoryFilter,
  locationFilter,
  showTrackedOnly,
  showFilters,
  setShowFilters,

  // Modal state
  isEditMode: _isEditMode,

  // Form state
  formData: _formData,
  expandedSections: _expandedSections,

  // Data
  filteredData,
  filteredSuppliesData,
  filteredEquipmentData,
  filteredOfficeHardwareData,

  // Actions
  handleToggleTrackedFilter,
  handleSetCategoryFilter,
  handleSetLocationFilter,
  handleToggleSectionWrapper: _handleToggleSectionWrapper,
  handleFormChangeWrapper: _handleFormChangeWrapper,
  handleCloseAddModal: _handleCloseAddModal,
  handleDeleteItem,
  handleToggleFavorite,

  // Table state
  activeTab,
  handleEditItem,
}) => {
  return (
    <>
      {/* Filters Section */}
      <InventoryFilters
        filters={{
          searchQuery: searchQuery,
          category: categoryFilter,
          location: locationFilter,
          showTrackedOnly: showTrackedOnly,
        }}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setSearchQuery={setSearchQuery}
        onToggleTrackedFilter={handleToggleTrackedFilter}
      />

      {/* Expanded Filters Panel */}
      {showFilters && (
        <ExpandedFiltersPanel
          activeTab={activeTab}
          filters={{
            searchQuery: searchQuery,
            category: categoryFilter,
            location: locationFilter,
          }}
          setCategoryFilter={(v) => handleSetCategoryFilter(v || '')}
          setLocationFilter={(v) => handleSetLocationFilter(v || '')}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Tables Section */}
      <InventoryTables
        activeTab={activeTab}
        filteredData={filteredData}
        filteredSuppliesData={filteredSuppliesData}
        filteredEquipmentData={filteredEquipmentData}
        filteredOfficeHardwareData={filteredOfficeHardwareData}
        handleEditClick={handleEditItem}
        handleDeleteItem={handleDeleteItem}
        handleToggleFavorite={handleToggleFavorite}
        showTrackedOnly={showTrackedOnly}
      />

      {/* Modals */}
      <InventoryModals />
    </>
  );
};

export default InventoryContent;
