import {
  useCentralizedInventoryData,
  useInitializeInventoryData,
} from '@/hooks/useCentralizedInventoryData';
import { InventoryItem } from '@/types/inventoryTypes';

export const useInventoryDataAccess = () => {
  // Initialize data fetching with lazy loading
  useInitializeInventoryData();

  const centralizedData = useCentralizedInventoryData();

  const { tools, supplies, equipment, officeHardware } = centralizedData;

  // Flatten categorized arrays into one list of InventoryItem
  const allItems: InventoryItem[] = [
    ...tools,
    ...supplies,
    ...equipment,
    ...officeHardware,
  ] as InventoryItem[];

  // Example safe mapping (remove favorite/location/refreshData assumptions)
  const itemsWithCategory = allItems.map((item) => ({
    ...item,
    category: item.category ?? 'uncategorized',
  }));

  // Debug logging removed for performance

  return {
    allItems,
    itemsWithCategory,
    tools: tools as InventoryItem[],
    supplies: supplies as InventoryItem[],
    equipment: equipment as InventoryItem[],
    officeHardware: officeHardware as InventoryItem[],
    totalUniqueItems:
      tools.length + supplies.length + equipment.length + officeHardware.length,
    // Add the missing methods from the main hook
    refreshData: centralizedData.refreshData,
    getAllItems: () => allItems,
    getItemsByCategory: (category: string) => {
      switch (category) {
        case 'tools':
          return tools;
        case 'supplies':
          return supplies;
        case 'equipment':
          return equipment;
        case 'officeHardware':
          return officeHardware;
        default:
          return [];
      }
    },
  };
};
