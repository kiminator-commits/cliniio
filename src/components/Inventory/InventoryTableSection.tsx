import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import InventoryFilters from './filters/InventoryFilters';
import ExpandedFiltersPanel from './forms/ExpandedFiltersPanel';
import InventoryTables from './tables/InventoryTables';
import TableErrorBoundary from './tables/TableErrorBoundary';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useInventoryDataAccess } from '@/hooks/inventory/useInventoryDataAccess';
import { InventoryItem } from '@/types/inventoryTypes';
// import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

// ⚠️ TRACKING FILTER LOGIC - DO NOT CHANGE:
// "Tracked Only" filter should ONLY appear on Tools and Supplies tabs
// Equipment and Hardware don't need tracking (doctors don't track desks/chairs)
// This is intentional business logic, not a bug to fix
//

interface Props {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  items: InventoryItem[];
}

const InventoryTableSection: React.FC<Props> = React.memo(
  ({ onEdit, onDelete, items: _items }) => {
    // Get UI state and modal state from store
    const {
      activeTab,
      showFilters,
      setShowFilters,
      searchQuery,
      setSearchQuery,
      categoryFilter: category,
      setCategoryFilter,
      locationFilter: location,
      setLocationFilter,
      showTrackedOnly,
      setShowTrackedOnly,
      showFavoritesOnly,
      setShowFavoritesOnly,
      itemsPerPage,
      favorites,
      toggleFavorite,
      openAddModal,
    } = useInventoryStore();

    // Get categorized data from useInventoryDataAccess
    const {
      tools: inventoryData,
      supplies: suppliesData,
      equipment: equipmentData,
      officeHardware: officeHardwareData,
    } = useInventoryDataAccess();

    // Create compatible filters object
    const compatibleFilters = React.useMemo(
      () => ({
        searchQuery,
        category,
        location,
        showTrackedOnly,
        showFavoritesOnly,
      }),
      [searchQuery, category, location, showTrackedOnly, showFavoritesOnly]
    );

    // Memoize filter props to prevent unnecessary re-renders
    const filterProps = React.useMemo(
      () => ({
        filters: compatibleFilters,
        showFilters,
        setShowFilters,
        setSearchQuery,
        onToggleTrackedFilter: () => {
          // Toggle tracked filter logic - only for tools and supplies
          if (activeTab === 'tools' || activeTab === 'supplies') {
            setShowTrackedOnly(!showTrackedOnly);
          }
        },
      }),
      [
        compatibleFilters,
        showFilters,
        setShowFilters,
        setSearchQuery,
        activeTab,
        showTrackedOnly,
        setShowTrackedOnly,
      ]
    );

    // Memoize expanded filters props
    const expandedFiltersProps = React.useMemo(
      () => ({
        activeTab,
        filters: {
          searchQuery,
          category,
          location,
          showFavoritesOnly,
        },
        setCategoryFilter,
        setLocationFilter,
        setSearchQuery,
        onToggleFavoritesFilter: () => {
          setShowFavoritesOnly(!showFavoritesOnly);
        },
      }),
      [
        activeTab,
        searchQuery,
        category,
        location,
        showFavoritesOnly,
        setCategoryFilter,
        setLocationFilter,
        setSearchQuery,
        setShowFavoritesOnly,
      ]
    );

    // Memoize table props
    const tableProps = React.useMemo(
      () => ({
        activeTab,
        filteredData: inventoryData,
        filteredSuppliesData: suppliesData,
        filteredEquipmentData: equipmentData,
        filteredOfficeHardwareData: officeHardwareData,
        handleEditClick: onEdit,
        handleDeleteItem: onDelete,
        handleToggleFavorite: toggleFavorite,
        showTrackedOnly,
        showFavoritesOnly,
        itemsPerPage,
        favorites,
      }),
      [
        activeTab,
        inventoryData,
        suppliesData,
        equipmentData,
        officeHardwareData,
        onEdit,
        onDelete,
        toggleFavorite,
        showTrackedOnly,
        showFavoritesOnly,
        itemsPerPage,
        favorites,
      ]
    );

    // Get the table title based on active tab
    const getTableTitle = () => {
      switch (activeTab) {
        case 'tools':
          return 'Tools Table';
        case 'supplies':
          return 'Supplies Table';
        case 'equipment':
          return 'Equipment Table';
        case 'officeHardware':
          return 'Office Hardware Table';
        default:
          return 'Inventory Table';
      }
    };

    // Get the subtext based on active tab
    const getTableSubtext = () => {
      switch (activeTab) {
        case 'tools':
          return 'Manage your tools inventory items';
        case 'supplies':
          return 'Manage your supplies inventory items';
        case 'equipment':
          return 'Manage your equipment inventory items';
        case 'officeHardware':
          return 'Manage your office hardware inventory items';
        default:
          return 'Manage your inventory items';
      }
    };

    return (
      <div role="region" aria-label={`${activeTab} inventory table section`}>
        {/* Table Title and Add Item Button */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getTableTitle()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{getTableSubtext()}</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#4ECDC4] hover:bg-[#3db8b0] text-white rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
            aria-label="Add new item to inventory"
          >
            <Icon path={mdiPlus} size={1} />
            Add Item
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <InventoryFilters {...filterProps} />
        </div>

        {showFilters && (
          <div id="expanded-filters-panel">
            <ExpandedFiltersPanel {...expandedFiltersProps} />
          </div>
        )}
        <TableErrorBoundary>
          <InventoryTables {...tableProps} />
        </TableErrorBoundary>
      </div>
    );
  }
);

InventoryTableSection.displayName = 'InventoryTableSection';

export default InventoryTableSection;
