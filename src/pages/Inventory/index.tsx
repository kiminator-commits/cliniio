import React from 'react';
import { PageLayout } from '../../components/Layout/PageLayout';
import InventoryLayout from './InventoryLayout';
import InventoryDashboard from './InventoryDashboard';
import { InventoryDashboardProvider } from './context/InventoryDashboardContext';
import { InventoryDataProvider } from './providers/InventoryDataProvider';

const Inventory: React.FC = () => {
  try {
    return (
      <InventoryLayout>
        <PageLayout>
          <InventoryDataProvider>
            <InventoryDashboardProvider>
              <InventoryDashboard />
            </InventoryDashboardProvider>
          </InventoryDataProvider>
        </PageLayout>
      </InventoryLayout>
    );
  } catch (err) {
    console.error('Inventory page render failed:', err);
    return <div className="text-red-600 p-4">Error loading inventory page.</div>;
  }
};

export default React.memo(Inventory);
