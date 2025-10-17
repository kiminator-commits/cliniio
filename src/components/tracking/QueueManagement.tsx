import React, { useState } from 'react';
import { useTrackedTools } from '../../hooks/inventory/useTrackedTools';
import Icon from '@mdi/react';
import {
  mdiAccountGroup,
  mdiClock as _mdiClock,
  mdiAlertCircle,
  mdiPauseCircle,
  mdiCheckCircle,
  mdiEye,
  mdiEyeOff,
  mdiSortAscending,
  mdiSortDescending,
} from '@mdi/js';

interface QueueManagementProps {
  className?: string;
}

export const QueueManagement: React.FC<QueueManagementProps> = ({
  className = '',
}) => {
  const {
    trackedTools,
    getToolTrackers,
    untrackTool,
    isToolTracked: _isToolTracked,
  } = useTrackedTools();

  const [sortBy, setSortBy] = useState<'priority' | 'timestamp' | 'tool'>(
    'priority'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');

  // Get all unique tools being tracked
  const uniqueTools = Array.from(
    new Set(trackedTools.map((tool) => tool.toolId))
  ).map((toolId) => {
    const trackers = getToolTrackers(toolId);
    const _firstTracker = trackers[0];
    return {
      toolId,
      toolName: `Tool ${toolId.slice(0, 8)}...`, // Simplified for demo
      trackers,
      totalTrackers: trackers.length,
    };
  });

  // Sort tools based on selected criteria
  const sortedTools = uniqueTools.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'priority': {
        const priorityRank = { high: 3, medium: 2, low: 1 };
        const aMaxPriority = Math.max(
          ...a.trackers.map((t) => priorityRank[t.priority])
        );
        const bMaxPriority = Math.max(
          ...b.trackers.map((t) => priorityRank[t.priority])
        );
        comparison = aMaxPriority - bMaxPriority;
        break;
      }
      case 'timestamp': {
        const aLatest = Math.max(
          ...a.trackers.map((t) => new Date(t.timestamp).getTime())
        );
        const bLatest = Math.max(
          ...b.trackers.map((t) => new Date(t.timestamp).getTime())
        );
        comparison = aLatest - bLatest;
        break;
      }
      case 'tool':
        comparison = a.toolName.localeCompare(b.toolName);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter by priority
  const filteredTools =
    filterPriority === 'all'
      ? sortedTools
      : sortedTools.filter((tool) =>
          tool.trackers.some((tracker) => tracker.priority === filterPriority)
        );

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return mdiAlertCircle;
      case 'medium':
        return mdiPauseCircle;
      case 'low':
        return mdiCheckCircle;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
    }
  };

  const getPriorityBgColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
    }
  };

  const handleUntrack = (toolId: string, _doctorName: string) => {
    untrackTool(toolId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon
            path={mdiAccountGroup}
            size={1.2}
            className="mr-2 text-blue-500"
          />
          Queue Management
        </h3>
        <div className="text-sm text-gray-500">
          {filteredTools.length} tools being tracked
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'priority' | 'timestamp' | 'tool')
            }
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="priority">Priority</option>
            <option value="timestamp">Time</option>
            <option value="tool">Tool Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-gray-500 hover:text-gray-700"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <Icon
              path={sortOrder === 'asc' ? mdiSortAscending : mdiSortDescending}
              size={1}
            />
          </button>
        </div>

        {/* Filter by Priority */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Filter:</span>
          <select
            value={filterPriority}
            onChange={(e) =>
              setFilterPriority(
                e.target.value as 'all' | 'high' | 'medium' | 'low'
              )
            }
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {filteredTools.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon
              path={mdiAccountGroup}
              size={2}
              className="mx-auto mb-2 text-gray-300"
            />
            <p>No tools currently being tracked</p>
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.toolId}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{tool.toolName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {tool.totalTrackers}{' '}
                    {tool.totalTrackers === 1 ? 'tracker' : 'trackers'}
                  </span>
                  <Icon path={mdiEye} size={1} className="text-gray-400" />
                </div>
              </div>

              {/* Trackers List */}
              <div className="space-y-2">
                {tool.trackers
                  .sort((a, b) => {
                    const priorityRank = { high: 3, medium: 2, low: 1 };
                    const priorityDiff =
                      priorityRank[b.priority] - priorityRank[a.priority];
                    if (priorityDiff !== 0) return priorityDiff;
                    return (
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime()
                    );
                  })
                  .map((tracker, index) => {
                    const position = index + 1;
                    const isCurrentUser = tracker.doctorName === 'Test Doctor'; // Simplified for demo

                    return (
                      <div
                        key={`${tool.toolId}-${tracker.doctorName}`}
                        className={`${getPriorityBgColor(tracker.priority)} border rounded-lg p-3 flex items-center justify-between`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Position */}
                          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-2 border-gray-300">
                            <span className="text-sm font-bold text-gray-700">
                              #{position}
                            </span>
                          </div>

                          {/* Priority Icon */}
                          <Icon
                            path={getPriorityIcon(tracker.priority)}
                            size={1.2}
                            className={getPriorityColor(tracker.priority)}
                          />

                          {/* Doctor Info */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {tracker.doctorName}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(tracker.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${
                              tracker.status === 'waiting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : tracker.status === 'notified'
                                  ? 'bg-blue-100 text-blue-800'
                                  : tracker.status === 'claimed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tracker.status}
                          </span>

                          {isCurrentUser && (
                            <button
                              onClick={() =>
                                handleUntrack(tool.toolId, tracker.doctorName)
                              }
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Stop tracking"
                            >
                              <Icon path={mdiEyeOff} size={1} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
