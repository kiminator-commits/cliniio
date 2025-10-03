import React from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiTimer,
  mdiTools,
  mdiArrowRight,
} from '@mdi/js';
import { SterilizationPhase } from '../../../store/sterilizationStore';
import { PhaseStatusInfo } from '../services/phaseTimerService';

interface PhaseTimerHeaderProps {
  phase: SterilizationPhase;
  isExpanded: boolean;
  timeDisplayText: string;
  statusInfo: PhaseStatusInfo;
  onToggleExpand: () => void;
  onStart?: () => void;
  onMoveToolsToNext?: () => void;
  timer?: {
    isRunning?: boolean;
    timeRemaining?: number;
    elapsedTime?: number;
  } | null;
}

/**
 * PhaseTimerHeader component for the header section of phase timers.
 * Handles expand/collapse, phase name, status, tool count, and timer display.
 */
export const PhaseTimerHeader: React.FC<PhaseTimerHeaderProps> = ({
  phase,
  isExpanded,
  timeDisplayText,
  statusInfo,
  onToggleExpand,
  onMoveToolsToNext,
  timer,
}) => {
  const isTimerComplete = timer && timer.timeRemaining === 0;
  const hasToolsInPhase = phase.tools.length > 0;

  // Show "Move to Next Phase" button when:
  // 1. Timer is complete (timeRemaining === 0) for bath1 and autoclave phases
  // 2. Timer exists for bath2 and drying phases (can be manually completed)
  // 3. There are tools in the phase
  const shouldShowMoveToNextButton =
    hasToolsInPhase &&
    onMoveToolsToNext &&
    ((phase.id === 'bath1' && isTimerComplete) ||
      (phase.id === 'bath2' && timer) ||
      (phase.id === 'drying' && timer) ||
      (phase.id === 'autoclave' && isTimerComplete));

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleExpand}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <Icon
            path={isExpanded ? mdiChevronDown : mdiChevronRight}
            size={1}
            className="text-gray-500"
          />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">{phase.name}</h3>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}
        >
          {statusInfo.text}
        </div>
        {phase.tools.length > 0 && (
          <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
            <Icon path={mdiTools} size={0.9} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              {phase.tools.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Icon path={mdiTimer} size={1} className="text-gray-500" />
        <span className="text-sm text-gray-600">{timeDisplayText}</span>

        {/* Show small next button when timer is complete and tools can be moved */}
        {onMoveToolsToNext &&
          phase.tools.length > 0 &&
          (phase.name === 'bath1' || phase.name === 'autoclave'
            ? timer?.timeRemaining === 0
            : timer && (phase.name === 'bath2' || phase.name === 'drying')) && (
            <button
              onClick={onMoveToolsToNext}
              className="ml-2 p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded transition-colors"
              title="Move tools to next phase"
            >
              <Icon path={mdiArrowRight} size={0.6} />
            </button>
          )}

        {shouldShowMoveToNextButton && (
          <button
            onClick={onMoveToolsToNext}
            className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
          >
            <Icon path={mdiArrowRight} size={0.7} />
            Move Tools to Next Phase
          </button>
        )}
      </div>
    </div>
  );
};
