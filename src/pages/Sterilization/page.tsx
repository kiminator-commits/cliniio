import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import SterilizationDashboard from '../../components/Sterilization/SterilizationDashboard';
import { ChartSkeleton } from '../../components/ui/Skeleton';

const SterilizationAnalytics = lazy(
  () => import('@/components/Sterilization/SterilizationAnalytics')
);

const SterilizationErrorFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

const Sterilization: React.FC = () => {
  // Analytics logging removed for production

  return (
    <ErrorBoundary FallbackComponent={SterilizationErrorFallback}>
      <SharedLayout>
        <div className="p-6 space-y-6">
          <ErrorBoundary FallbackComponent={SterilizationErrorFallback}>
            <SterilizationDashboard
              SterilizationAnalyticsComponent={() => (
                <Suspense fallback={<ChartSkeleton />}>
                  <SterilizationAnalytics />
                </Suspense>
              )}
            />
          </ErrorBoundary>
        </div>
      </SharedLayout>
    </ErrorBoundary>
  );
};

export default Sterilization;
