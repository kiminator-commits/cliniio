import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../services/monitoring/PerformanceMonitor';

interface MetricData {
  value: number;
  timestamp: Date;
  label?: string;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'critical';
  score: number;
  metrics: Record<string, number>;
}

interface AlertData {
  id: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: Date;
}

interface PerformanceDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isVisible = false,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<Map<string, MetricData[]>>(new Map());
  const [health, setHealth] = useState<HealthData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  useEffect(() => {
    if (!isVisible) return undefined;

    const updateMetrics = () => {
      setMetrics(performanceMonitor.getAllMetrics());
      setAlerts(performanceMonitor.getActiveAlerts());

      performanceMonitor.getSystemHealth().then(setHealth);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Reduced from 1000ms to 30000ms

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getMetricSummary = (metricName: string) => {
    const metricList = metrics.get(metricName) || [];
    if (metricList.length === 0) return { avg: 0, max: 0, count: 0 };

    const values = metricList.map((m: MetricData) => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);

    return { avg: avg.toFixed(2), max: max.toFixed(2), count: values.length };
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Performance Monitor</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* System Health */}
        {health && (
          <div className="border-b border-gray-200 pb-4">
            <h4 className="font-medium mb-2">System Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={getHealthColor(health.status)}>
                  {health.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Score:</span>
                <span>{health.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span>{health.metrics.responseTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-medium mb-2">Key Metrics</h4>
          <div className="space-y-2 text-sm">
            {[
              'component_mount_time',
              'authentication_time',
              'data_fetch_time',
              'navigation_time',
            ].map((metric) => {
              const summary = getMetricSummary(metric);
              return (
                <div key={metric} className="flex justify-between">
                  <span className="capitalize">
                    {metric.replace(/_/g, ' ')}:
                  </span>
                  <span>
                    Avg: {summary.avg}ms | Max: {summary.max}ms | Count:{' '}
                    {summary.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Active Alerts</h4>
            <div className="space-y-1">
              {alerts.map((alert: AlertData) => (
                <div
                  key={alert.id}
                  className="text-sm text-red-600 bg-red-50 p-2 rounded"
                >
                  <div className="font-medium">
                    {alert.severity.toUpperCase()}
                  </div>
                  <div>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
