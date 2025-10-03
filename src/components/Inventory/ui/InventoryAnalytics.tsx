import React from 'react';

export interface AnalyticsData {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface InventoryAnalyticsProps {
  analyticsData: AnalyticsData;
  isLoadingAnalytics: boolean;
}

export const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({
  analyticsData,
  isLoadingAnalytics,
}) => {
  if (isLoadingAnalytics) {
    return <p>Loading analytics...</p>;
  }

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">Analytics</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{analyticsData.totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {analyticsData.lowStockItems}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
        </div>
        <div>
          <div className="text-2xl font-bold">
            {analyticsData.outOfStockItems}
          </div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
      </div>
    </div>
  );
};
