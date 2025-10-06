import React, { useState, useEffect } from 'react';
// import { PerformanceMetrics } from '../services/inventoryBulkProgressService';
import { PerformanceMetric } from '../../../types/performanceTypes';

// Temporary type declarations for window services
declare global {
  interface Window {
    InventoryBulkProgressService?: {
      getAllPerformanceMetrics(): PerformanceMetric[];
      getPerformanceMetrics(operationId: string): PerformanceMetric | null;
      clearPerformanceMetrics(): void;
      getCacheStats(): { size: number; hitRate: number };
    };
    InventoryExportService?: {
      getCacheStats(): { size: number; maxSize: number };
      getMemoryStats(): { current: number; limit: number };
    };
  }
}

interface PerformanceMonitorProps {
  operationId?: string;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  operationId,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedMetric, setSelectedMetric] =
    useState<PerformanceMetric | null>(null);
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

  const _formatProcessingRate = (rate: number) => {
    return `${rate} items/sec`;
  };

  const getPerformanceGrade = (metric: PerformanceMetric) => {
    const duration = metric.duration || 0;
    const memoryEfficiency = (metric.metadata?.peakMemoryUsage as number) || 0;
    const memoryEfficiencyMB = memoryEfficiency / (1024 * 1024); // MB

    if (duration < 100 && memoryEfficiencyMB < 50) return 'A+';
    if (duration < 200 && memoryEfficiencyMB < 100) return 'A';
    if (duration < 500 && memoryEfficiencyMB < 200) return 'B';
    if (duration < 1000 && memoryEfficiencyMB < 500) return 'C';
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
                {selectedMetric.itemsProcessed}/{selectedMetric.totalItems}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Progress</div>
              <div className="text-lg font-bold text-blue-900">
                {selectedMetric.progress}%
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Status</div>
              <div className="text-lg font-bold text-blue-900">
                {selectedMetric.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-blue-600">Duration</div>
              <div className="text-lg font-bold text-blue-900">
                {selectedMetric.duration
                  ? formatProcessingTime(selectedMetric.duration)
                  : 'N/A'}
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
                  Progress
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
                    {metric.itemsProcessed}/{metric.totalItems}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.progress}%
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        metric.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : metric.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : metric.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {metric.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.duration
                      ? formatProcessingTime(metric.duration)
                      : 'In Progress'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {metric.operationType}
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
