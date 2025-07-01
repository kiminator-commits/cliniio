import React, { useMemo, memo } from 'react';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiThermometer,
  mdiClock,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiTestTube,
  mdiTools,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiCalendar,
} from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';

const SterilizationAnalytics: React.FC = () => {
  const { getCycleStats, cycles, currentCycle, biTestResults, nextBITestDue } =
    useSterilizationStore();
  const stats = getCycleStats();

  // Memoize tools array creation to avoid recreating on every render
  const tools = useMemo(() => {
    return cycles.flatMap(c => c.tools);
  }, [cycles]);

  // Memoize analytics summary calculation to improve performance
  const analyticsSummary = useMemo(() => {
    return {
      totalTools: tools.length,
      cleanTools: tools.filter(t => t.currentPhase === 'complete').length,
      dirtyTools: tools.filter(t => t.currentPhase === 'failed').length,
      autoclaved: tools.filter(t => t.currentPhase === 'autoclave').length,
    };
  }, [tools]);

  // Memoize additional metrics calculations
  const additionalMetrics = useMemo(() => {
    const totalTools = analyticsSummary.totalTools;
    const activeTools = currentCycle?.tools.length || 0;
    const completedToday = cycles.filter(c => {
      const today = new Date();
      const cycleDate = new Date(c.startTime);
      return cycleDate.toDateString() === today.toDateString() && c.status === 'completed';
    }).length;

    return { totalTools, activeTools, completedToday };
  }, [analyticsSummary.totalTools, currentCycle?.tools.length, cycles]);

  // Memoize recent BI test results filtering and sorting
  const recentBITests = useMemo(() => {
    return biTestResults
      .filter(result => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return result.date >= sevenDaysAgo;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [biTestResults]);

  const getBiStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      case 'in-progress':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBiStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return mdiCheckCircle;
      case 'fail':
        return mdiAlertCircle;
      case 'in-progress':
        return mdiTestTube;
      default:
        return mdiTestTube;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
          <Icon path={mdiChartLine} size={1.2} className="text-[#4ECDC4] mr-2" />
          Sterilization Analytics
        </h2>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Cycles */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Cycles</p>
              <p className="text-2xl font-bold text-blue-800">{stats.totalCycles}</p>
            </div>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Icon path={mdiThermometer} size={1.5} className="text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <Icon path={mdiTrendingUp} size={0.8} className="mr-1" />
            <span>+12% this week</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-800">
                {stats.totalCycles > 0
                  ? Math.round((stats.completedCycles / stats.totalCycles) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-2 bg-green-500 rounded-lg">
              <Icon path={mdiCheckCircle} size={1.5} className="text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-green-600">
            <Icon path={mdiTrendingUp} size={0.8} className="mr-1" />
            <span>+5% this month</span>
          </div>
        </div>

        {/* Average Cycle Time */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Cycle Time</p>
              <p className="text-2xl font-bold text-purple-800">
                {Math.round(stats.averageCycleTime)} min
              </p>
            </div>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Icon path={mdiClock} size={1.5} className="text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-purple-600">
            <Icon path={mdiTrendingDown} size={0.8} className="mr-1" />
            <span>-8% this month</span>
          </div>
        </div>

        {/* BI Pass Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">BI Pass Rate</p>
              <p className="text-2xl font-bold text-orange-800">{Math.round(stats.biPassRate)}%</p>
            </div>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Icon path={mdiTestTube} size={1.5} className="text-white" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-xs text-orange-600">
            <Icon path={mdiTrendingUp} size={0.8} className="mr-1" />
            <span>+2% this week</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div
          className="bg-gray-50 rounded-lg p-4"
          style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Cycle completed</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">3 tools</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">New cycle started</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">5 tools</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">BI test in progress</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">2 tools</span>
            </div>
          </div>
        </div>

        {/* BI Test Results */}
        <div
          className="bg-gray-50 rounded-lg p-4"
          style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon path={mdiTestTube} size={1} className="text-orange-600" />
            BI Test Results
          </h3>

          {/* Next Test Due */}
          <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Icon path={mdiCalendar} size={0.8} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Next Test Due</span>
            </div>
            <p className="text-sm text-gray-600">
              {nextBITestDue ? nextBITestDue.toLocaleDateString() : 'Not scheduled'}
            </p>
            {nextBITestDue && (
              <p className="text-xs text-gray-500">
                {nextBITestDue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Recent Results */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Recent Results</h4>
            {recentBITests.length > 0 ? (
              recentBITests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      path={getBiStatusIcon(test.result)}
                      size={0.8}
                      className={getBiStatusColor(test.result)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {test.result.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{test.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{test.operator}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Icon path={mdiTestTube} size={1.5} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent BI tests</p>
              </div>
            )}
          </div>
        </div>

        {/* Tool Status */}
        <div
          className="bg-gray-50 rounded-lg p-4"
          style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tool Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Icon path={mdiTools} size={1} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Tools</p>
                  <p className="text-xs text-gray-500">In system</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-gray-800">
                {additionalMetrics.totalTools}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Icon path={mdiThermometer} size={1} className="text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">In Cycle</p>
                  <p className="text-xs text-gray-500">Currently processing</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-blue-600">
                {additionalMetrics.activeTools}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <Icon path={mdiCheckCircle} size={1} className="text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Completed Today</p>
                  <p className="text-xs text-gray-500">Sterilized tools</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {additionalMetrics.completedToday}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div
        className="mt-6 bg-gray-50 rounded-lg p-4"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
        <div className="h-32 bg-white rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Icon path={mdiChartLine} size={2} className="mx-auto mb-2" />
            <p className="text-sm">Performance chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SterilizationAnalytics);
