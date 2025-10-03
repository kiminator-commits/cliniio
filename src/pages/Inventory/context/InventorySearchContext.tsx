import { createContext } from 'react';
import type { InventorySearchContextType } from '@/pages/Inventory/types/inventorySearchTypes';

export const InventorySearchContext = createContext<
  InventorySearchContextType | undefined
>(undefined);
