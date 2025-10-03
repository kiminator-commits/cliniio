import { useMemo } from 'react';
import { filterInventoryBySearch } from '@/utils/inventoryHelpers';
import { InventoryFilter, InventoryItem } from '@/types/inventoryTypes';

interface InventoryDatasets {
  inventoryData: InventoryItem[];
  suppliesData: InventoryItem[];
  equipmentData: InventoryItem[];
  officeHardwareData: InventoryItem[];
}

// Type for searchable inventory items (converts null/unknown to string for search)
type SearchableInventoryItem = {
  [K in keyof InventoryItem]: InventoryItem[K] extends string | number | boolean
    ? InventoryItem[K]
    : string | number | boolean;
};

export function useInventoryFilterData(
  filters: InventoryFilter,
  datasets: InventoryDatasets
) {
  const filteredData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.inventoryData as unknown as SearchableInventoryItem[],
      ['item', 'category', 'toolId', 'location', 'p2Status'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.inventoryData]);

  const filteredSuppliesData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.suppliesData as unknown as SearchableInventoryItem[],
      ['item', 'category', 'supplyId', 'location', 'expiration'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.suppliesData]);

  const filteredEquipmentData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.equipmentData as unknown as SearchableInventoryItem[],
      ['item', 'category', 'equipmentId', 'location', 'status', 'lastServiced'],
      filters.searchQuery || ''
    );
  }, [filters.searchQuery, datasets.equipmentData]);

  const filteredOfficeHardwareData = useMemo(() => {
    return filterInventoryBySearch(
      datasets.officeHardwareData as unknown as SearchableInventoryItem[],
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
