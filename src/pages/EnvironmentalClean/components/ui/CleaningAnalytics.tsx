import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar, mdiRefresh } from '@mdi/js';
import { UI_CONSTANTS } from '../../constants';
import { useEnvironmentalCleanAnalytics } from '../../hooks/useEnvironmentalCleanAnalytics';

export const CleaningAnalytics: React.FC = () => {
  const { analytics, isLoading, error, refreshAnalytics } =
    useEnvironmentalCleanAnalytics();

  if (isLoading) {
    return (
      <div
        id="cleaning-analytics"
        className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6"
        style={{ borderLeft: `4px solid ${UI_CONSTANTS.borderLeftColor}` }}
        role="region"
        aria-label="Cleaning analytics summary"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
            <Icon
              path={mdiChartBar}
              size={1.1}
              color={UI_CONSTANTS.primaryIconColor}
              className="mr-2"
            />
            Cleaning Analytics
          </h2>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gray-100 rounded-lg text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="p-2 bg-gray-100 rounded-lg text-center">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        id="cleaning-analytics"
        className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6"
        style={{ borderLeft: `4px solid ${UI_CONSTANTS.borderLeftColor}` }}
        role="region"
        aria-label="Cleaning analytics summary"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
            <Icon
              path={mdiChartBar}
              size={1.1}
              color={UI_CONSTANTS.primaryIconColor}
              className="mr-2"
            />
            Cleaning Analytics
          </h2>
          <button
            onClick={refreshAnalytics}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh analytics"
          >
            <Icon path={mdiRefresh} size={0.8} className="text-gray-600" />
          </button>
        </div>
        <div className="text-red-600 text-sm text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div
      id="cleaning-analytics"
      className="bg-white p-3 md:p-4 rounded-xl shadow-lg mb-6"
      style={{ borderLeft: `4px solid ${UI_CONSTANTS.borderLeftColor}` }}
      role="region"
      aria-label="Cleaning analytics summary"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-[#5b5b5b] flex items-center">
          <Icon
            path={mdiChartBar}
            size={1.1}
            color={UI_CONSTANTS.primaryIconColor}
            className="mr-2"
          />
          Cleaning Analytics
        </h2>
        <button
          onClick={refreshAnalytics}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refresh analytics"
        >
          <Icon path={mdiRefresh} size={0.8} className="text-gray-600" />
        </button>
      </div>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Analytics metrics"
      >
        <div
          className="p-2 bg-green-100 rounded-lg text-center"
          role="status"
          aria-label={`Clean rooms: ${analytics.cleanRooms}`}
        >
          <h3 className="text-sm text-green-700 font-medium mb-1">
            Clean Rooms
          </h3>
          <p className="text-xl font-bold text-green-700">
            {analytics.cleanRooms}
          </p>
        </div>
        <div
          className="p-2 bg-orange-100 rounded-lg text-center"
          role="status"
          aria-label={`Dirty rooms: ${analytics.dirtyRooms}`}
        >
          <h3 className="text-sm text-orange-700 font-medium mb-1">
            Dirty Rooms
          </h3>
          <p className="text-xl font-bold text-orange-700">
            {analytics.dirtyRooms}
          </p>
        </div>
        <div
          className="p-2 bg-purple-100 rounded-lg text-center"
          role="status"
          aria-label={`Efficiency: ${analytics.cleaningEfficiency}%`}
        >
          <h3 className="text-sm text-purple-700 font-medium mb-1">
            Efficiency
          </h3>
          <p className="text-xl font-bold text-purple-700">
            {analytics.cleaningEfficiency}%
          </p>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Last updated: {new Date(analytics.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default CleaningAnalytics;
