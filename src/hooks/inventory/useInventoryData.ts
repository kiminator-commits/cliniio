import { useMemo } from 'react';
import {
  inventoryData as staticInventoryData,
  suppliesData as staticSuppliesData,
  equipmentData as staticEquipmentData,
  officeHardwareData as staticOfficeHardwareData,
} from '@/utils/Inventory/inventoryData';

export interface InventoryData {
  tools: typeof staticInventoryData;
  supplies: typeof staticSuppliesData;
  equipment: typeof staticEquipmentData;
  officeHardware: typeof staticOfficeHardwareData;
}

/**
 * Hook to provide inventory data for analytics components
 * @returns Memoized inventory data object
 */
export const useInventoryData = (): InventoryData => {
  return useMemo(
    () => ({
      tools: staticInventoryData,
      supplies: staticSuppliesData,
      equipment: staticEquipmentData,
      officeHardware: staticOfficeHardwareData,
    }),
    []
  );
};
