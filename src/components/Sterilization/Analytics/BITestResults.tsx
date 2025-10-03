import React from 'react';
import Icon from '@mdi/react';
import {
  mdiTestTube,
  mdiCalendar,
  mdiCheckCircle,
  mdiAlertCircle,
} from '@mdi/js';
import { formatBIDueDate } from '../../../utils/calculateNextBIDue';
import { BITestResult } from '../../../store/slices/types/biWorkflowTypes';

interface BITestResultsProps {
  recentTests: BITestResult[];
  nextTestDue: Date | null;
}

/**
 * BITestResults component for displaying biological indicator test information.
 * Shows recent test results and next test scheduling.
 */
export const BITestResults: React.FC<BITestResultsProps> = ({
  recentTests,
  nextTestDue,
}) => {
  const getBiStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      case 'skip':
        return 'text-gray-600';
      case 'in-progress':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBiStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return mdiCheckCircle;
      case 'fail':
        return mdiAlertCircle;
      case 'skip':
        return mdiTestTube;
      case 'in-progress':
        return mdiTestTube;
      default:
        return mdiTestTube;
    }
  };

  return (
    <div
      className="bg-gray-50 rounded-lg p-4"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiTestTube} size={1} className="text-orange-600" />
        BI Test Results
      </h3>

      {/* Next Test Due */}
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Icon path={mdiCalendar} size={0.8} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Next Test Due
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {nextTestDue ? formatBIDueDate(nextTestDue) : 'Not scheduled'}
        </p>
        {nextTestDue && (
          <p className="text-xs text-gray-500">
            {nextTestDue.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Recent Results */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Recent Results</h4>
        {recentTests.length > 0 ? (
          recentTests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Icon
                  path={getBiStatusIcon(test.status)}
                  size={0.8}
                  className={getBiStatusColor(test.status)}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {test.status.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {test.date.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">Tool {test.toolId}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Icon
              path={mdiTestTube}
              size={1.5}
              className="mx-auto mb-2 opacity-50"
            />
            <p className="text-sm">No recent BI tests</p>
          </div>
        )}
      </div>
    </div>
  );
};
