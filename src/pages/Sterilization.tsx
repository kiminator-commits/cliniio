import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PageLayout } from '../components/Layout/PageLayout';
import SterilizationDashboard from '../components/Sterilization/SterilizationDashboard';
import {
  getSterilizationEfficiency,
  refreshEfficiencyMetrics,
  analyticsConfig,
  logAnalyticsBanner,
} from '../components/Sterilization/sterilizationAnalyticsUtils';

const SterilizationAnalytics = lazy(
  () => import('@/components/Sterilization/SterilizationAnalytics')
);

const SterilizationErrorFallback = () => (
  <div className="text-red-600 p-4">
    An error occurred while loading sterilization data or components. Please try again or contact
    your system administrator. If this continues, log out and back in to reset your session.
  </div>
);

const Sterilization: React.FC = () => {
  if (!analyticsConfig.enabled) {
    console.warn('Sterilization analytics is currently disabled.');
  } else {
    logAnalyticsBanner();
    console.log(getSterilizationEfficiency());
    console.log('Manual refresh result:', refreshEfficiencyMetrics());
  }

  return (
    <ErrorBoundary FallbackComponent={SterilizationErrorFallback}>
      <PageLayout>
        <div className="p-6 space-y-6">
          <ErrorBoundary FallbackComponent={SterilizationErrorFallback}>
            <SterilizationDashboard
              SterilizationAnalyticsComponent={() => (
                <Suspense fallback={<div>Loading analytics...</div>}>
                  <SterilizationAnalytics />
                </Suspense>
              )}
            />
          </ErrorBoundary>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
};

export default Sterilization;
