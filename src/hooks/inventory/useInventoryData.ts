import { useMemo } from 'react';
import { InventoryItem } from '../../types/inventoryTypes';
import { useCentralizedInventoryData } from '../useCentralizedInventoryData';

export interface InventoryData {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
}

/**
 * Hook to provide inventory data for analytics components
 * @returns Memoized inventory data object
 */
export const useInventoryData = (): InventoryData => {
  const { inventoryData, suppliesData, equipmentData, officeHardwareData } =
    useCentralizedInventoryData();

  return useMemo(
    () => ({
      tools: inventoryData,
      supplies: suppliesData,
      equipment: equipmentData,
      officeHardware: officeHardwareData,
    }),
    [inventoryData, suppliesData, equipmentData, officeHardwareData]
  );
};
