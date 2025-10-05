import React, { Suspense, lazy, useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiThermometer,
  mdiClock,
  mdiCheckCircle,
  mdiTestTube,
} from '@mdi/js';
import { KPICard } from './Analytics/KPICard';
import { TrendScore } from './Analytics/TrendScore';

import { useAnalyticsData } from './Analytics/hooks/useAnalyticsData';
import { useSterilizationInitialization } from '@/hooks/useSterilizationInitialization';
// import { useSterilizationStore } from '@/store/sterilizationStore';

// Lazy load heavy components
const LazyRecentActivity = lazy(() =>
  import('./Analytics/RecentActivity').then((module) => ({
    default: module.RecentActivity,
  }))
);
const LazyBITestResults = lazy(() =>
  import('./Analytics/BITestResults').then((module) => ({
    default: module.BITestResults,
  }))
);
const LazyToolStatus = lazy(() =>
  import('./Analytics/ToolStatus').then((module) => ({
    default: module.ToolStatus,
  }))
);

// Loading fallback for lazy components
const AnalyticsLoadingFallback = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-24 bg-gray-200 rounded-lg"></div>
  </div>
);

/**
 * SterilizationAnalytics component that displays comprehensive analytics and metrics
 * for sterilization operations. Shows cycle statistics, BI test results, and performance trends.
 * Provides visual indicators and real-time data for sterilization workflow monitoring.
 *
 * @returns {JSX.Element} Analytics dashboard with KPI cards and detailed metrics
 */
const SterilizationAnalytics: React.FC = () => {
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(true); // Start loading immediately

  // Initialize sterilization store data
  const { isLoading: isInitializing, error: initError } =
    useSterilizationInitialization();

  // Always call hooks in the same order
  const {
    stats,
    additionalMetrics,
    recentBITests,
    nextBITestDue,
    recentActivities,
    refreshBIResults,
  } = useAnalyticsData();

  // Defer analytics loading to prevent blocking initial page render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadAnalytics(true);
    }, 100); // Small delay to let page render first

    return () => clearTimeout(timer);
  }, []);

  // Show loading state if still initializing or not ready to load analytics
  if (isInitializing || !shouldLoadAnalytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
            <Icon
              path={mdiChartLine}
              size={1.2}
              className="text-[#4ECDC4] mr-2"
            />
            Sterilization Analytics
          </h2>
          <div className="text-sm text-gray-500">
            {initError ? 'Error loading data' : 'Loading...'}
          </div>
        </div>
        {initError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {initError}
          </div>
        )}
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Always show analytics tables, even with no data

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
          <Icon
            path={mdiChartLine}
            size={1.2}
            className="text-[#4ECDC4] mr-2"
          />
          Sterilization Analytics
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Overall Efficiency Trend */}
      <TrendScore
        score={stats.efficiencyScore?.score || 0}
        trend={stats.efficiencyScore?.trend}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Cycles"
          value={stats.totalCycles}
          icon={mdiThermometer}
          iconBgColor="bg-blue-500"
          gradientFrom="blue-50"
          gradientTo="blue-100"
          borderColor="blue-200"
          textColor="text-blue-600"
          valueColor="text-blue-800"
          trend={stats.cycleTrend}
        />

        <KPICard
          title="Completed Cycles"
          value={stats.completedCycles}
          icon={mdiCheckCircle}
          iconBgColor="bg-green-500"
          gradientFrom="green-50"
          gradientTo="green-100"
          borderColor="green-200"
          textColor="text-green-600"
          valueColor="text-green-800"
          trend={stats.cycleTrend}
        />

        <KPICard
          title="Tool Turnaround Time"
          value={`${Math.round(stats.averageCycleTime)} min`}
          icon={mdiClock}
          iconBgColor="bg-purple-500"
          gradientFrom="purple-50"
          gradientTo="purple-100"
          borderColor="purple-200"
          textColor="text-purple-600"
          valueColor="text-purple-800"
          trend={{ direction: 'down', value: 'Target: <60 min' }}
        />

        <KPICard
          title="BI Pass Rate"
          value={`${Math.round(stats.biPassRate)}%`}
          icon={mdiTestTube}
          iconBgColor="bg-orange-500"
          gradientFrom="orange-50"
          gradientTo="orange-100"
          borderColor="orange-200"
          textColor="text-orange-600"
          valueColor="text-orange-800"
          trend={stats.biPassRateTrend}
        />
      </div>

      {/* Detailed Metrics - Lazy Loaded */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<AnalyticsLoadingFallback />}>
          <LazyRecentActivity activities={recentActivities} />
        </Suspense>
        <Suspense fallback={<AnalyticsLoadingFallback />}>
          <LazyBITestResults
            recentTests={recentBITests}
            nextTestDue={nextBITestDue}
            refreshBIResults={refreshBIResults}
          />
        </Suspense>
        <Suspense fallback={<AnalyticsLoadingFallback />}>
          <LazyToolStatus
            totalTools={additionalMetrics.totalTools}
            activeTools={additionalMetrics.activeTools}
            completedToday={additionalMetrics.completedToday}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default SterilizationAnalytics;
