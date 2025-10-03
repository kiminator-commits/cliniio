import { useContext } from 'react';
import { InventoryDashboardContext } from '@/pages/Inventory/context/InventoryDashboardContext';

export const useInventoryDashboardContext = () => {
  const context = useContext(InventoryDashboardContext);

  if (!context) {
    throw new Error(
      'useInventoryDashboardContext must be used within an InventoryDashboardContext.Provider'
    );
  }

  return context;
};
