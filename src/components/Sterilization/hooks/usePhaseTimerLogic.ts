import { useCallback } from 'react';
import { SterilizationPhase } from '../../../store/sterilizationStore';
import { SterilizationCycle } from '../../../store/slices/types/sterilizationCycleTypes';
import {
  PhaseTimerService,
  PhaseStatusInfo,
  PhaseProgressInfo,
} from '../services/phaseTimerService';
import { toast } from 'react-hot-toast';

/**
 * Props for the usePhaseTimerLogic hook.
 * @interface UsePhaseTimerLogicProps
 * @property {SterilizationPhase} phase - The sterilization phase being managed
 * @property {number} elapsed - Elapsed time in seconds
 * @property {number} remaining - Remaining time in seconds
 * @property {number} duration - Total phase duration in seconds
 * @property {(phaseId: string) => void} onPhaseComplete - Callback for phase completion
 * @property {(phaseId: string) => void} onPhaseStart - Callback for phase start
 * @property {(phaseId: string) => void} onPhasePause - Callback for phase pause
 * @property {(toolId: string) => void} moveToolToNextPhase - Function to move tools to next phase
 * @property {(phaseId: string) => void} resetPhase - Function to reset phase state
 * @property {() => void} resetTimer - Function to reset timer
 * @property {SterilizationCycle | null} currentCycle - Current sterilization cycle
 */
interface UsePhaseTimerLogicProps {
  phase: SterilizationPhase;
  elapsed: number;
  remaining: number;
  duration: number;
  onPhaseComplete: (phaseId: string) => void;
  onPhaseStart: (phaseId: string) => void;
  onPhasePause: (phaseId: string) => void;
  moveToolToNextPhase: (toolId: string) => void;
  resetPhase: (phaseId: string) => void;
  resetTimer: () => void;
  currentCycle: SterilizationCycle | null;
}

/**
 * Custom hook that provides comprehensive logic for managing sterilization phase timers.
 * Handles phase status, progress calculations, timer controls, and tool movement.
 * Provides utility functions for UI state management and validation.
 *
 * @param {UsePhaseTimerLogicProps} props - Configuration object containing phase data and callbacks
 * @returns {object} Object containing all timer logic functions and utilities
 */
export const usePhaseTimerLogic = ({
  phase,
  elapsed,
  remaining,
  duration,
  onPhaseComplete,
  onPhaseStart,
  onPhasePause,
  moveToolToNextPhase,
  resetPhase,
  resetTimer,
  currentCycle,
}: UsePhaseTimerLogicProps) => {
  const getStatusInfo = useCallback((): PhaseStatusInfo => {
    return PhaseTimerService.getStatusInfo(phase.status);
  }, [phase.status]);

  const getProgressInfo = useCallback((): PhaseProgressInfo => {
    return PhaseTimerService.getProgressInfo(phase, elapsed, duration);
  }, [phase, elapsed, duration]);

  const getBorderClasses = useCallback((): string => {
    return PhaseTimerService.getBorderClasses(phase);
  }, [phase]);

  const getProgressBarColor = useCallback((): string => {
    return PhaseTimerService.getProgressBarColor(phase);
  }, [phase]);

  const isBathPhase = useCallback((): boolean => {
    return PhaseTimerService.isBathPhase(phase.name);
  }, [phase.name]);

  const validatePhaseDuration = useCallback((): boolean => {
    return PhaseTimerService.validatePhaseDuration(duration);
  }, [duration]);

  const getTimeDisplayText = useCallback((): string => {
    return PhaseTimerService.getTimeDisplayText(
      phase.id,
      elapsed,
      remaining,
      duration
    );
  }, [phase.id, elapsed, remaining, duration]);

  const handleComplete = useCallback(() => {
    try {
      onPhaseComplete(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to complete phase. Please try again.');
    }
  }, [phase.id, onPhaseComplete]);

  const handleStart = useCallback(() => {
    try {
      onPhaseStart(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start phase. Please try again.');
    }
  }, [phase.id, onPhaseStart]);

  const handlePause = useCallback(() => {
    try {
      onPhasePause(phase.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to pause phase. Please try again.');
    }
  }, [phase.id, onPhasePause]);

  /**
   * Moves all tools from the current phase to the next phase and resets the current phase.
   * Executes tool movement and phase reset with error handling and user feedback.
   */
  /**
   * Moves all tools from the current phase to the next phase and resets the current phase.
   * Executes tool movement and phase reset with error handling and user feedback.
   */
  const handleMoveToolsToNext = useCallback(() => {
    try {
      // BUSINESS LOGIC: Cycle existence validation
      // Only proceed if there's an active sterilization cycle
      if (currentCycle) {
        // BUSINESS LOGIC: Tool migration to next phase
        // Move each tool in the current phase to the next phase in the workflow
        // This ensures proper progression through the sterilization process
        phase.tools.forEach((toolId: string) => {
          moveToolToNextPhase(toolId);
        });

        // BUSINESS LOGIC: Phase state reset with delay
        // Reset the current phase after tools have been moved
        // The delay ensures tool movement completes before phase reset
        // This prevents race conditions in the sterilization workflow
        setTimeout(() => {
          resetPhase(phase.id);
        }, 100);
      }
    } catch (err) {
      // BUSINESS LOGIC: Error handling and user feedback
      // Log error for debugging and show user-friendly error message
      console.error(err);
      toast.error('Failed to move tools to next phase. Please try again.');
    }
  }, [currentCycle, phase.tools, phase.id, moveToolToNextPhase, resetPhase]);

  const handleReset = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  return {
    getStatusInfo,
    getProgressInfo,
    getBorderClasses,
    getProgressBarColor,
    isBathPhase,
    validatePhaseDuration,
    getTimeDisplayText,
    handleComplete,
    handleStart,
    handlePause,
    handleMoveToolsToNext,
    handleReset,
  };
};
