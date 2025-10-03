import React from 'react';
import { SterilizationPhase } from '../../../store/sterilizationStore';
import { PhaseTimerProgress } from './PhaseTimerProgress';
import { PhaseToolList } from './PhaseToolList';
import { PhaseTimerControls } from './PhaseTimerControls';
import { PhaseTimerAlerts } from './PhaseTimerAlerts';

interface PhaseTimerExpandedProps {
  phase: SterilizationPhase;
  shouldShowProgress: boolean;
  percentage: number;
  progressBarColor: string;
  timerError: string | null;
  isBathPhase: boolean;
  overexposed: boolean;
  timeDisplayText: string;
  timerStatus: {
    isRunning: boolean;
    overexposed: boolean;
  } | null;
  currentCycleId?: string;
  onStart: () => void;
  onPause: () => void;
  onComplete: () => void;
  onMoveToolsToNext: () => void;
  onReset: () => void;
}

/**
 * PhaseTimerExpanded component for the expanded content of phase timers.
 * Orchestrates all expanded sections including progress, tools, controls, and alerts.
 */
export const PhaseTimerExpanded: React.FC<PhaseTimerExpandedProps> = ({
  phase,
  shouldShowProgress,
  percentage,
  progressBarColor,
  timerError,
  isBathPhase,
  overexposed,
  timeDisplayText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  timerStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentCycleId,
  onStart,
  onPause,
  onComplete,
  onMoveToolsToNext,
  onReset,
}) => {
  return (
    <div className="p-3 pt-0">
      <PhaseTimerProgress
        shouldShowProgress={shouldShowProgress}
        percentage={percentage}
        progressBarColor={progressBarColor}
        timerError={timerError}
      />

      <PhaseToolList phase={phase} />

      <PhaseTimerControls
        phase={phase}
        onStart={onStart}
        onPause={onPause}
        onComplete={onComplete}
        onMoveToolsToNext={onMoveToolsToNext}
        onReset={onReset}
      />

      <PhaseTimerAlerts
        phase={phase}
        isBathPhase={isBathPhase}
        overexposed={overexposed}
        timeDisplayText={timeDisplayText}
      />
    </div>
  );
};
