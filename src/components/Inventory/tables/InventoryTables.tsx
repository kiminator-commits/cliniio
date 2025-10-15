// Main table component for displaying inventory items
//
// ⚠️ CRITICAL DESIGN DECISIONS - DO NOT OVERRIDE:
// 1. Tools tab: Shows Edit, Track/Untrack, Delete buttons (medical instruments need tracking)
// 2. Supplies tab: Shows Edit, Track/Untrack, Delete buttons (consumables need tracking)
// 3. Equipment tab: Shows Edit and Delete buttons ONLY (no tracking needed)
// 4. Hardware tab: Shows Edit and Delete buttons ONLY (no tracking needed)
//
// Business Logic: Doctors only track medical tools and supplies, not office equipment/furniture
// DO NOT replace this with "simpler" table components that lose this workflow logic
//
import React, { useMemo } from 'react';
import BaseInventoryTable from '../BaseInventoryTable';
import { InventoryTablesProps } from './types/tableTypes';
import { getColumnsForTab } from '@/utils/inventory/trackingUtils';

const InventoryTables: React.FC<InventoryTablesProps> = React.memo(
  ({
    activeTab,
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    handleEditClick,
    handleDeleteItem,
    handleToggleFavorite,
    onTrackToggle,
    showTrackedOnly = false,
    showFavoritesOnly = false,
    itemsPerPage,
  }) => {
    // Determine which data to use based on active tab
    const tableData = useMemo(() => {
      switch (activeTab) {
        case 'tools':
          return filteredData;
        case 'supplies':
          return filteredSuppliesData;
        case 'equipment':
          return filteredEquipmentData;
        case 'officeHardware':
          return filteredOfficeHardwareData;
        default:
          return filteredData;
      }
    }, [
      activeTab,
      filteredData,
      filteredSuppliesData,
      filteredEquipmentData,
      filteredOfficeHardwareData,
    ]);

    // Define columns based on active tab using centralized logic
    const columns = useMemo(() => {
      return getColumnsForTab(activeTab);
    }, [activeTab]);

    return (
      <div className="overflow-x-auto">
        <BaseInventoryTable
          data={tableData}
          columns={columns}
          onEdit={handleEditClick}
          onDelete={handleDeleteItem}
          onToggleFavorite={handleToggleFavorite}
          onTrackToggle={onTrackToggle}
          showTrackedOnly={showTrackedOnly}
          showFavoritesOnly={showFavoritesOnly}
          itemsPerPage={itemsPerPage}
          currentPage={1}
          onPageChange={() => {}}
          activeTab={activeTab}
        />
      </div>
    );
  }
);

InventoryTables.displayName = 'InventoryTables';

export default InventoryTables;
