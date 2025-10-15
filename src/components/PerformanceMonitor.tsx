import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  componentMountTime: number;
  dataLoadTime?: number;
  totalTime: number;
  navigationTime?: number;
  authenticationTime?: number;
  dataFetchTime?: number;
}

interface PerformanceMonitorProps {
  pageName: string;
  metrics: PerformanceMetrics;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  pageName,
  metrics,
  showDetails = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bottlenecks, setBottlenecks] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'good' | 'warning' | 'critical'>(
    'good'
  );

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return undefined;
    }

    // Analyze bottlenecks
    const detectedBottlenecks: string[] = [];

    if (metrics.navigationTime && metrics.navigationTime > 100) {
      detectedBottlenecks.push(
        `Navigation: ${metrics.navigationTime.toFixed(2)}ms`
      );
    }

    if (metrics.authenticationTime && metrics.authenticationTime > 50) {
      detectedBottlenecks.push(
        `Auth: ${metrics.authenticationTime.toFixed(2)}ms`
      );
    }

    if (metrics.dataFetchTime && metrics.dataFetchTime > 200) {
      detectedBottlenecks.push(`Data: ${metrics.dataFetchTime.toFixed(2)}ms`);
    }

    if (metrics.pageLoadTime > 300) {
      detectedBottlenecks.push(`Mount: ${metrics.pageLoadTime.toFixed(2)}ms`);
    }

    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      setBottlenecks(detectedBottlenecks);

      // Determine severity
      let newSeverity: 'good' | 'warning' | 'critical' = 'good';
      if (metrics.totalTime > 1000) {
        newSeverity = 'critical';
      } else if (metrics.totalTime > 500) {
        newSeverity = 'warning';
      }
      setSeverity(newSeverity);
      setIsVisible(detectedBottlenecks.length > 0 || metrics.totalTime > 500);
    }, 0);

    // Auto-hide after 8 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [metrics]);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getSeverityColor = (time: number) => {
    if (time > 1000) return 'text-red-600';
    if (time > 500) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSeverityBgColor = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getSeverityTextColor = () => {
    switch (severity) {
      case 'critical':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-green-800';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${getSeverityBgColor()}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-semibold text-sm ${getSeverityTextColor()}`}>
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Page:</span> {pageName}
        </div>

        <div
          className={`text-sm font-medium ${getSeverityColor(metrics.totalTime)}`}
        >
          Total: {metrics.totalTime.toFixed(2)}ms
        </div>

        {showDetails && (
          <div className="space-y-1 text-xs">
            {metrics.pageLoadTime > 0 && (
              <div className={getSeverityColor(metrics.pageLoadTime)}>
                Mount: {metrics.pageLoadTime.toFixed(2)}ms
              </div>
            )}
            {metrics.navigationTime && (
              <div className={getSeverityColor(metrics.navigationTime)}>
                Navigation: {metrics.navigationTime.toFixed(2)}ms
              </div>
            )}
            {metrics.authenticationTime && (
              <div className={getSeverityColor(metrics.authenticationTime)}>
                Auth: {metrics.authenticationTime.toFixed(2)}ms
              </div>
            )}
            {metrics.dataFetchTime && (
              <div className={getSeverityColor(metrics.dataFetchTime)}>
                Data: {metrics.dataFetchTime.toFixed(2)}ms
              </div>
            )}
          </div>
        )}

        {bottlenecks.length > 0 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-red-600 mb-1">
              Bottlenecks:
            </div>
            <ul className="text-xs text-red-600 space-y-1">
              {bottlenecks.map((bottleneck, index) => (
                <li key={index}>• {bottleneck}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
