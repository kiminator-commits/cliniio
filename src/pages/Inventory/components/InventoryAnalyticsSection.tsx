import React, { Suspense, lazy } from 'react';
import { TabType } from '../types';
import { CardSkeleton } from '../../../components/ui/Skeleton';
import { LocalInventoryItem } from '@/types/inventoryTypes';

const InventoryInsightsCard = lazy(
  () => import('../../../components/Inventory/analytics/InventoryInsightsCard')
);
const CategoriesCard = lazy(
  () => import('../../../components/Inventory/analytics/CategoriesCard')
);

interface InventoryAnalyticsSectionProps {
  filteredData: LocalInventoryItem[];
  onCategoryChange: (tab: TabType) => void;
}

const InventoryAnalyticsSection: React.FC<InventoryAnalyticsSectionProps> = ({
  onCategoryChange,
}) => {
  // Create the data structure expected by InventoryInsightsCard
  const insightsData = {
    tools: [] as LocalInventoryItem[],
    supplies: [] as LocalInventoryItem[],
    equipment: [] as LocalInventoryItem[],
    officeHardware: [] as LocalInventoryItem[],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Suspense fallback={<CardSkeleton />}>
        <InventoryInsightsCard data={insightsData} />
      </Suspense>

      <Suspense fallback={<CardSkeleton />}>
        <CategoriesCard onCategoryChange={onCategoryChange} />
      </Suspense>
    </div>
  );
};

export default React.memo(InventoryAnalyticsSection);
