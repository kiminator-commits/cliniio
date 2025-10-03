import React from 'react';
import { BulkProgress } from '../services/inventoryBulkProgressService';

interface BulkOperationProgressProps {
  progress: BulkProgress;
  operation: 'delete' | 'update' | 'export' | 'import';
  onCancel?: () => void;
}

export const BulkOperationProgress: React.FC<BulkOperationProgressProps> = ({
  progress,
  operation,
  onCancel,
}) => {
  const getOperationLabel = () => {
    switch (operation) {
      case 'delete':
        return 'Deleting';
      case 'update':
        return 'Updating';
      case 'export':
        return 'Exporting';
      case 'import':
        return 'Importing';
      default:
        return 'Processing';
    }
  };

  const getProgressColor = () => {
    if (progress.failed > 0) {
      return 'text-red-600';
    }
    if (progress.percentage === 100) {
      return 'text-green-600';
    }
    return 'text-blue-600';
  };

  const formatMemoryUsage = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatProcessingRate = (rate?: number) => {
    if (!rate) return 'N/A';
    return `${rate} items/sec`;
  };

  const formatTimeRemaining = (ms?: number) => {
    if (!ms) return 'Calculating...';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getOperationLabel()} Items
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            {progress.completed}/{progress.total} items
          </span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress.failed > 0 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Processing Rate
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatProcessingRate(progress.processingRate)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Memory Usage
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatMemoryUsage(progress.memoryUsage)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Concurrent Workers
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {progress.concurrentWorkers || 'N/A'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Time Remaining
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatTimeRemaining(progress.estimatedTimeRemaining)}
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {progress.completed}
          </div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progress.inProgress}
          </div>
          <div className="text-xs text-gray-500">In Progress</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {progress.failed}
          </div>
          <div className="text-xs text-gray-500">Failed</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {progress.currentBatch}/{progress.totalBatches}
          </div>
          <div className="text-xs text-gray-500">Batches</div>
        </div>
      </div>

      {/* Recent Errors */}
      {progress.errors.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Recent Errors
          </h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
            {progress.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-700 mb-1">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Batch {progress.currentBatch} of {progress.totalBatches} •{' '}
            {progress.percentage}% complete
          </span>
          <span className={`font-medium ${getProgressColor()}`}>
            {progress.failed > 0 ? `${progress.failed} errors` : 'All good'}
          </span>
        </div>
      </div>
    </div>
  );
};
