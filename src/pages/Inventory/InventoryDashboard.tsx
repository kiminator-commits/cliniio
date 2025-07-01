import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import InventoryErrorFallback from '@/components/Error/InventoryErrorFallback';
import InventoryHeader from '../../components/Inventory/ui/InventoryHeader';
import InventoryModalsWrapper from './components/InventoryModalsWrapper';
import ScanModalWrapper from './components/ScanModalWrapper';
import { useInventoryDashboardContext } from '@/hooks/inventory/useInventoryDashboardContext';
import { useInventoryDataTransformation } from '@/hooks/inventory/useInventoryDataTransformation';

const InventoryInsightsCard = lazy(
  () => import('../../components/Inventory/analytics/InventoryInsightsCard')
);
const CategoriesCard = lazy(() => import('../../components/Inventory/analytics/CategoriesCard'));
const InventoryTableWrapper = lazy(() => import('./components/InventoryTableWrapper'));

const InventoryDashboard: React.FC = () => {
  // Get context data for UI composition
  const context = useInventoryDashboardContext();

  // Get transformed data for UI composition
  const { inventoryData, handleScanClick, isEditMode, transformedFormData, getProgressInfo } =
    useInventoryDataTransformation();

  return (
    <ErrorBoundary fallback={<InventoryErrorFallback />}>
      <div className="p-6 space-y-6">
        <InventoryHeader onScanClick={handleScanClick} />
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col gap-4 lg:w-1/4 pl-4">
            <Suspense fallback={null}>
              <InventoryInsightsCard data={inventoryData} />
            </Suspense>
            <Suspense fallback={null}>
              <CategoriesCard onCategoryChange={context.onCategoryChange} />
            </Suspense>
          </div>
          <div className="flex-1 pr-4">
            <Suspense fallback={null}>
              <InventoryTableWrapper />
            </Suspense>
          </div>
        </div>

        <InventoryModalsWrapper
          isEditMode={isEditMode}
          formData={transformedFormData}
          progressInfo={getProgressInfo()}
        />

        {/* Scan Modal */}
        <ScanModalWrapper />
      </div>
    </ErrorBoundary>
  );
};

export default InventoryDashboard;
