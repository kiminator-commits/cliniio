import React, { useState } from 'react';
import Icon from '@mdi/react';
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
} from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';

const CleaningLogTracker: React.FC = () => {
  const { cycles, biTestResults } = useSterilizationStore();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Filter cycles based on status and date
  const filteredCycles = cycles.filter(cycle => {
    const statusMatch = filterStatus === 'all' || cycle.status === filterStatus;
    const dateMatch =
      !filterDate || cycle.startTime.toDateString() === new Date(filterDate).toDateString();
    return statusMatch && dateMatch;
  });

  const formatDuration = (startTime: Date, endTime: Date | null): string => {
    if (!endTime) return 'In Progress';
    const duration = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
          <Icon path={mdiFileDocument} size={1.2} className="text-[#4ECDC4] mr-2" />
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
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status Filter
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'all' | 'completed' | 'failed')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Date Filter
          </label>
          <input
            id="date-filter"
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
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
              <p className="text-sm font-medium text-blue-600">Total Cycles</p>
              <p className="text-2xl font-bold text-blue-800">{filteredCycles.length}</p>
            </div>
            <Icon path={mdiFileDocument} size={1.5} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-800">
                {filteredCycles.filter(c => c.status === 'completed').length}
              </p>
            </div>
            <Icon path={mdiCheckCircle} size={1.5} className="text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-800">
                {filteredCycles.filter(c => c.status === 'failed').length}
              </p>
            </div>
            <Icon path={mdiAlertCircle} size={1.5} className="text-red-500" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Tools</p>
              <p className="text-2xl font-bold text-purple-800">
                {filteredCycles.reduce((acc, cycle) => acc + cycle.tools.length, 0)}
              </p>
            </div>
            <Icon path={mdiTools} size={1.5} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Cycles List */}
      <div className="space-y-4">
        {filteredCycles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon path={mdiFileDocument} size={3} className="mx-auto mb-2 text-gray-300" />
            <p>No cycles found matching the current filters</p>
          </div>
        ) : (
          filteredCycles.map(cycle => {
            return (
              <div
                key={cycle.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800">Cycle {cycle.id}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}
                    >
                      {cycle.status.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCycle(selectedCycle === cycle.id ? null : cycle.id)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Icon path={mdiEye} size={1} />
                    {selectedCycle === cycle.id ? 'Hide' : 'View'} Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Icon path={mdiCalendar} size={1} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {cycle.startTime.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon path={mdiClock} size={1} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDuration(cycle.startTime, cycle.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon path={mdiAccount} size={1} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{cycle.operator}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon path={mdiTools} size={1} className="text-gray-500" />
                    <span className="text-sm text-gray-600">{cycle.tools.length} tools</span>
                  </div>
                </div>

                {/* BI Status Summary */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon path={mdiTestTube} size={1} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">BI Test Result:</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {biTestResults.length > 0 ? (
                    biTestResults
                      .filter(result => {
                        const cycleDate = new Date(cycle.startTime);
                        const testDate = new Date(result.date);
                        return testDate.toDateString() === cycleDate.toDateString();
                      })
                      .map((test, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${
                              test.result === 'pass'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {test.result.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {test.date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-gray-500">by {test.operator}</span>
                        </div>
                      ))
                  ) : (
                    <span className="text-xs text-gray-500">No BI test recorded</span>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedCycle === cycle.id && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Phase Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      {cycle.phases.map(phase => (
                        <div key={phase.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">{phase.name}</span>
                            <span
                              className={`px-1 py-0.5 rounded text-xs ${getStatusColor(phase.status)}`}
                            >
                              {phase.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>Duration: {phase.duration} min</div>
                            <div>Tools: {phase.tools.length}</div>
                            {phase.temperature && <div>Temp: {phase.temperature}°C</div>}
                            {phase.pressure && <div>Pressure: {phase.pressure} PSI</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tools in Cycle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cycle.tools.map(tool => (
                        <div key={tool.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">{tool.name}</span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Barcode: {tool.barcode}</div>
                            <div>Phase: {tool.currentPhase}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {cycle.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes</h4>
                        <p className="text-sm text-yellow-700">{cycle.notes}</p>
                      </div>
                    )}
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
