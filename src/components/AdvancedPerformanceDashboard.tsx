import React, { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '@/services/monitoring/PerformanceMonitor';
import {
  PerformanceAlert,
  PerformanceTrend,
  PerformanceInsight,
  SystemHealth,
  PerformanceSnapshot,
} from '@/services/monitoring/PerformanceMonitor';

interface AdvancedPerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const AdvancedPerformanceDashboard: React.FC<
  AdvancedPerformanceDashboardProps
> = ({ isVisible = false, onClose }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [history, setHistory] = useState<PerformanceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('response_time');

  const loadData = useCallback(async () => {
    if (!isVisible) return;

    setIsLoading(true);
    try {
      const [healthData, alertsData, trendsData, insightsData, historyData] =
        await Promise.all([
          performanceMonitor.getSystemHealth(),
          Promise.resolve(performanceMonitor.getActiveAlerts()),
          Promise.resolve(
            performanceMonitor.getPerformanceTrends(selectedMetric)
          ),
          Promise.resolve(performanceMonitor.getPerformanceInsights()),
          Promise.resolve(performanceMonitor.getPerformanceHistory()),
        ]);

      setHealth(healthData);
      setAlerts(alertsData);
      setTrends(trendsData);
      setInsights(insightsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isVisible, selectedMetric]);

  useEffect(() => {
    loadData();

    // Subscribe to alerts
    const unsubscribe = performanceMonitor.subscribeToAlerts((alert) => {
      setAlerts((prev) => [...prev, alert]);
    });

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadData]);

  if (!isVisible) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'degrading':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '❓';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'optimization':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Advanced Performance Dashboard
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* System Health Overview */}
              {health && (
                <div
                  className={`p-4 rounded-lg border ${getHealthColor(health.status)}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">System Health</h3>
                    <div className="text-2xl font-bold">{health.score}/100</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Response Time</div>
                      <div className="font-medium">
                        {health.metrics.responseTime.toFixed(2)}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Memory Usage</div>
                      <div className="font-medium">
                        {(health.metrics.memory / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                      <div className="font-medium">
                        {health.metrics.errorRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Throughput</div>
                      <div className="font-medium">
                        {health.metrics.throughput.toFixed(2)} ops/sec
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Trends */}
              {trends.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Trends
                  </h3>
                  <div className="space-y-2">
                    {trends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-white rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {getTrendIcon(trend.trend)}
                          </span>
                          <span className="font-medium">{trend.metric}</span>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${trend.trend === 'degrading' ? 'text-red-600' : trend.trend === 'improving' ? 'text-green-600' : 'text-gray-600'}`}
                          >
                            {trend.changePercent > 0 ? '+' : ''}
                            {trend.changePercent}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {trend.period}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              {insights.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Performance Insights
                  </h3>
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            insight.impact === 'high'
                              ? 'bg-red-100 text-red-800'
                              : insight.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      {insight.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2">
                            Recommendations:
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {insight.recommendations.map((rec, recIndex) => (
                              <li key={recIndex} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Active Alerts */}
              {alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">
                    Active Alerts
                  </h3>
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-red-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-red-800">
                              {alert.metric}
                            </div>
                            <div className="text-sm text-red-600">
                              {alert.message}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-xs px-2 py-1 rounded ${
                                alert.severity === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {alert.severity}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metric Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Performance History
                </h3>
                <div className="mb-4">
                  <label
                    htmlFor="metric-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Metric
                  </label>
                  <select
                    id="metric-select"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="response_time">Response Time</option>
                    <option value="memory_usage">Memory Usage</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="throughput">Throughput</option>
                    <option value="component_mount_time">
                      Component Mount Time
                    </option>
                    <option value="authentication_time">
                      Authentication Time
                    </option>
                    <option value="data_fetch_time">Data Fetch Time</option>
                    <option value="navigation_time">Navigation Time</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {history.length} data points for {selectedMetric}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh Data
                </button>
                <button
                  onClick={() => {
                    // Clear all alerts
                    alerts.forEach((alert) =>
                      performanceMonitor.resolveAlert(alert.id)
                    );
                    setAlerts([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Alerts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
