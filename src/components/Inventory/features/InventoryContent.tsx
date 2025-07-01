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
  FormData,
  ExpandedSections,
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
  formData: FormData;
  expandedSections: ExpandedSections;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  favorites: string[];

  // Data
  filteredData: ToolItem[];
  filteredSuppliesData: SupplyItem[];
  filteredEquipmentData: EquipmentItem[];
  filteredOfficeHardwareData: OfficeHardwareItem[];
  filteredTools: {
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }[];

  // Actions
  handleToggleTrackedFilter: () => void;
  handleSetCategoryFilter: (category: string) => void;
  handleSetLocationFilter: (location: string) => void;
  handleToggleSectionWrapper: (section: string) => void;
  handleFormChangeWrapper: (field: string, value: unknown) => void;
  handleCloseAddModal: () => void;
  handleDeleteItem: (item: unknown) => void;
  handleToggleFavorite: (itemId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;

  // Table state
  activeTab: string;
  handleEditItem: (item: unknown) => void;
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
  isEditMode,

  // Form state
  formData,
  expandedSections,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  favorites,

  // Data
  filteredData,
  filteredSuppliesData,
  filteredEquipmentData,
  filteredOfficeHardwareData,
  filteredTools,

  // Actions
  handleToggleTrackedFilter,
  handleSetCategoryFilter,
  handleSetLocationFilter,
  handleToggleSectionWrapper,
  handleFormChangeWrapper,
  handleCloseAddModal,
  handleDeleteItem,
  handleToggleFavorite,
  getStatusBadge,
  getStatusText,

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
          setCategoryFilter={v => handleSetCategoryFilter(v || '')}
          setLocationFilter={v => handleSetLocationFilter(v || '')}
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
      <InventoryModals
        formData={formData}
        isEditMode={isEditMode}
        expandedSections={expandedSections}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        favorites={new Set(favorites)}
        filteredTools={filteredTools}
        handleCloseAddModal={handleCloseAddModal}
        toggleSection={handleToggleSectionWrapper}
        handleFormChange={handleFormChangeWrapper}
        toggleFavorite={handleToggleFavorite}
        getStatusBadge={phase => getStatusBadge(phase)?.toString() || ''}
        getStatusText={getStatusText}
      />
    </>
  );
};

export default InventoryContent;
