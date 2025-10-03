import React, { useState } from 'react';
import Icon from '@mdi/react';
import { ToolStatus } from '@/types/toolTypes';
import {
  mdiFileDocument,
  mdiCalendar,
  mdiClock,
  mdiAccount,
  mdiTools,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiDownload,
  mdiEye,
  mdiTestTube,
  mdiLoading,
} from '@mdi/js';
import { useCleaningLogLogic } from './hooks/useCleaningLogLogic';

const CleaningLogTracker: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ToolStatus>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Business logic separated into hook
  const {
    filteredLogs,
    stats,
    loading,
    error,
    getStatusColor,
    formatDuration,
    getBITestResultsForCycle,
    getBITestResultColor,
    formatTestTime,
    getCleaningTypeDisplayName,
    getQualityScoreDisplay,
    getComplianceScoreDisplay,
  } = useCleaningLogLogic({ filterStatus, filterDate });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Icon
            path={mdiLoading}
            size={2}
            className="animate-spin text-[#4ECDC4] mr-3"
          />
          <span className="text-gray-600">Loading cleaning logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Icon path={mdiAlertCircle} size={2} className="text-red-500 mr-3" />
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
          <Icon
            path={mdiFileDocument}
            size={1.2}
            className="text-[#4ECDC4] mr-2"
          />
          Cleaning Log Tracker
        </h2>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Icon path={mdiDownload} size={1} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
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
              setFilterStatus(e.target.value as 'all' | ToolStatus)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="dirty">Dirty</option>
            <option value="clean">Clean</option>
            <option value="problem">Problem</option>
            <option value="new_barcode">New Barcode</option>
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
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterDate('');
            }}
            className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Cleanings
              </p>
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
              <p className="text-sm font-medium text-purple-600">Total Rooms</p>
              <p className="text-2xl font-bold text-purple-800">
                {stats.totalTools}
              </p>
            </div>
            <Icon path={mdiTools} size={1.5} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Cleaning Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No cleaning logs found for the selected filters.
          </div>
        ) : (
          filteredLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {log.room_name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getCleaningTypeDisplayName(log.cleaning_type)}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedLog(selectedLog === log.id ? null : log.id)
                    }
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Icon path={mdiEye} size={1} />
                    {selectedLog === log.id ? 'Hide' : 'View'} Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Icon path={mdiCalendar} size={1} />
                    <span>
                      Scheduled:{' '}
                      {new Date(log.scheduled_time).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon path={mdiClock} size={1} />
                    <span>
                      Duration:{' '}
                      {formatDuration(
                        log.started_time || log.scheduled_time,
                        log.completed_time
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon path={mdiAccount} size={1} />
                    <span>Room ID: {log.room_id}</span>
                  </div>
                </div>

                {selectedLog === log.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          Quality Metrics
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Quality Score:</span>
                            <span className="font-medium">
                              {getQualityScoreDisplay(log.quality_score)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Compliance Score:</span>
                            <span className="font-medium">
                              {getComplianceScoreDisplay(log.compliance_score)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          Timeline
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Scheduled:</span>
                            <span>
                              {new Date(log.scheduled_time).toLocaleString()}
                            </span>
                          </div>
                          {log.started_time && (
                            <div className="flex justify-between">
                              <span>Started:</span>
                              <span>
                                {new Date(log.started_time).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {log.completed_time && (
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span>
                                {new Date(log.completed_time).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BI Test Results for this date */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <Icon path={mdiTestTube} size={1} />
                        BI Test Results
                      </h4>
                      <div className="space-y-2">
                        {getBITestResultsForCycle(log.created_at).map(
                          (result, index) => (
                            <div
                              key={index}
                              className={`px-3 py-2 rounded-lg text-sm ${getBITestResultColor(result.passed ? 'pass' : 'fail')}`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{result.passed ? 'PASS' : 'FAIL'}</span>
                                <span>
                                  {formatTestTime(new Date(result.date))}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                        {getBITestResultsForCycle(log.created_at).length ===
                          0 && (
                          <p className="text-sm text-gray-500">
                            No BI tests for this date
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CleaningLogTracker;
