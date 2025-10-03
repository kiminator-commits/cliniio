import React from 'react';
import Icon from '@mdi/react';
import { mdiChartLine } from '@mdi/js';

/**
 * PerformanceChart component for displaying performance trends and analytics.
 * Currently shows a placeholder for future chart implementation.
 */
export const PerformanceChart: React.FC = () => {
  return (
    <div
      className="mt-6 bg-gray-50 rounded-lg p-4"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Performance Trends
      </h3>
      <div className="h-32 bg-white rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Icon path={mdiChartLine} size={2} className="mx-auto mb-2" />
          <p className="text-sm">Performance chart will be displayed here</p>
        </div>
      </div>
    </div>
  );
};
