import React from 'react';
import { useTrackingAnalytics } from '../../hooks/analytics/useTrackingAnalytics';
import Icon from '@mdi/react';
import {
  mdiChartLine,
  mdiClock,
  mdiAccountGroup,
  mdiToolbox,
  mdiTrendingUp,
} from '@mdi/js';

interface TrackingAnalyticsCardProps {
  className?: string;
}

export const TrackingAnalyticsCard: React.FC<TrackingAnalyticsCardProps> = ({
  className = '',
}) => {
  const { analyticsSummary, isLoading, refreshAnalytics } =
    useTrackingAnalytics();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsSummary) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Icon path={mdiChartLine} size={1.2} className="mr-2 text-blue-500" />
          Tool Tracking Analytics
        </h3>
        <p className="text-gray-500">No analytics data available yet.</p>
      </div>
    );
  }

  const {
    totalTrackingEvents,
    uniqueToolsTracked,
    uniqueUsersTracking,
    averageQueueWaitTime,
    mostTrackedTools,
    trackingByPriority,
    trackingByHour,
    trackingByDay,
  } = analyticsSummary;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Icon path={mdiChartLine} size={1.2} className="mr-2 text-blue-500" />
          Tool Tracking Analytics
        </h3>
        <button
          onClick={refreshAnalytics}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Icon
              path={mdiTrendingUp}
              size={1.5}
              className="text-blue-500 mr-2"
            />
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalTrackingEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Icon
              path={mdiToolbox}
              size={1.5}
              className="text-green-500 mr-2"
            />
            <div>
              <p className="text-sm text-gray-600">Tools Tracked</p>
              <p className="text-2xl font-bold text-green-600">
                {uniqueToolsTracked}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Icon
              path={mdiAccountGroup}
              size={1.5}
              className="text-purple-500 mr-2"
            />
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {uniqueUsersTracking}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <Icon path={mdiClock} size={1.5} className="text-orange-500 mr-2" />
            <div>
              <p className="text-sm text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-orange-600">
                {averageQueueWaitTime.toFixed(1)}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Tracking by Priority
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">High Priority</p>
            <p className="text-xl font-bold text-red-600">
              {trackingByPriority.high}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Medium Priority</p>
            <p className="text-xl font-bold text-yellow-600">
              {trackingByPriority.medium}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Low Priority</p>
            <p className="text-xl font-bold text-gray-600">
              {trackingByPriority.low}
            </p>
          </div>
        </div>
      </div>

      {/* Most Tracked Tools */}
      {mostTrackedTools.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Most Tracked Tools
          </h4>
          <div className="space-y-2">
            {mostTrackedTools.slice(0, 5).map((tool, index) => (
              <div
                key={tool.toolId}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full mr-3">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {tool.toolName}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {tool.trackingCount} tracks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity by Hour */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Activity by Hour
        </h4>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
          {trackingByHour.map((hourData, index) => (
            <div key={index} className="text-center">
              <div
                className="bg-blue-100 rounded-sm h-8 flex items-end justify-center"
                style={{
                  height: `${Math.max(8, (hourData.count / Math.max(...trackingByHour.map((h) => h.count))) * 32)}px`,
                }}
              >
                {hourData.count > 0 && (
                  <span className="text-xs text-blue-800 font-medium">
                    {hourData.count}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {hourData.hour}:00
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Recent Activity (Last 7 Days)
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {trackingByDay.slice(-7).map((dayData, index) => (
            <div key={index} className="text-center">
              <div
                className="bg-green-100 rounded-sm h-6 flex items-end justify-center"
                style={{
                  height: `${Math.max(6, (dayData.count / Math.max(...trackingByDay.slice(-7).map((d) => d.count))) * 24)}px`,
                }}
              >
                {dayData.count > 0 && (
                  <span className="text-xs text-green-800 font-medium">
                    {dayData.count}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(dayData.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
