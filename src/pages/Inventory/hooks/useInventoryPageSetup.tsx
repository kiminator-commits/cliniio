import React from 'react';
import { SharedLayout } from '../../../components/Layout/SharedLayout';
import InventoryLayout from '../InventoryLayout';
import InventoryProviders from '../providers/InventoryProviders';
import InventoryDashboard from '../InventoryDashboard';

export function useInventoryPageSetup() {
  // Compose all providers into a single tree component
  function ProviderTree({ children }: { children: React.ReactNode }) {
    return (
      <InventoryLayout>
        <SharedLayout>
          <InventoryProviders>{children}</InventoryProviders>
        </SharedLayout>
      </InventoryLayout>
    );
  }

  // Page content component remains unchanged
  function PageContent() {
    return <InventoryDashboard />;
  }

  return { ProviderTree, PageContent };
}
