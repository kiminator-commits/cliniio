import React from 'react';
import Icon from '@mdi/react';
import {
  mdiFileDocument,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiTools,
} from '@mdi/js';

interface CycleStats {
  totalCycles: number;
  completed: number;
  failed: number;
  totalTools: number;
}

interface CleaningLogStatsProps {
  stats: CycleStats;
}

/**
 * Stats component for the Cleaning Log Tracker.
 * Displays summary statistics for cycles and tools.
 */
export const CleaningLogStats: React.FC<CleaningLogStatsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Total Cycles</p>
            <p className="text-2xl font-bold text-blue-800">
              {stats.totalCycles}
            </p>
          </div>
          <Icon path={mdiFileDocument} size={1.5} className="text-blue-500" />
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Completed</p>
            <p className="text-2xl font-bold text-green-800">
              {stats.completed}
            </p>
          </div>
          <Icon path={mdiCheckCircle} size={1.5} className="text-green-500" />
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Failed</p>
            <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
          </div>
          <Icon path={mdiAlertCircle} size={1.5} className="text-red-500" />
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Total Tools</p>
            <p className="text-2xl font-bold text-purple-800">
              {stats.totalTools}
            </p>
          </div>
          <Icon path={mdiTools} size={1.5} className="text-purple-500" />
        </div>
      </div>
    </div>
  );
};
