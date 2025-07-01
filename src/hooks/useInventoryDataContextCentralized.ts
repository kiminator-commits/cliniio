import { useMemo } from 'react';
import { useCentralizedInventoryData } from './useCentralizedInventoryData';

/**
 * Compatibility wrapper for useInventoryDataContext
 * Provides the same interface but uses centralized data source
 * This allows analytics components to migrate seamlessly
 */
export function useInventoryDataContextCentralized() {
  const { inventoryData, suppliesData, equipmentData, officeHardwareData, isLoading, error } =
    useCentralizedInventoryData();

  const contextValue = useMemo(
    () => ({
      inventoryData: {
        tools: inventoryData,
        supplies: suppliesData,
        equipment: equipmentData,
        officeHardware: officeHardwareData,
      },
      isLoading,
      error,
    }),
    [inventoryData, suppliesData, equipmentData, officeHardwareData, isLoading, error]
  );

  return contextValue;
}
