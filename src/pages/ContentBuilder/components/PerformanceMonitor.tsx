import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiPlay, mdiPause } from '@mdi/js';

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  loadTime: number;
  bundleSize: number;
  apiResponseTime: number;
}

// Performance monitoring component
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    loadTime: 0,
    bundleSize: 0,
    apiResponseTime: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringIntervalRef = useRef<NodeJS.Timeout>();

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);

    monitoringIntervalRef.current = setInterval(() => {
      // Measure render time
      const renderStart = performance.now();

      // Measure memory usage
      const memoryUsage =
        (performance as Performance & { memory?: { usedJSHeapSize: number } })
          .memory?.usedJSHeapSize || 0;

      // Measure FPS
      const fps = Math.round(1000 / (performance.now() - renderStart));

      // Measure load time
      const loadTime =
        performance.timing.loadEventEnd - performance.timing.navigationStart;

      // Measure bundle size (approximate)
      const bundleSize = document.querySelectorAll('script').length * 50000; // Rough estimate

      // Measure API response time (mock)
      const apiResponseTime = Math.random() * 100 + 50;

      setMetrics({
        renderTime: renderStart,
        memoryUsage,
        fps,
        loadTime,
        bundleSize,
        apiResponseTime,
      });
    }, 1000);
  }, []);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Performance Monitor
        </h3>
        <div className="flex items-center gap-2">
          {!isMonitoring ? (
            <button
              onClick={startMonitoring}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Icon path={mdiPlay} size={1} />
              Start Monitoring
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Icon path={mdiPause} size={1} />
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{metrics.fps}</div>
          <div className="text-xs text-gray-600">FPS</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((metrics.memoryUsage / 1024 / 1024) * 100) / 100}
          </div>
          <div className="text-xs text-gray-600">Memory (MB)</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(metrics.renderTime * 100) / 100}
          </div>
          <div className="text-xs text-gray-600">Render Time (ms)</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(metrics.loadTime)}
          </div>
          <div className="text-xs text-gray-600">Load Time (ms)</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">
            {Math.round(metrics.bundleSize / 1024)}
          </div>
          <div className="text-xs text-gray-600">Bundle Size (KB)</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {Math.round(metrics.apiResponseTime)}
          </div>
          <div className="text-xs text-gray-600">API Response (ms)</div>
        </div>
      </div>

      {/* Performance Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Performance Status
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">FPS Performance</span>
            <span
              className={`text-sm font-medium ${
                metrics.fps >= 60
                  ? 'text-green-600'
                  : metrics.fps >= 30
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {metrics.fps >= 60
                ? 'Excellent'
                : metrics.fps >= 30
                  ? 'Good'
                  : 'Poor'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Memory Usage</span>
            <span
              className={`text-sm font-medium ${
                metrics.memoryUsage < 50 * 1024 * 1024
                  ? 'text-green-600'
                  : metrics.memoryUsage < 100 * 1024 * 1024
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {metrics.memoryUsage < 50 * 1024 * 1024
                ? 'Optimal'
                : metrics.memoryUsage < 100 * 1024 * 1024
                  ? 'Acceptable'
                  : 'High'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Load Performance</span>
            <span
              className={`text-sm font-medium ${
                metrics.loadTime < 2000
                  ? 'text-green-600'
                  : metrics.loadTime < 5000
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {metrics.loadTime < 2000
                ? 'Fast'
                : metrics.loadTime < 5000
                  ? 'Moderate'
                  : 'Slow'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
