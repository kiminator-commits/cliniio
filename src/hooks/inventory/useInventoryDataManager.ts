import { useMemo } from 'react';
import { useCentralizedInventoryData } from '../useCentralizedInventoryData';

/**
 * Minimal inventory data manager hook
 * Provides basic interface without complex memoization chains
 */
export const useInventoryDataManager = () => {
  const centralizedData = useCentralizedInventoryData();

  const allItems = useMemo(
    () => [
      ...centralizedData.tools,
      ...centralizedData.supplies,
      ...centralizedData.equipment,
      ...centralizedData.officeHardware,
    ],
    [
      centralizedData.tools,
      centralizedData.supplies,
      centralizedData.equipment,
      centralizedData.officeHardware,
    ]
  );

  return {
    // Basic data access
    getAllItems: () => {
      return allItems;
    },

    getItemsByCategory: (category: string) => {
      const items = allItems.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
      return items;
    },

    getFilteredItems: centralizedData.getFilteredData,
    getCategories: centralizedData.getCategories,
    fetchData: centralizedData.refreshData,

    // Raw data for backward compatibility
    inventoryData: allItems,
  };
};
