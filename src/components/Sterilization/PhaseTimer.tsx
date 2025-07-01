import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSterilizationStore, SterilizationPhase } from '../../store/sterilizationStore';
import { sterilizationPhases } from '@/config/workflowConfig';
import { useAccurateTimer } from '@/hooks/sterilization/useAccurateTimer';
import { formatTime } from '@/utils/timerUtils';
import { useTimerStore } from '@/store/timerStore';
import { useTimerControls } from '@/hooks/useTimerControls';
import { toast } from 'react-hot-toast';
import Icon from '@mdi/react';
import {
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiCheck,
  mdiTimer,
  mdiTools,
  mdiArrowRight,
  mdiChevronDown,
  mdiChevronRight,
  mdiAlert,
} from '@mdi/js';

interface PhaseTimerProps {
  phase: SterilizationPhase;
  onPhaseComplete: (phaseId: SterilizationPhase['id']) => void;
  onPhaseStart: (phaseId: SterilizationPhase['id']) => void;
  onPhasePause: (phaseId: SterilizationPhase['id']) => void;
}

export default memo(function PhaseTimer({
  phase,
  onPhaseComplete,
  onPhaseStart,
  onPhasePause,
}: PhaseTimerProps) {
  const phaseConfig = sterilizationPhases[phase.id];
  const duration = phaseConfig?.duration || 0;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const { currentCycle, moveToolToNextPhase, resetPhase } = useSterilizationStore();

  const { overexposed, resetTimer } = useTimerStore();

  const { elapsed, remaining, isComplete } = useAccurateTimer(duration, phase.isActive);

  // Check if this is a bath phase that needs over-exposure tracking
  const isBathPhase = phase.name.toLowerCase().includes('bath');

  const { handleStart, handlePause } = useTimerControls({
    isRunning,
    setIsRunning,
    setStartTime: () => {}, // Placeholder since not used
    setPauseTime: () => {}, // Placeholder since not used
    onStart: () => {
      try {
        onPhaseStart(phase.id);
      } catch (err) {
        console.error(err);
        toast.error('Failed to start phase. Please try again.');
      }
    },
    onPause: () => {
      try {
        onPhasePause(phase.id);
      } catch (err) {
        console.error(err);
        toast.error('Failed to pause phase. Please try again.');
      }
    },
  });

  useEffect(() => {
    if (isComplete) {
      try {
        onPhaseComplete(phase);
      } catch (err) {
        console.error(err);
        toast.error('Failed to complete phase. Please try again.');
      }
    }
  }, [isComplete, onPhaseComplete, phase]);

  const handleComplete = useCallback(() => {
    try {
      onPhaseComplete(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete phase. Please try again.');
    }
  }, [phase.id, onPhaseComplete]);

  const handleMoveToolsToNext = useCallback(() => {
    try {
      if (currentCycle) {
        phase.tools.forEach(toolId => {
          moveToolToNextPhase(toolId);
        });

        // Reset the current phase state after moving tools
        setTimeout(() => {
          resetPhase(phase.id);
        }, 100);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to move tools to next phase. Please try again.');
    }
  }, [currentCycle, phase.tools, phase.id, moveToolToNextPhase, resetPhase]);

  const getProgressPercentage = (): number => {
    // Air dry doesn't have a fixed duration, so no progress bar
    if (phase.id === 'airDry') {
      return 0;
    }
    const totalTime = duration;
    return Math.min(100, (elapsed / totalTime) * 100);
  };

  const getStatusColor = (): string => {
    switch (phase.status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (): string => {
    switch (phase.status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'paused':
        return 'Paused';
      default:
        return 'Pending';
    }
  };

  const shouldShowExpanded = isExpanded;

  // Safety check moved to after all hooks are called
  if (duration <= 0 || duration > 7200) {
    console.error(`Invalid phase duration: ${duration}. Must be between 1 and 7200 seconds.`);
    return null;
  }

  return (
    <div
      className={`border rounded-lg transition-all duration-300 ${
        phase.isActive
          ? 'border-green-500 bg-green-50'
          : phase.status === 'completed'
            ? 'border-blue-500 bg-blue-50'
            : phase.status === 'failed'
              ? 'border-red-500 bg-red-50'
              : phase.tools.length > 0
                ? 'border-blue-300 bg-blue-50 shadow-sm'
                : 'border-gray-300 bg-white'
      }`}
    >
      {/* Header - Always visible */}
      <div
        className={`flex items-center justify-between p-4 ${shouldShowExpanded ? 'border-b border-gray-200' : ''}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Icon
              path={shouldShowExpanded ? mdiChevronDown : mdiChevronRight}
              size={1}
              className="text-gray-500"
            />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">{phase.name}</h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}
          >
            {getStatusText()}
          </div>
          {phase.tools.length > 0 && (
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
              <Icon path={mdiTools} size={0.9} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">{phase.tools.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Icon path={mdiTimer} size={1} className="text-gray-500" />
          <span className="text-sm text-gray-600">
            {phase.id === 'airDry'
              ? // For air dry, show elapsed time (counting up)
                `${formatTime(elapsed)} elapsed`
              : // For other phases, show countdown
                `${formatTime(remaining)} / ${formatTime(duration)}`}
          </span>

          {/* Start button in collapsed header */}
          {phase.status === 'pending' && (
            <button
              onClick={handleStart}
              className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
            >
              <Icon path={mdiPlay} size={0.7} />
              Start
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {shouldShowExpanded && (
        <div className="p-3 pt-0">
          {/* Progress Bar */}
          {phase.id !== 'airDry' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  phase.isActive
                    ? 'bg-green-500'
                    : phase.status === 'completed'
                      ? 'bg-blue-500'
                      : phase.status === 'failed'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          )}

          {/* Tool List */}
          {phase.tools.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Tools in this phase:</h4>
              <div className="flex flex-wrap gap-1">
                {phase.tools.map(toolId => {
                  const tool = currentCycle?.tools.find(t => t.id === toolId);
                  return (
                    <span
                      key={toolId}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tool?.name || toolId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {phase.status === 'active' && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                >
                  <Icon path={mdiPause} size={0.7} />
                  Pause
                </button>

                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  <Icon path={mdiCheck} size={0.7} />
                  Complete
                </button>
              </>
            )}

            {phase.status === 'paused' && (
              <>
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                >
                  <Icon path={mdiPlay} size={0.7} />
                  Resume
                </button>

                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                >
                  <Icon path={mdiCheck} size={0.7} />
                  Complete
                </button>
              </>
            )}

            {phase.status === 'completed' && phase.tools.length > 0 && (
              <button
                onClick={handleMoveToolsToNext}
                className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
              >
                <Icon path={mdiArrowRight} size={0.7} />
                Move Tools to Next Phase
              </button>
            )}

            {/* Manual Reset Button - Available for all phases */}
            <button
              onClick={() => {
                resetTimer();
              }}
              className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
            >
              <Icon path={mdiStop} size={0.7} />
              Reset
            </button>
          </div>

          {/* Over-Exposure Timer - Only for bath phases */}
          {isBathPhase && overexposed && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon path={mdiAlert} size={1} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">Over-Exposure Timer</span>
                </div>
                <span className="text-lg font-mono font-bold text-red-700">
                  {formatTime(elapsed * 1000)}
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Tools have been in chemicals longer than recommended. Please remove immediately.
              </p>
            </div>
          )}

          {/* Phase Notes */}
          {phase.status === 'failed' && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
              <p className="text-red-700">Phase failed. Please check equipment and restart.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
