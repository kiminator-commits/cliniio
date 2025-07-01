import { useMemo } from 'react';
import { useCentralizedInventoryData } from './useCentralizedInventoryData';

/**
 * Compatibility wrapper for useFilteredInventoryData
 * Provides the exact same interface but uses centralized data source
 * This allows for seamless migration of existing components
 */
export function useFilteredInventoryDataCentralized({ searchQuery }: { searchQuery: string }) {
  const {
    getFilteredData,
    getFilteredSuppliesData,
    getFilteredEquipmentData,
    getFilteredOfficeHardwareData,
  } = useCentralizedInventoryData();

  const filteredData = useMemo(() => getFilteredData(searchQuery), [getFilteredData, searchQuery]);

  const filteredSuppliesData = useMemo(
    () => getFilteredSuppliesData(searchQuery),
    [getFilteredSuppliesData, searchQuery]
  );

  const filteredEquipmentData = useMemo(
    () => getFilteredEquipmentData(searchQuery),
    [getFilteredEquipmentData, searchQuery]
  );

  const filteredOfficeHardwareData = useMemo(
    () => getFilteredOfficeHardwareData(searchQuery),
    [getFilteredOfficeHardwareData, searchQuery]
  );

  return {
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
  };
}
