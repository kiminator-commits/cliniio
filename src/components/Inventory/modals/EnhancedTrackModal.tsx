import React, { useState } from 'react';
import Icon from '../../Icon/Icon';
import {
  mdiClose,
  mdiCheck,
  mdiEye,
  mdiEyeOff,
} from '@mdi/js';
import { useTrackedTools } from '../../../hooks/inventory/useTrackedTools';
import { useInventoryDataAccess } from '../../../hooks/inventory/useInventoryDataAccess';
import { TrackedToolPriority } from '../../../services/trackedToolsService';
import { getPriorityIcon, getPriorityBadgeColor } from '../../../utils/priorityUtils';

interface EnhancedTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const EnhancedTrackModal: React.FC<EnhancedTrackModalProps> = ({
  isOpen,
  onClose,
  className = '',
}) => {
  const { getAllItems } = useInventoryDataAccess();
  const { trackedTools, trackTool, untrackTool, getPriorityQueue } =
    useTrackedTools();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'tracked' | 'available' | 'unavailable'
  >('all');
  const [selectedPriority, setSelectedPriority] = useState<
    'high' | 'medium' | 'low'
  >('medium');
  const [showPriorityQueue, setShowPriorityQueue] = useState<string | null>(
    null
  );

  // Get all tools and supplies (items that can be tracked)
  const allItems = getAllItems().filter(
    (item) =>
      (item as { data?: { toolId?: string; supplyId?: string } }).data
        ?.toolId ||
      (item as { data?: { toolId?: string; supplyId?: string } }).data?.supplyId // Only tools and supplies can be tracked
  );

  // Filter items based on search and filter
  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.data &&
        typeof item.data === 'object' &&
        'barcode' in item.data &&
        typeof item.data.barcode === 'string' &&
        item.data.barcode) ||
      ''.toLowerCase().includes(searchTerm.toLowerCase());

    const isTracked = trackedTools.some((t) => t.toolId === item.id);
    const isAvailable =
      item.status === 'available' ||
      item.status === 'complete' ||
      item.status === 'clean';

    switch (activeFilter) {
      case 'tracked':
        return matchesSearch && isTracked;
      case 'available':
        return matchesSearch && isAvailable;
      case 'unavailable':
        return matchesSearch && !isAvailable;
      default:
        return matchesSearch;
    }
  });

  // Check if an item is tracked
  const isItemTracked = (itemId: string): boolean => {
    return trackedTools.some((t) => t.toolId === itemId);
  };

  // Get tracking info for an item
  const getTrackingInfo = (itemId: string): TrackedToolPriority | undefined => {
    return trackedTools.find((t) => t.toolId === itemId);
  };

  // Handle track/untrack toggle
  const handleTrackToggle = (itemId: string) => {
    if (isItemTracked(itemId)) {
      untrackTool(itemId);
    } else {
      trackTool(itemId, selectedPriority);
    }
  };

  // Handle priority change
  const handlePriorityChange = (
    itemId: string,
    priority: 'high' | 'medium' | 'low'
  ) => {
    if (isItemTracked(itemId)) {
      // Untrack and retrack with new priority
      untrackTool(itemId);
      trackTool(itemId, priority);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string): string => {
    const normalizedStatus = status.toLowerCase();
    if (['available', 'complete', 'clean'].includes(normalizedStatus)) {
      return 'bg-green-100 text-green-800';
    } else if (
      ['dirty', 'in_cycle', 'bath1', 'bath2', 'airDry', 'autoclave'].includes(
        normalizedStatus
      )
    ) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (
      ['failed', 'problem', 'maintenance'].includes(normalizedStatus)
    ) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Track Tools & Supplies
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <Icon path={mdiClose} size={1.5} />
          </button>
        </div>

        {/* Priority Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Select Priority Level
          </h3>
          <div className="flex gap-3">
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setSelectedPriority(priority)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedPriority === priority
                    ? `${getPriorityBadgeColor(priority)} border-current`
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <Icon path={getPriorityIcon(priority)} size={1} />
                <span className="capitalize font-medium">{priority}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {selectedPriority === 'high' &&
              'High priority: You will be notified immediately when the tool becomes available.'}
            {selectedPriority === 'medium' &&
              'Medium priority: You will be notified when the tool becomes available (default).'}
            {selectedPriority === 'low' &&
              'Low priority: You will be notified when the tool becomes available, but others may have higher priority.'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tools and supplies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'tracked', 'available', 'unavailable'] as const).map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
                    activeFilter === filter
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto max-h-96">
          <div className="grid gap-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icon
                  path={mdiEye}
                  size={3}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p>No items found matching your criteria</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isTracked = isItemTracked(item.id);
                const trackingInfo = getTrackingInfo(item.id);
                const priorityQueue = getPriorityQueue(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isTracked
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-800">
                            {item.name || ''}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {item.category || ''}
                          </span>
                          {item.data &&
                            typeof item.data === 'object' &&
                            'barcode' in item.data &&
                            typeof item.data.barcode === 'string' && (
                              <span className="text-xs text-gray-400 font-mono">
                                {item.data.barcode}
                              </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(item.status || '')}`}
                          >
                            {item.status || ''}
                          </span>
                          {isTracked && trackingInfo && (
                            <span
                              className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getPriorityBadgeColor(trackingInfo.priority)}`}
                            >
                              <Icon
                                path={getPriorityIcon(trackingInfo.priority)}
                                size={0.8}
                              />
                              {trackingInfo.priority}
                            </span>
                          )}
                        </div>

                        {/* Priority Queue */}
                        {isTracked && priorityQueue.length > 1 && (
                          <div className="mt-2">
                            <button
                              onClick={() =>
                                setShowPriorityQueue(
                                  showPriorityQueue === item.id ? null : item.id
                                )
                              }
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Icon
                                path={
                                  showPriorityQueue === item.id
                                    ? mdiEyeOff
                                    : mdiEye
                                }
                                size={0.8}
                              />
                              Show priority queue ({priorityQueue.length}{' '}
                              waiting)
                            </button>
                            {showPriorityQueue === item.id && (
                              <div className="mt-2 p-2 bg-white rounded border text-xs">
                                <div className="font-medium mb-1">
                                  Priority Queue:
                                </div>
                                {priorityQueue.map((tracker, index) => (
                                  <div
                                    key={`${tracker.doctorName}-${tracker.timestamp}`}
                                    className="flex items-center justify-between"
                                  >
                                    <span
                                      className={
                                        index === 0
                                          ? 'font-medium text-green-600'
                                          : 'text-gray-600'
                                      }
                                    >
                                      {index + 1}. {tracker.doctorName}
                                    </span>
                                    <span
                                      className={`px-1 py-0.5 rounded text-xs ${getPriorityBadgeColor(tracker.priority)}`}
                                    >
                                      {tracker.priority}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {isTracked ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleTrackToggle(item.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                            >
                              Untrack
                            </button>
                            {trackingInfo && (
                              <select
                                value={trackingInfo.priority}
                                onChange={(e) =>
                                  handlePriorityChange(
                                    item.id,
                                    e.target.value as 'high' | 'medium' | 'low'
                                  )
                                }
                                className="px-2 py-1 text-xs border rounded focus:outline-none"
                              >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                              </select>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTrackToggle(item.id)}
                            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Icon path={mdiCheck} size={1} />
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {trackedTools.length} item{trackedTools.length !== 1 ? 's' : ''}{' '}
            currently tracked
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTrackModal;
