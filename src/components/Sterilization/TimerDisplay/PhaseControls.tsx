import React from 'react';
import Icon from '@mdi/react';
import { mdiPlay, mdiPause } from '@mdi/js';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import { Tool } from '@/types/toolTypes';

interface Timer {
  isRunning?: boolean;
  timeRemaining?: number;
  elapsedTime?: number;
}

interface PhaseControlsProps {
  phaseId: string;
  timer: Timer | null;
  onPauseTimer: (phaseId: string) => void;
  onStopTimer: (phaseId: string) => void;
  onMoveToNextPhase: (phaseId: string) => void;
}

interface _SterilizationTool {
  id: string;
  isP2Status?: boolean;
  [key: string]: unknown;
}

export const PhaseControls: React.FC<PhaseControlsProps> = ({
  phaseId,
  timer,
  onPauseTimer,
  onStopTimer,
  onMoveToNextPhase,
}) => {
  const { currentCycle } = useSterilizationStore();

  const isRunning = timer?.isRunning || false;
  const isTimerComplete = timer && timer.timeRemaining === 0;
  const hasToolsInCycle = currentCycle && currentCycle.tools.length > 0;

  const hasP2StatusTools = currentCycle?.tools.some((toolId: string) => {
    const tool = useSterilizationStore
      .getState()
      .availableTools.find((t: Tool) => t.id === toolId);
    return (tool as Tool)?.isP2Status;
  });

  // Show "Move to Next Phase" button when:
  // 1. Timer is complete (timeRemaining === 0) for bath phases
  // 2. Timer exists for drying phase (can be manually completed)
  // 3. There are tools in the current cycle
  const shouldShowMoveToNextButton =
    hasToolsInCycle &&
    ((phaseId === 'bath1' && isTimerComplete) ||
      (phaseId === 'bath2' && timer) ||
      (phaseId === 'drying' && timer) ||
      (phaseId === 'autoclave' && isTimerComplete));

  return (
    <div className="space-y-3">
      {/* Control Buttons */}
      <div className="flex gap-3">
        {phaseId === 'bath1' && timer ? (
          <button
            onClick={() => onPauseTimer(phaseId)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${
              isRunning
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
            }`}
          >
            <Icon
              path={isRunning ? mdiPause : mdiPlay}
              size={0.8}
              className="mr-2"
            />
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        ) : phaseId === 'bath1' ? (
          <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center justify-center">
            Started via workflow
          </div>
        ) : // Other phases only show pause/resume when timer exists, no start button
        timer ? (
          <button
            onClick={() => onPauseTimer(phaseId)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${
              isRunning
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
            }`}
          >
            <Icon
              path={isRunning ? mdiPause : mdiPlay}
              size={0.8}
              className="mr-2"
            />
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        ) : (
          <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm flex items-center justify-center">
            Started via previous phase
          </div>
        )}

        <button
          onClick={() => onStopTimer(phaseId)}
          className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      {/* Move to Next Phase Button */}
      {shouldShowMoveToNextButton && (
        <div className="mt-2">
          <button
            onClick={() => onMoveToNextPhase(phaseId)}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {phaseId === 'drying' && hasP2StatusTools
              ? 'Complete P2 Status Tools'
              : phaseId === 'autoclave'
                ? 'Complete All Tools'
                : 'Move to Next Phase'}
          </button>
        </div>
      )}
    </div>
  );
};
