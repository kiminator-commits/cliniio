import React from 'react';
import InventoryFilters from './filters/InventoryFilters';
import ExpandedFiltersPanel from './forms/ExpandedFiltersPanel';
import InventoryTables from './tables/InventoryTables';
import { useInventoryTableSectionData } from '@/hooks/inventory/useInventoryTableSectionData';

// ⚠️ TRACKING FILTER LOGIC - DO NOT CHANGE:
// "Tracked Only" filter should ONLY appear on Tools and Supplies tabs
// Equipment and Hardware don't need tracking (doctors don't track desks/chairs)
// This is intentional business logic, not a bug to fix
//

interface Props {
  activeTab: string;
  compatibleFilters: {
    searchQuery: string;
    category: string;
    location: string;
    showTrackedOnly: boolean;
    showFavoritesOnly?: boolean;
  };
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (val: string) => void;
  setLocationFilter: (val: string) => void;
  filteredData: Array<{
    item: string;
    category: string;
    toolId: string;
    location: string;
    p2Status: string;
  }>;
  filteredSuppliesData: Array<{
    item: string;
    category: string;
    supplyId: string;
    location: string;
    expiration: string;
  }>;
  filteredEquipmentData: Array<{
    item: string;
    category: string;
    equipmentId: string;
    location: string;
    status: string;
    lastServiced: string;
  }>;
  filteredOfficeHardwareData: Array<{
    item: string;
    category: string;
    hardwareId: string;
    location: string;
    status: string;
    warranty: string;
  }>;
  handleEditClick: (item: {
    item: string;
    category: string;
    toolId?: string;
    supplyId?: string;
    equipmentId?: string;
    hardwareId?: string;
    location: string;
  }) => void;
  handleDeleteItem: () => void;
  handleToggleFavorite: (itemId: string) => void;
  showTrackedOnly: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage: number;
  onToggleTrackedFilter: () => void;
  onToggleFavoritesFilter?: () => void;
}

const InventoryTableSection: React.FC<Props> = props => {
  const { filterProps, expandedFiltersProps, tableProps, showFilters } =
    useInventoryTableSectionData(props);

  return (
    <>
      <InventoryFilters {...filterProps} />
      {showFilters && <ExpandedFiltersPanel {...expandedFiltersProps} />}
      <InventoryTables {...tableProps} />
    </>
  );
};

export default InventoryTableSection;
