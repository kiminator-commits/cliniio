import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import MetricsSection from '../../../components/MetricsSection';
import { CardSkeleton } from '../../../components/ui/Skeleton';

interface HomeMetricsSectionProps {
  loading?: boolean; // Add loading prop to match HomeTasksSection
  aiMetrics?: Record<string, unknown>;
  sterilizationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeSterilizationIntegration').SterilizationHomeMetrics;
  integrationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeIntegrationService').HomeIntegrationMetrics;
}

const HomeMetricsSection = React.memo(function HomeMetricsSection({
  loading = false, // Default to false
  aiMetrics,
  sterilizationMetrics,
  integrationMetrics,
}: HomeMetricsSectionProps) {
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
        />
      </ErrorBoundary>
    </Suspense>
  );
});

export default HomeMetricsSection;
