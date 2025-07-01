import { useMemo } from 'react';
import { filterInventoryBySearch } from '@/utils/inventoryHelpers';
import {
  InventoryFilter,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
} from '@/types/inventoryTypes';

interface InventoryDatasets {
  inventoryData: ToolItem[];
  suppliesData: SupplyItem[];
  equipmentData: EquipmentItem[];
  officeHardwareData: OfficeHardwareItem[];
}

export function useInventoryFilterData(filters: InventoryFilter, datasets: InventoryDatasets) {
  const filteredData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.inventoryData,
      ['item', 'category', 'toolId', 'location', 'p2Status'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.inventoryData]);

  const filteredSuppliesData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.suppliesData,
      ['item', 'category', 'supplyId', 'location', 'expiration'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.suppliesData]);

  const filteredEquipmentData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.equipmentData,
      ['item', 'category', 'equipmentId', 'location', 'status', 'lastServiced'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.equipmentData]);

  const filteredOfficeHardwareData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.officeHardwareData,
      ['item', 'category', 'hardwareId', 'location', 'status', 'warranty'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.officeHardwareData]);

  // Filter logic will be added in next steps
  return {
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
  };
}
