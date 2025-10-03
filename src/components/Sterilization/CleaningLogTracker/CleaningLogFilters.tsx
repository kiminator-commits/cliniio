import React from 'react';

interface CleaningLogFiltersProps {
  filterStatus: 'all' | 'completed' | 'failed';
  filterDate: string;
  onStatusChange: (status: 'all' | 'completed' | 'failed') => void;
  onDateChange: (date: string) => void;
  onClearFilters: () => void;
}

/**
 * Filters component for the Cleaning Log Tracker.
 * Contains status and date filters with clear functionality.
 */
export const CleaningLogFilters: React.FC<CleaningLogFiltersProps> = ({
  filterStatus,
  filterDate,
  onStatusChange,
  onDateChange,
  onClearFilters,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label
          htmlFor="status-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status Filter
        </label>
        <select
          id="status-filter"
          value={filterStatus}
          onChange={(e) =>
            onStatusChange(e.target.value as 'all' | 'completed' | 'failed')
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="date-filter"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date Filter
        </label>
        <input
          id="date-filter"
          type="date"
          value={filterDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={onClearFilters}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
