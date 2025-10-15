import React from 'react';
import { useTrackedTools } from '../../hooks/inventory/useTrackedTools';
import Icon from '@mdi/react';
import {
  mdiEye,
  mdiClock,
  mdiAccountGroup,
  mdiToolbox,
  mdiTrendingUp,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiPauseCircle,
} from '@mdi/js';

interface TrackingStatsDashboardProps {
  className?: string;
}

export const TrackingStatsDashboard: React.FC<TrackingStatsDashboardProps> = ({
  className = '',
}) => {
  const {
    trackingStats,
    trackedTools,
    pendingNotifications,
    getToolTrackers,
    isToolTracked: _isToolTracked,
  } = useTrackedTools();

  // Calculate additional metrics
  const totalToolsTracked = trackedTools.length;
  const toolsWithNotifications = pendingNotifications.length;
  const averageQueueLength =
    trackedTools.length > 0
      ? trackedTools.reduce((sum, tool) => {
          const trackers = getToolTrackers(tool.toolId);
          return sum + trackers.length;
        }, 0) / trackedTools.length
      : 0;

  const stats = [
    {
      title: 'Total Tracked',
      value: totalToolsTracked,
      icon: mdiEye,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
    },
    {
      title: 'High Priority',
      value: trackingStats.highPriority,
      icon: mdiAlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconColor: 'text-red-500',
    },
    {
      title: 'Medium Priority',
      value: trackingStats.mediumPriority,
      icon: mdiPauseCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconColor: 'text-yellow-500',
    },
    {
      title: 'Low Priority',
      value: trackingStats.lowPriority,
      icon: mdiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconColor: 'text-green-500',
    },
    {
      title: 'Pending Notifications',
      value: toolsWithNotifications,
      icon: mdiClock,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Avg Queue Length',
      value: averageQueueLength.toFixed(1),
      icon: mdiAccountGroup,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      iconColor: 'text-indigo-500',
    },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon
            path={mdiTrendingUp}
            size={1.2}
            className="mr-2 text-blue-500"
          />
          Tracking Statistics
        </h3>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg p-4`}>
            <div className="flex items-center">
              <Icon
                path={stat.icon}
                size={1.5}
                className={`${stat.iconColor} mr-3`}
              />
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Distribution Chart */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Priority Distribution
        </h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">High Priority</span>
            <span className="text-sm font-medium text-gray-900">
              {trackingStats.highPriority}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: `${totalToolsTracked > 0 ? (trackingStats.highPriority / totalToolsTracked) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Medium Priority</span>
            <span className="text-sm font-medium text-gray-900">
              {trackingStats.mediumPriority}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{
                width: `${totalToolsTracked > 0 ? (trackingStats.mediumPriority / totalToolsTracked) * 100 : 0}%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Low Priority</span>
            <span className="text-sm font-medium text-gray-900">
              {trackingStats.lowPriority}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${totalToolsTracked > 0 ? (trackingStats.lowPriority / totalToolsTracked) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Recent Activity
        </h4>
        <div className="space-y-2">
          {trackedTools.slice(0, 5).map((tool, _index) => {
            const trackers = getToolTrackers(tool.toolId);
            const queueLength = trackers.length;

            return (
              <div
                key={tool.toolId}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <Icon
                    path={
                      tool.priority === 'high'
                        ? mdiAlertCircle
                        : tool.priority === 'medium'
                          ? mdiPauseCircle
                          : mdiCheckCircle
                    }
                    size={1}
                    className={`mr-3 ${
                      tool.priority === 'high'
                        ? 'text-red-500'
                        : tool.priority === 'medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Tool {tool.toolId.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-gray-500 ml-2 capitalize">
                      {tool.priority} priority
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {queueLength} in queue
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      tool.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : tool.status === 'notified'
                          ? 'bg-blue-100 text-blue-800'
                          : tool.status === 'claimed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {tool.status}
                  </span>
                </div>
              </div>
            );
          })}

          {trackedTools.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiToolbox}
                size={2}
                className="mx-auto mb-2 text-gray-300"
              />
              <p>No tools currently being tracked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
