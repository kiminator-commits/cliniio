import React from 'react';
import Icon from '@mdi/react';
import { mdiPlay, mdiPause, mdiStop, mdiCheck, mdiArrowRight } from '@mdi/js';
import { SterilizationPhase } from '../../../store/sterilizationStore';

interface PhaseTimerControlsProps {
  phase: SterilizationPhase;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onMoveToolsToNext: () => void;
  onReset: () => void;
}

/**
 * PhaseTimerControls component for managing phase timer actions.
 * Displays appropriate buttons based on phase status.
 */
export const PhaseTimerControls: React.FC<PhaseTimerControlsProps> = ({
  phase,
  onStart,
  onPause,
  onComplete,
  onMoveToolsToNext,
  onReset,
}) => {
  return (
    <div className="flex items-center gap-2">
      {phase.status === 'active' && (
        <>
          <button
            onClick={onPause}
            className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
          >
            <Icon path={mdiPause} size={0.7} />
            Pause
          </button>

          <button
            onClick={onComplete}
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
            onClick={onStart}
            className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
          >
            <Icon path={mdiPlay} size={0.7} />
            Resume
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
          >
            <Icon path={mdiCheck} size={0.7} />
            Complete
          </button>
        </>
      )}

      {phase.status === 'completed' && phase.tools.length > 0 && (
        <button
          onClick={onMoveToolsToNext}
          className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
        >
          <Icon path={mdiArrowRight} size={0.7} />
          Move Tools to Next Phase
        </button>
      )}

      {/* Manual Reset Button - Available for all phases */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
      >
        <Icon path={mdiStop} size={0.7} />
        Reset
      </button>
    </div>
  );
};
