import { useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useSterilizationStore } from '../store/sterilizationStore';

export const useTimerControls = () => {
  const { timers, startTimer, pauseTimer, resetTimer, resumeTimer } =
    useTimerStore();
  const { currentCycle, setCurrentCycle } = useSterilizationStore();

  const handleStartTimer = useCallback(
    (phaseId: string, duration: number) => {
      startTimer(phaseId, duration);
    },
    [startTimer]
  );

  const handlePauseTimer = useCallback(
    (phaseId: string) => {
      const timer = timers[phaseId];
      if (timer?.isRunning) {
        pauseTimer(phaseId);
      } else {
        // Resume timer if it exists and was paused
        if (timer) {
          resumeTimer(phaseId);
        }
      }
    },
    [timers, pauseTimer, resumeTimer]
  );

  const handleStopTimer = useCallback(
    (phaseId: string) => {
      // 🚨 CRITICAL FEATURE - DO NOT REMOVE THIS LOGIC
      // This function MUST clear tools from the cycle to allow workflow restart
      // Without this, users cannot restart workflows after cancelling
      // See TIMER_CANCELLATION_FEATURE.md for full documentation

      console.log('🛑 Cancelling timer for phase:', phaseId);

      // Stop and reset the timer
      pauseTimer(phaseId);
      resetTimer(phaseId);

      // Clear tools from the cycle to allow restarting the workflow
      if (currentCycle) {
        console.log(
          '🛑 Clearing tools from cycle. Current tools:',
          currentCycle.tools
        );

        // Create a new cycle with no tools
        const clearedCycle = {
          ...currentCycle,
          tools: [],
          phases: currentCycle.phases.map((phase) => ({
            ...phase,
            tools: [],
            isActive: false,
            status: 'pending' as const,
            startTime: null,
            endTime: null,
          })),
        };

        setCurrentCycle(clearedCycle);
        console.log(
          '✅ Cycle cleared, tools removed. Workflow can be restarted.'
        );
      }
    },
    [pauseTimer, resetTimer, currentCycle, setCurrentCycle]
  );

  return {
    handleStartTimer,
    handlePauseTimer,
    handleStopTimer,
  };
};

export function calculateOverexposure({
  elapsedTime,
  duration,
}: {
  elapsedTime: number;
  duration: number;
}): boolean {
  return elapsedTime > duration;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
