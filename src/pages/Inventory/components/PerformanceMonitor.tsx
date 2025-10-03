import React, { useState, useEffect } from 'react';
import { PerformanceMetrics } from '../services/inventoryBulkProgressService';

interface PerformanceMonitorProps {
  operationId?: string;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  operationId,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] =
    useState<PerformanceMetrics | null>(null);
  // const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Refresh metrics every 2 seconds
    const interval = setInterval(() => {
      const allMetrics =
        window.InventoryBulkProgressService?.getAllPerformanceMetrics() || [];
      setMetrics(allMetrics);

      if (operationId) {
        const currentMetric =
          window.InventoryBulkProgressService?.getPerformanceMetrics(
            operationId
          );
        if (currentMetric) {
          setSelectedMetric(currentMetric);
        }
      }
    }, 2000);

    // setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [operationId]);

  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatProcessingTime = (ms: number) => {
    const seconds = ms / 1000;
    return `${seconds.toFixed(2)}s`;
  };

  const formatProcessingRate = (rate: number) => {
    return `${rate} items/sec`;
  };

  const getPerformanceGrade = (metric: PerformanceMetrics) => {
    const avgTime = metric.averageProcessingTime;
    const memoryEfficiency = metric.peakMemoryUsage / (1024 * 1024); // MB

    if (avgTime < 100 && memoryEfficiency < 50) return 'A+';
    if (avgTime < 200 && memoryEfficiency < 100) return 'A';
    if (avgTime < 500 && memoryEfficiency < 200) return 'B';
    if (avgTime < 1000 && memoryEfficiency < 500) return 'C';
    return 'D';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'text-green-600';
      case 'A':
        return 'text-green-500';
      case 'B':
        return 'text-yellow-600';
      case 'C':
        return 'text-orange-600';
      case 'D':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Performance Monitor</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              window.InventoryBulkProgressService?.clearPerformanceMetrics()
            }
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Clear History
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Current Operation */}
      {selectedMetric && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Current Operation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-blue-600">Items Processed</div>
              <div className="text-lg font-bold text-blue-900">
                {selectedMetric.processedItems}/{selectedMetric.totalItems}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Processing Rate</div>
              <div className="text-lg font-bold text-blue-900">
                {formatProcessingRate(selectedMetric.processingRate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Memory Usage</div>
              <div className="text-lg font-bold text-blue-900">
                {formatMemoryUsage(selectedMetric.peakMemoryUsage)}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Workers</div>
              <div className="text-lg font-bold text-blue-900">
                {selectedMetric.concurrentWorkers}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance History */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Performance History
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processing Time
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workers
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.startTime
                      ? new Date(metric.startTime).toLocaleTimeString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.processedItems}/{metric.totalItems}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.endTime
                      ? formatProcessingTime(metric.endTime - metric.startTime)
                      : 'In Progress'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatProcessingRate(metric.processingRate)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {formatMemoryUsage(metric.peakMemoryUsage)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.concurrentWorkers}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`font-bold ${getGradeColor(getPerformanceGrade(metric))}`}
                    >
                      {getPerformanceGrade(metric)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Cache Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Export Cache Size</div>
            <div className="text-lg font-bold text-gray-900">
              {window.InventoryExportService?.getCacheStats()?.size || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Export Cache Max</div>
            <div className="text-lg font-bold text-gray-900">
              {window.InventoryExportService?.getCacheStats()?.maxSize || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Bulk Cache Size</div>
            <div className="text-lg font-bold text-gray-900">
              {window.InventoryBulkProgressService?.getCacheStats()?.size || 0}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Cache Hit Rate</div>
            <div className="text-lg font-bold text-gray-900">
              {window.InventoryBulkProgressService?.getCacheStats()?.hitRate ||
                0}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Memory Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Memory Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Current Memory</div>
            <div className="text-lg font-bold text-gray-900">
              {formatMemoryUsage(
                window.InventoryExportService?.getMemoryStats()?.current || 0
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Memory Limit</div>
            <div className="text-lg font-bold text-gray-900">
              {formatMemoryUsage(
                window.InventoryExportService?.getMemoryStats()?.limit || 0
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Memory Usage %</div>
            <div className="text-lg font-bold text-gray-900">
              {(() => {
                const stats = window.InventoryExportService?.getMemoryStats();
                if (stats?.current && stats?.limit) {
                  return `${((stats.current / stats.limit) * 100).toFixed(1)}%`;
                }
                return 'N/A';
              })()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-lg font-bold text-green-600">
              {(() => {
                const stats = window.InventoryExportService?.getMemoryStats();
                if (stats?.current && stats?.limit) {
                  const usage = (stats.current / stats.limit) * 100;
                  if (usage > 80) return 'Warning';
                  if (usage > 60) return 'Moderate';
                  return 'Good';
                }
                return 'Unknown';
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
