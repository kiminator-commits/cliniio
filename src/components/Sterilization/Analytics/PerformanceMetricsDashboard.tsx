import React, { useState, useEffect, useCallback } from 'react';
import {
  PerformanceMetricsService,
  PerformanceSummary,
  ServicePerformance,
} from '../../../services/ai/sterilization/performanceMetricsService';

interface PerformanceMetricsDashboardProps {
  facilityId: string;
  className?: string;
}

export const PerformanceMetricsDashboard: React.FC<
  PerformanceMetricsDashboardProps
> = ({ facilityId, className = '' }) => {
  const [performanceMetrics] = useState(
    () => new PerformanceMetricsService(facilityId)
  );
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [servicePerformance, setServicePerformance] = useState<
    ServicePerformance[]
  >([]);
  const [trends, setTrends] = useState<{
    dates: string[];
    processingTimes: number[];
    successRates: number[];
    operationCounts: number[];
  }>({ dates: [], processingTimes: [], successRates: [], operationCounts: [] });
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>(
    'day'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, serviceData, trendsData] = await Promise.all([
        performanceMetrics.getPerformanceSummary(timeRange),
        performanceMetrics.getServicePerformance(timeRange),
        performanceMetrics.getPerformanceTrends('week'),
      ]);

      setSummary(summaryData);
      setServicePerformance(serviceData);
      setTrends(trendsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load performance data'
      );
      console.error('Error loading performance data:', err);
    } finally {
      setLoading(false);
    }
  }, [performanceMetrics, timeRange]);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  const getPerformanceTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degrading':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getPerformanceScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          Loading performance metrics...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading performance data</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={loadPerformanceData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              AI Performance Metrics
            </h3>
            <p className="text-sm text-gray-600">
              Monitor and optimize AI service performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="timeRange"
              className="text-sm font-medium text-gray-700"
            >
              Time Range:
            </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) =>
                setTimeRange(
                  e.target.value as 'hour' | 'day' | 'week' | 'month'
                )
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hour">Last Hour</option>
              <option value="day">Last Day</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Performance Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800">
                Total Operations
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {summary.totalOperations}
              </div>
              <div className="text-xs text-blue-600">AI service calls</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800">
                Success Rate
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatPercentage(summary.successRate)}
              </div>
              <div className="text-xs text-green-600">
                Successful operations
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800">
                Avg Processing Time
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {formatTime(summary.averageProcessingTime)}
              </div>
              <div className="text-xs text-yellow-600">Response time</div>
            </div>

            <div
              className={`border rounded-lg p-4 ${getPerformanceTrendColor(summary.performanceTrend)}`}
            >
              <div className="text-sm font-medium">Performance Trend</div>
              <div className="text-2xl font-bold capitalize">
                {summary.performanceTrend}
              </div>
              <div className="text-xs">Overall direction</div>
            </div>
          </div>
        )}

        {/* Service Performance Table */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            Service Performance Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Errors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servicePerformance.map((service) => (
                  <tr key={service.serviceName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.operationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(service.successRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(service.averageTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.totalErrors}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-semibold ${getPerformanceScoreColor(service.performanceScore)}`}
                      >
                        {service.performanceScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Trends Chart */}
        {trends.dates.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Performance Trends (Last Week)
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Processing Times
                  </div>
                  <div className="space-y-1">
                    {trends.processingTimes.slice(-5).map((time, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>
                          {trends.dates[trends.dates.length - 5 + index]}
                        </span>
                        <span className="font-medium">{formatTime(time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Success Rates
                  </div>
                  <div className="space-y-1">
                    {trends.successRates.slice(-5).map((rate, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>
                          {trends.dates[trends.dates.length - 5 + index]}
                        </span>
                        <span className="font-medium">
                          {formatPercentage(rate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Operation Counts
                  </div>
                  <div className="space-y-1">
                    {trends.operationCounts.slice(-5).map((count, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span>
                          {trends.dates[trends.dates.length - 5 + index]}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        {summary && summary.recommendations.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4">
              Optimization Recommendations
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2">
                {summary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-sm text-blue-800">
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">
            Detailed Performance Metrics
          </h4>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Processing Time Percentiles
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Median (P50):</span>
                    <span className="font-medium">
                      {formatTime(summary.medianProcessingTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>95th Percentile (P95):</span>
                    <span className="font-medium">
                      {formatTime(summary.p95ProcessingTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>99th Percentile (P99):</span>
                    <span className="font-medium">
                      {formatTime(summary.p99ProcessingTime)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Error Analysis
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Errors:</span>
                    <span className="font-medium text-red-600">
                      {summary.totalErrors}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className="font-medium text-red-600">
                      {formatPercentage(summary.errorRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-green-600">
                      {formatPercentage(summary.successRate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
