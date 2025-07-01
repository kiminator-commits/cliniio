import { useInventoryDataContext } from '@/pages/Inventory/providers/InventoryDataProvider';
import { useInventoryUIStateContext } from '@/pages/Inventory/providers/InventoryUIStateProvider';
import { useInventoryActionsContext } from '@/pages/Inventory/providers/InventoryActionsProvider';

/**
 * Comprehensive hook that provides access to all inventory contexts
 *
 * This hook establishes clear data flow patterns by providing:
 * 1. Data access through useInventoryDataContext
 * 2. UI state management through useInventoryUIStateContext
 * 3. Business logic and actions through useInventoryActionsContext
 *
 * Usage:
 * const { data, uiState, actions } = useInventoryProviders();
 *
 * This creates a clear separation of concerns and makes it easy for components
 * to access only what they need while maintaining the established data flow.
 */
export const useInventoryProviders = () => {
  const data = useInventoryDataContext();
  const uiState = useInventoryUIStateContext();
  const actions = useInventoryActionsContext();

  return {
    data,
    uiState,
    actions,
  };
};

/**
 * Hook for components that only need data access
 */
export const useInventoryData = () => {
  return useInventoryDataContext();
};

/**
 * Hook for components that only need UI state management
 */
export const useInventoryUIState = () => {
  return useInventoryUIStateContext();
};

/**
 * Hook for components that only need business logic and actions
 */
export const useInventoryActions = () => {
  return useInventoryActionsContext();
};
