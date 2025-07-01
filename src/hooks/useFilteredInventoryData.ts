import { useMemo } from 'react';
import { filterLocalData } from '@/utils/Inventory/filterLocalData';

export function useFilteredInventoryData({
  searchQuery,
  localInventoryData,
  localSuppliesData,
  localEquipmentData,
  localOfficeHardwareData,
}: {
  searchQuery: string;
  localInventoryData: Record<string, unknown>[];
  localSuppliesData: Record<string, unknown>[];
  localEquipmentData: Record<string, unknown>[];
  localOfficeHardwareData: Record<string, unknown>[];
}) {
  const filteredData = useMemo(
    () => filterLocalData(localInventoryData, searchQuery),
    [localInventoryData, searchQuery]
  );

  const filteredSuppliesData = useMemo(
    () => filterLocalData(localSuppliesData, searchQuery),
    [localSuppliesData, searchQuery]
  );

  const filteredEquipmentData = useMemo(
    () => filterLocalData(localEquipmentData, searchQuery),
    [localEquipmentData, searchQuery]
  );

  const filteredOfficeHardwareData = useMemo(
    () => filterLocalData(localOfficeHardwareData, searchQuery),
    [localOfficeHardwareData, searchQuery]
  );

  return {
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
  };
}
