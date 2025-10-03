import React, { memo } from 'react';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiThermometer,
  mdiClock,
  mdiCheckCircle,
  mdiTestTube,
} from '@mdi/js';
import { KPICard } from './KPICard';
import { RecentActivity } from './RecentActivity';
import { BITestResults } from './BITestResults';
import { ToolStatus } from './ToolStatus';
import { TrendScore } from './TrendScore';

import { useAnalyticsData } from './hooks/useAnalyticsData';

/**
 * SterilizationAnalytics component that displays comprehensive analytics and metrics
 * for sterilization operations. Shows cycle statistics, BI test results, and performance trends.
 * Provides visual indicators and real-time data for sterilization workflow monitoring.
 *
 * @returns {JSX.Element} Analytics dashboard with KPI cards and detailed metrics
 */
const SterilizationAnalytics: React.FC = () => {
  const {
    stats,
    additionalMetrics,
    recentBITests,
    nextBITestDue,
    recentActivities,
  } = useAnalyticsData();

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
          title="Avg Cycle Time"
          value={`${Math.round(stats.averageCycleTime)} min`}
          icon={mdiClock}
          iconBgColor="bg-purple-500"
          gradientFrom="purple-50"
          gradientTo="purple-100"
          borderColor="purple-200"
          textColor="text-purple-600"
          valueColor="text-purple-800"
          trend={{ direction: 'down', value: '-8% this month' }}
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

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity activities={recentActivities} />
        <BITestResults
          recentTests={recentBITests}
          nextTestDue={nextBITestDue}
        />
        <ToolStatus
          totalTools={additionalMetrics.totalTools}
          activeTools={additionalMetrics.activeTools}
          completedToday={additionalMetrics.completedToday}
        />
      </div>
    </div>
  );
};

export default memo(SterilizationAnalytics);
