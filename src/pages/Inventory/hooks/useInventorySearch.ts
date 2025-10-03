import { useContext } from 'react';
import { InventorySearchContext } from '../context/InventorySearchContext';

export function useInventorySearch() {
  const context = useContext(InventorySearchContext);
  if (!context)
    throw new Error(
      'useInventorySearch must be used within InventorySearchProvider'
    );
  return context;
}
