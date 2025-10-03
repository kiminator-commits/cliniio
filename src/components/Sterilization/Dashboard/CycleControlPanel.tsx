import React, { memo } from 'react';
import Icon from '@mdi/react';
import { mdiAlert, mdiPlay } from '@mdi/js';

interface PhaseStatus {
  id: string;
  name: string;
  statusColor: string;
  toolCount: number;
}

interface CycleControlPanelProps {
  shouldShowNoCycleMessage: boolean;
  shouldShowActiveCycleInfo: boolean;
  currentCycle?: {
    id: string;
    startTime: Date;
    phases: Array<{
      id: string;
      name: string;
      isActive: boolean;
      status: string;
    }>;
  };
  cycleProgressInfo?: {
    phaseStatuses: PhaseStatus[];
  };
}

/**
 * CycleControlPanel component for displaying cycle control information and progress.
 * Shows active cycle details, phase statuses, and no-cycle message when appropriate.
 */
export const CycleControlPanel: React.FC<CycleControlPanelProps> = memo(
  ({
    shouldShowNoCycleMessage,
    shouldShowActiveCycleInfo,
    currentCycle,
    cycleProgressInfo,
  }) => {
    return (
      <div
        className="bg-white rounded-lg shadow p-6"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Cycle Control</h2>
        </div>

        {shouldShowNoCycleMessage ? (
          <div className="text-center py-6">
            <div className="mb-3">
              <Icon
                path={mdiAlert}
                size={2.5}
                className="text-gray-400 mx-auto"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No Active Cycle
            </h3>
            <p className="text-gray-500 mb-3">
              Start a new sterilization cycle to begin processing tools
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Phase Banner */}
            {currentCycle?.phases?.some((phase) => phase.isActive) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon path={mdiPlay} size={1.2} className="text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-800">
                      🚀 TESTING: ACTIVE PHASE RUNNING!
                    </h3>
                    <p className="text-sm text-blue-600">
                      {
                        currentCycle.phases.find((phase) => phase.isActive)
                          ?.name
                      }{' '}
                      is currently in progress. Check the "Phase Timers" tab to
                      monitor progress.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Only show Active Cycle info if there's an active phase */}
            {shouldShowActiveCycleInfo && currentCycle && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">
                    Active Cycle: {currentCycle.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Started: {currentCycle.startTime.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Cycle Progress */}
            {cycleProgressInfo && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {cycleProgressInfo.phaseStatuses.map((phase) => (
                  <div
                    key={phase.id}
                    className="text-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mx-auto mb-1 ${phase.statusColor}`}
                    ></div>
                    <p className="text-sm font-medium text-gray-800">
                      {phase.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {phase.toolCount} tools
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CycleControlPanel.displayName = 'CycleControlPanel';
