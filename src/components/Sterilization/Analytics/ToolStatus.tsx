import React from 'react';
import Icon from '@mdi/react';
import { mdiTools, mdiThermometer, mdiCheckCircle } from '@mdi/js';

interface ToolStatusProps {
  totalTools: number;
  activeTools: number;
  completedToday: number;
}

/**
 * ToolStatus component for displaying tool inventory and status metrics.
 * Shows total tools, active tools in cycle, and completed tools for the day.
 */
export const ToolStatus: React.FC<ToolStatusProps> = ({
  totalTools,
  activeTools,
  completedToday,
}) => {
  return (
    <div
      className="bg-gray-50 rounded-lg p-4"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tool Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Icon path={mdiTools} size={1} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">Total Tools</p>
              <p className="text-xs text-gray-500">In system</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {totalTools}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Icon path={mdiThermometer} size={1} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">In Cycle</p>
              <p className="text-xs text-gray-500">Currently processing</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-blue-600">
            {activeTools}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Icon path={mdiCheckCircle} size={1} className="text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Completed Today
              </p>
              <p className="text-xs text-gray-500">Sterilized tools</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-green-600">
            {completedToday}
          </span>
        </div>
      </div>
    </div>
  );
};
