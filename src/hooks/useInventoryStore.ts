import { useInventoryStore as useStore } from '@/store/inventoryStore';

/**
 * Hook to access the clean inventory store
 * Provides all inventory state and actions in a single, organized interface
 */
export const useInventoryStore = () => {
  return useStore();
};
