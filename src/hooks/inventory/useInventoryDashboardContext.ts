import { useContext } from 'react';
import { InventoryDashboardContext } from '@/pages/Inventory/context/InventoryDashboardContext';

/**
 * Hook to safely access InventoryDashboardContext with fallback defaults
 * @returns Context values with fallback defaults
 */
export const useInventoryDashboardContext = () => {
  const context = useContext(InventoryDashboardContext);

  if (!context) {
    throw new Error(
      'useInventoryDashboardContext must be used within an InventoryDashboardProvider'
    );
  }

  return context;
};
