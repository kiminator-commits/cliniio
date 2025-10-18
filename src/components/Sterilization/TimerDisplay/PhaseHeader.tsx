import React from 'react';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import { Tool } from '@/types/toolTypes';
import {
  getPhaseStatusColor,
  getPhaseStatusText,
  getTimerDisplayValue,
  formatTime,
} from '../../../utils/timerUtils';

interface PhaseConfig {
  label: string;
  duration: number;
}

interface Timer {
  isRunning?: boolean;
  timeRemaining?: number;
  elapsedTime?: number;
  overexposed?: boolean;
}

interface PhaseHeaderProps {
  phaseId: string;
  phaseConfig: PhaseConfig;
  timer: Timer | null;
  duration: number;
  elapsedTime: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

interface _SterilizationTool {
  id: string;
  isP2Status?: boolean;
  [key: string]: unknown;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  phaseId,
  phaseConfig,
  timer,
  duration,
  elapsedTime,
  isExpanded,
  onToggleExpanded,
}) => {
  const { currentCycle } = useSterilizationStore();

  const timeRemaining = timer?.timeRemaining ?? duration;
  const isRunning = timer?.isRunning || false;
  const isOverexposed = timer?.overexposed || false;

  const hasP2StatusTools = currentCycle?.tools.some((toolId: string) => {
    const tool = useSterilizationStore
      .getState()
      .availableTools.find((t: Tool) => t.id === toolId);
    return (tool as Tool)?.isP2Status;
  });

  return (
    <div
      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onToggleExpanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggleExpanded();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-[#5b5b5b]">
            {phaseConfig.label}
          </h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getPhaseStatusColor(isOverexposed, isRunning)}`}
          >
            {getPhaseStatusText(isOverexposed, isRunning)}
          </span>
          {/* P2 Status indicator for drying phase */}
          {phaseId === 'drying' && hasP2StatusTools && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              P2 STATUS
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Timer Display - Condensed */}
          <div className="text-right">
            <div
              className={`text-2xl font-mono font-bold ${isOverexposed ? 'text-red-600' : 'text-[#5b5b5b]'}`}
            >
              {getTimerDisplayValue(timer, phaseId, duration, elapsedTime)}
            </div>
            <div className="text-xs text-gray-500">
              {timer
                ? `${timer.elapsedTime ? `${Math.floor(timer.elapsedTime / 60)}:${(timer.elapsedTime % 60).toString().padStart(2, '0')}` : '00:00'} elapsed`
                : 'Ready'}
            </div>
          </div>
          <Icon
            path={isExpanded ? mdiChevronUp : mdiChevronDown}
            size={1}
            className="text-gray-400"
          />
        </div>
      </div>

      {/* Progress Bar - Always Visible */}
      {phaseId !== 'drying' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5 relative">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isOverexposed ? 'bg-red-500' : 'bg-[#4ECDC4]'
              }`}
              style={{
                width: `${(timeRemaining / duration) * 100}%`,
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isOverexposed && (phaseId === 'bath1' || phaseId === 'bath2')
              ? `100% + ${formatTime(elapsedTime - duration)} overexposed`
              : `${Math.round(((duration - timeRemaining) / duration) * 100)}% complete`}
          </div>
        </div>
      )}
    </div>
  );
};
