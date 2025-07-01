import React, { Suspense, lazy } from 'react';
import { TabType } from '../../types';

const InventoryInsightsCard = lazy(
  () => import('../../components/Inventory/analytics/InventoryInsightsCard')
);
const CategoriesCard = lazy(() => import('../../components/Inventory/analytics/CategoriesCard'));

interface InventoryItem {
  category: string;
  quantity: number;
}

interface InventoryAnalyticsSectionProps {
  filteredData: InventoryItem[];
  onCategoryChange: (tab: TabType) => void;
}

const InventoryAnalyticsSection: React.FC<InventoryAnalyticsSectionProps> = ({
  filteredData,
  onCategoryChange,
}) => {
  const categories = Array.from(new Set(filteredData.map(item => item.category)));
  const lowStockItems = filteredData.filter(item => item.quantity < 10).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={null}>
        <InventoryInsightsCard
          totalItems={filteredData.length}
          lowStockItems={lowStockItems}
          categories={categories}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CategoriesCard categories={categories} onCategoryChange={onCategoryChange} />
      </Suspense>
    </div>
  );
};

export default React.memo(InventoryAnalyticsSection);
