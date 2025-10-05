import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import MetricsSection from '../../../components/MetricsSection';
import { CardSkeleton } from '../../../components/ui/Skeleton';
import { RefreshButton } from '../../../components/ui/RefreshButton';
import { performanceMetricsCache } from '../../../services/performanceMetricsCache';

interface HomeMetricsSectionProps {
  loading?: boolean; // Add loading prop to match HomeTasksSection
  aiMetrics?: Record<string, unknown>;
  sterilizationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeSterilizationIntegration').SterilizationHomeMetrics;
  integrationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeIntegrationService').HomeIntegrationMetrics;
  aiImpactMetrics?: Record<string, unknown>; // Add AI impact metrics prop
}

const HomeMetricsSection = React.memo(function HomeMetricsSection({
  loading = false, // Default to false
  aiMetrics,
  sterilizationMetrics,
  integrationMetrics,
  aiImpactMetrics, // Add AI impact metrics parameter
}: HomeMetricsSectionProps) {
  // Handle manual refresh of metrics
  const handleRefresh = async () => {
    try {
      // Clear cache and fetch fresh metrics
      performanceMetricsCache.clearCache();
      await performanceMetricsCache.fetchAndCacheMetricsOnLogin();
      // Force a page reload to show updated metrics
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
      throw error; // Re-throw so RefreshButton can handle the error state
    }
  };

  // Memoize the performance metrics object to prevent unnecessary re-renders
  const performanceMetrics = useMemo(
    () => ({
      timeSaved: (aiMetrics?.timeSaved as {
        daily: number;
        monthly: number;
      }) || {
        daily: 0,
        monthly: 0,
      },
      aiTimeSaved: (aiMetrics?.aiTimeSaved as {
        daily: number;
        monthly: number;
      }) || {
        daily: 0,
        monthly: 0,
      },
      costSavings: (aiMetrics?.costSavings as {
        monthly: number;
        annual: number;
      }) || {
        monthly: 0,
        annual: 0,
      },
      aiEfficiency: (aiMetrics?.aiEfficiency as {
        timeSavings: number;
        proactiveMgmt: number;
      }) || { timeSavings: 0, proactiveMgmt: 0 },
      teamPerformance: {
        skills: (aiMetrics?.teamPerformance as { skills: number })?.skills || 0,
        inventory:
          (aiMetrics?.teamPerformance as { inventory: number })?.inventory || 0,
        sterilization:
          (aiMetrics?.teamPerformance as { sterilization: number })
            ?.sterilization || 0,
      },
    }),
    [aiMetrics]
  );

  // Show loading only if we have NO metrics at all (progressive loading)
  const hasAnyMetrics = aiMetrics || sterilizationMetrics || integrationMetrics;

  if (loading && !hasAnyMetrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Refresh Button - positioned in top right */}
      <div className="absolute top-4 right-4 z-10">
        <RefreshButton
          onRefresh={handleRefresh}
          size="sm"
          className="shadow-md"
        />
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <ErrorBoundary
          fallback={
            <div className="sr-only">Metrics section failed to load.</div>
          }
        >
          <MetricsSection
            biData={undefined}
            ciData={undefined}
            performanceMetrics={performanceMetrics}
            aiImpactMetrics={aiImpactMetrics}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
});

export default HomeMetricsSection;
