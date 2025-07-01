import React from 'react';
import { InventoryDataProvider } from './InventoryDataProvider';
import { InventoryUIStateProvider } from './InventoryUIStateProvider';
import { InventoryActionsProvider } from './InventoryActionsProvider';
import { InventoryDataManagerProvider } from './InventoryDataManagerProvider';

interface InventoryProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined provider that establishes clear data flow patterns
 *
 * Data Flow Hierarchy:
 * 1. InventoryDataManagerProvider - Centralized data management (NEW)
 * 2. InventoryDataProvider - Legacy data provider (for backward compatibility)
 * 3. InventoryUIStateProvider - Manage UI state separately from data
 * 4. InventoryActionsProvider - Handle all user actions and business logic
 *
 * This creates a clear separation of concerns:
 * - Data Management: Centralized data operations, loading states, error handling
 * - Data: Raw inventory data (legacy compatibility)
 * - UI State: Filters, pagination, modals, form state
 * - Actions: CRUD operations, business logic, user interactions
 */
export const InventoryProviders: React.FC<InventoryProvidersProps> = ({ children }) => {
  return (
    <InventoryDataManagerProvider>
      <InventoryDataProvider>
        <InventoryUIStateProvider>
          <InventoryActionsProvider>{children}</InventoryActionsProvider>
        </InventoryUIStateProvider>
      </InventoryDataProvider>
    </InventoryDataManagerProvider>
  );
};

export default InventoryProviders;
