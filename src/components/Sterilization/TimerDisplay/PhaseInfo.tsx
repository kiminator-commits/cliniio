import React from 'react';
import { formatTime } from '../../../utils/timerUtils';

interface Timer {
  isRunning?: boolean;
  timeRemaining?: number;
  elapsedTime?: number;
}

interface PhaseInfoProps {
  duration: number;
  isRunning: boolean;
  timer: Timer | null;
}

export const PhaseInfo: React.FC<PhaseInfoProps> = ({
  duration,
  isRunning,
  timer,
}) => {
  return (
    <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
      <div>Duration: {formatTime(duration)}</div>
      <div>Status: {isRunning ? 'Running' : 'Stopped'}</div>
      {timer && (
        <>
          <div>Remaining: {formatTime(timer.timeRemaining || 0)}</div>
          <div>Elapsed: {formatTime(timer.elapsedTime || 0)}</div>
        </>
      )}
    </div>
  );
};
