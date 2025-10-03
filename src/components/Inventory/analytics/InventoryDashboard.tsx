import React from 'react';

interface InventoryDashboardProps {
  InventoryAnalyticsComponent: () => JSX.Element;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  InventoryAnalyticsComponent,
}) => {
  return (
    <div>
      <h1>Inventory Dashboard Placeholder</h1>
      <InventoryAnalyticsComponent />
    </div>
  );
};

export default InventoryDashboard;
