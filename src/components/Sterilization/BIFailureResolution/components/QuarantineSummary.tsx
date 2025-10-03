import React from 'react';
import Icon from '@mdi/react';
import { mdiPackage, mdiRefresh, mdiCalendarAlert } from '@mdi/js';
import { QuarantineData } from '../hooks/useQuarantineData';

interface QuarantineSummaryProps {
  quarantineData: QuarantineData;
}

export const QuarantineSummary: React.FC<QuarantineSummaryProps> = ({
  quarantineData,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiPackage} size={1} className="text-gray-600" />
        <h3 className="font-medium text-gray-800">Quarantine Summary</h3>
      </div>

      {/* Last Passed Test Info */}
      {quarantineData.lastPassedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon path={mdiRefresh} size={0.8} className="text-blue-600" />
            <h4 className="font-medium text-blue-800 text-sm">
              Last Successful BI Test
            </h4>
          </div>
          <p className="text-xs text-blue-700">
            <strong>Date:</strong>{' '}
            {quarantineData.lastPassedDate.toLocaleDateString()} at{' '}
            {quarantineData.lastPassedDate.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {quarantineData.totalToolsAffected}
          </div>
          <div className="text-gray-600">Tools Affected</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {quarantineData.totalCyclesAffected}
          </div>
          <div className="text-gray-600">Cycles Affected</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {quarantineData.uniqueOperators.length}
          </div>
          <div className="text-gray-600">Operators Involved</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {quarantineData.hasCurrentCycleAffected ? 'Yes' : 'No'}
          </div>
          <div className="text-gray-600">Current Cycle Affected</div>
        </div>
      </div>

      {/* Date Range */}
      {quarantineData.dateRange && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon
              path={mdiCalendarAlert}
              size={0.8}
              className="text-yellow-600"
            />
            <h4 className="font-medium text-yellow-800 text-sm">
              Affected Date Range
            </h4>
          </div>
          <p className="text-xs text-yellow-700">
            <strong>From:</strong>{' '}
            {quarantineData.dateRange.start.toLocaleDateString()}{' '}
            <strong>To:</strong>{' '}
            {quarantineData.dateRange.end.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Tools by Category */}
      {Object.keys(quarantineData.toolsByCategory).length > 0 && (
        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Tools by Category:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {Object.entries(quarantineData.toolsByCategory).map(
              ([category, count]) => (
                <div
                  key={category}
                  className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded"
                >
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold text-gray-800">{count}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
