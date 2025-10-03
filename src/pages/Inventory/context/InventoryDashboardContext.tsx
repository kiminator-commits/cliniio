import { createContext } from 'react';
import { InventoryDashboardContextType } from '../types/inventoryDashboardTypes';

export type { InventoryDashboardContextType };

export const InventoryDashboardContext = createContext<
  InventoryDashboardContextType | undefined
>(undefined);
