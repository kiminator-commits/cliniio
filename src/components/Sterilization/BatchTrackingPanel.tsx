import React, { useState } from 'react';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { SterilizationBatch } from '../../types/sterilizationTypes';
import {
  mdiPackage,
  mdiClock,
  mdiCheck,
  mdiAlert,
  mdiEye,
  mdiHistory,
} from '@mdi/js';
import Icon from '../Icon/Icon';

export function BatchTrackingPanel() {
  const { batchHistory, getBatchesByStatus, updateBatchStatus, getBatchById } =
    useSterilizationStore();

  const [selectedBatch, setSelectedBatch] = useState<SterilizationBatch | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Get batches by status
  const readyBatches = getBatchesByStatus('ready');
  const inAutoclaveBatches = getBatchesByStatus('in_autoclave');
  const failedBatches = getBatchesByStatus('failed');

  const getStatusColor = (status: SterilizationBatch['status']) => {
    switch (status) {
      case 'creating':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_autoclave':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: SterilizationBatch['status']) => {
    switch (status) {
      case 'creating':
        return mdiClock;
      case 'ready':
        return mdiPackage;
      case 'in_autoclave':
        return mdiClock;
      case 'completed':
        return mdiCheck;
      case 'failed':
        return mdiAlert;
      default:
        return mdiPackage;
    }
  };

  const handleViewBatch = (batch: SterilizationBatch) => {
    setSelectedBatch(batch);
  };

  const handleUpdateStatus = (
    batchId: string,
    newStatus: SterilizationBatch['status']
  ) => {
    updateBatchStatus(batchId, newStatus);
    if (selectedBatch?.id === batchId) {
      const updatedBatch = getBatchById(batchId);
      setSelectedBatch(updatedBatch);
    }
  };

  const renderBatchCard = (batch: SterilizationBatch) => (
    <div
      key={batch.id}
      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:shadow-md ${getStatusColor(batch.status)}`}
      onClick={() => handleViewBatch(batch)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewBatch(batch);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for batch ${batch.batchCode || 'No Code'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon path={getStatusIcon(batch.status)} size={1} />
          <span className="font-medium">{batch.batchCode || 'No Code'}</span>
        </div>
        <span className="text-xs px-2 py-1 bg-white rounded-full">
          {batch.tools.length} tools
        </span>
      </div>
      <div className="text-sm space-y-1">
        <p>
          <strong>Created:</strong> {batch.createdAt.toLocaleDateString()}
        </p>
        <p>
          <strong>Operator:</strong> {batch.createdBy}
        </p>
        <p>
          <strong>Package:</strong> {batch.packageInfo.packageType} (
          {batch.packageInfo.packageSize})
        </p>
      </div>
    </div>
  );

  const renderBatchDetails = () => {
    if (!selectedBatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Batch Details
                </h3>
                <p className="text-sm text-gray-600">
                  Code: {selectedBatch.batchCode}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Icon path={mdiEye} size={1.5} />
              </button>
            </div>

            {/* Batch Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Basic Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Status:</strong> {selectedBatch.status}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {selectedBatch.createdAt.toLocaleString()}
                  </p>
                  <p>
                    <strong>Operator:</strong> {selectedBatch.createdBy}
                  </p>
                  <p>
                    <strong>Tools:</strong> {selectedBatch.tools.length}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">
                  Package Information
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Type:</strong>{' '}
                    {selectedBatch.packageInfo.packageType}
                  </p>
                  <p>
                    <strong>Size:</strong>{' '}
                    {selectedBatch.packageInfo.packageSize}
                  </p>
                  {selectedBatch.packageInfo.notes && (
                    <p>
                      <strong>Notes:</strong> {selectedBatch.packageInfo.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">Update Status</h4>
              <div className="flex space-x-2">
                {selectedBatch.status === 'ready' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedBatch.id, 'in_autoclave')
                    }
                    className="px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Start Autoclave
                  </button>
                )}
                {selectedBatch.status === 'in_autoclave' && (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedBatch.id, 'completed')
                      }
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedBatch.id, 'failed')
                      }
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Mark Failed
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Audit Trail</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedBatch.auditTrail.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          {event.action}
                        </p>
                        <p className="text-sm text-gray-600">{event.details}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Operator: {event.operator}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Batch Tracking</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              activeTab === 'current'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === 'current' ? (
        <div className="space-y-6">
          {/* Ready for Autoclave */}
          {readyBatches.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-green-800 mb-3 flex items-center">
                <Icon path={mdiPackage} size={1} className="mr-2" />
                Ready for Autoclave ({readyBatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readyBatches.map(renderBatchCard)}
              </div>
            </div>
          )}

          {/* In Autoclave */}
          {inAutoclaveBatches.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-orange-800 mb-3 flex items-center">
                <Icon path={mdiClock} size={1} className="mr-2" />
                In Autoclave ({inAutoclaveBatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inAutoclaveBatches.map(renderBatchCard)}
              </div>
            </div>
          )}

          {/* Failed Batches */}
          {failedBatches.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-red-800 mb-3 flex items-center">
                <Icon path={mdiAlert} size={1} className="mr-2" />
                Failed Batches ({failedBatches.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {failedBatches.map(renderBatchCard)}
              </div>
            </div>
          )}

          {readyBatches.length === 0 &&
            inAutoclaveBatches.length === 0 &&
            failedBatches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon
                  path={mdiPackage}
                  size={2}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p>No active batches</p>
                <p className="text-sm">
                  Start a packaging workflow to create batches
                </p>
              </div>
            )}
        </div>
      ) : (
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
            <Icon path={mdiHistory} size={1} className="mr-2" />
            Batch History ({batchHistory.length})
          </h3>
          {batchHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchHistory.map(renderBatchCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiHistory}
                size={2}
                className="mx-auto mb-2 text-gray-300"
              />
              <p>No batch history</p>
              <p className="text-sm">Completed batches will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Batch Details Modal */}
      {renderBatchDetails()}
    </div>
  );
}
