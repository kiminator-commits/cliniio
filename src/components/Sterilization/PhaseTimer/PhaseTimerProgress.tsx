import React from 'react';
import Icon from '@mdi/react';
import { mdiAlert } from '@mdi/js';

interface PhaseTimerProgressProps {
  shouldShowProgress: boolean;
  percentage: number;
  progressBarColor: string;
  timerError: string | null;
}

/**
 * PhaseTimerProgress component for displaying timer progress and errors.
 * Shows progress bar and timer error messages when applicable.
 */
export const PhaseTimerProgress: React.FC<PhaseTimerProgressProps> = ({
  shouldShowProgress,
  percentage,
  progressBarColor,
  timerError,
}) => {
  return (
    <>
      {/* Timer Error Display */}
      {timerError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="flex items-center gap-1 mb-1">
            <Icon path={mdiAlert} size={0.8} className="text-red-500" />
            <span className="font-medium text-red-700">Timer Error</span>
          </div>
          <p className="text-red-600">{timerError}</p>
          <p className="text-red-500 mt-1">Using fallback timer</p>
        </div>
      )}

      {/* Progress Bar */}
      {shouldShowProgress && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </>
  );
};
