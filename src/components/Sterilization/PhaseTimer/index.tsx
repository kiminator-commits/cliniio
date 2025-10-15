import React, { memo, useEffect, useCallback, useState } from 'react';
import {
  useSterilizationStore,
  SterilizationPhase,
} from '../../../store/sterilizationStore';
import { sterilizationPhases } from '@/config/workflowConfig';
import { useTimerStore } from '@/store/timerStore';
import { useTimerControls } from '@/hooks/useTimerControls';
import { usePhaseTimerLogic } from '../hooks/usePhaseTimerLogic';
import { usePhaseTimerState } from './hooks/usePhaseTimerState';
import PhaseCard from '../PhaseCard';
import { PhaseTimerHeader } from './PhaseTimerHeader';
import { PhaseTimerExpanded } from './PhaseTimerExpanded';
import { DryingCIPopup } from '../workflows/DryingCIPopup';
import { AutoclaveCIPopup } from '../workflows/AutoclaveCIPopup';

/**
 * Props for the PhaseTimer component.
 * @interface PhaseTimerProps
 * @property {SterilizationPhase} phase - The sterilization phase to display and manage. Contains phase metadata, status, tools, and timing information. Required for rendering the phase timer interface and managing phase-specific operations.
 * @property {(phaseId: SterilizationPhase['id']) => void} onPhaseComplete - Callback function triggered when a phase completes its timer. Used to update the sterilization workflow state and trigger subsequent phase transitions. The phaseId parameter identifies which phase completed.
 * @property {(phaseId: SterilizationPhase['id']) => void} onPhaseStart - Callback function triggered when a phase timer starts. Used to update the sterilization workflow state and begin phase-specific operations. The phaseId parameter identifies which phase started.
 * @property {(phaseId: SterilizationPhase['id']) => void} onPhasePause - Callback function triggered when a phase timer is paused. Used to update the sterilization workflow state and pause phase-specific operations. The phaseId parameter identifies which phase was paused.
 */
interface PhaseTimerProps {
  phase: SterilizationPhase;
  onPhaseComplete: (phaseId: SterilizationPhase['id']) => void;
  onPhaseStart: (phaseId: SterilizationPhase['id']) => void;
  onPhasePause: (phaseId: SterilizationPhase['id']) => void;
}

/**
 * Refactored PhaseTimer component for managing individual sterilization phase timers.
 * Uses decomposed components and custom hooks for better code organization.
 * Reduced from 355 lines to a much more manageable size.
 *
 * @param {PhaseTimerProps} props - Component props containing phase data and callbacks
 * @returns {JSX.Element | null} The phase timer UI or null if duration is invalid
 */
export default memo(function PhaseTimer({
  phase,
  onPhaseComplete,
  onPhaseStart,
  onPhasePause,
}: PhaseTimerProps) {
  const phaseConfig =
    sterilizationPhases[phase.id as keyof typeof sterilizationPhases];
  const duration = phaseConfig?.duration || 0;

  const { currentCycle, moveToolToNextPhase, resetPhase } =
    useSterilizationStore();
  const { overexposed } = useTimerStore();

  // CI confirmation modal state
  const [ciModalState, setCiModalState] = useState({
    isOpen: false,
    cycleId: '',
    facilityId: '',
    toolIds: [] as string[],
  });

  // CI verification modal state
  const [ciVerificationModalState, setCiVerificationModalState] = useState({
    isOpen: false,
    cycleId: '',
    facilityId: '',
    toolIds: [] as string[],
  });

  // Custom hook for state management
  const {
    isExpanded,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isRunning,
    timerError,
    toggleExpanded,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setIsRunning: setRunning,
    setTimerError: setError,
    handleCompleteRef,
  } = usePhaseTimerState();

  // Use timer store for phase timing
  const timer = useTimerStore((state) => state.getTimer(phase.id));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startTimer, pauseTimer, resetTimer } = useTimerStore();

  const elapsed = timer?.elapsedTime || 0;
  const remaining = timer?.timeRemaining || duration;

  // Auto-start timer when phase becomes active
  useEffect(() => {
    if (phase.isActive && !timer?.isRunning && duration > 0) {
      startTimer(phase.id, duration);
    }
  }, [phase.isActive, timer?.isRunning, duration, phase.id, startTimer]);

  // Handle timer completion
  useEffect(() => {
    if (timer && timer.timeRemaining === 0 && timer.isRunning) {
      if (handleCompleteRef.current) {
        handleCompleteRef.current();
      }
    }
  }, [timer?.timeRemaining, timer?.isRunning, handleCompleteRef, timer]);

  // CI confirmation modal handlers
  const handleShowCIConfirmation = useCallback(
    (
      isOpen: boolean,
      cycleId: string,
      facilityId: string,
      toolIds: string[]
    ) => {
      if (phase.name === 'airDry') {
        setCiModalState({
          isOpen,
          cycleId,
          facilityId,
          toolIds,
        });
      } else if (phase.name === 'autoclave') {
        setCiVerificationModalState({
          isOpen,
          cycleId,
          facilityId,
          toolIds,
        });
      }
    },
    [phase.name]
  );

  const handleCIConfirmationClose = useCallback(() => {
    setCiModalState({
      isOpen: false,
      cycleId: '',
      facilityId: '',
      toolIds: [],
    });
  }, []);

  const handleCIVerificationClose = useCallback(() => {
    setCiVerificationModalState({
      isOpen: false,
      cycleId: '',
      facilityId: '',
      toolIds: [],
    });
  }, []);

  // Update the phase timer logic with actual timer values
  const {
    getStatusInfo,
    getProgressInfo,
    getBorderClasses,
    getProgressBarColor,
    isBathPhase,
    validatePhaseDuration,
    getTimeDisplayText,
    handleComplete: handleCompleteFromLogic,
    handleStart,
    handlePause,
    handleMoveToolsToNext,
    handleReset,
    handleCIConfirmationComplete,
    handleCIVerificationComplete,
  } = usePhaseTimerLogic({
    phase,
    elapsed,
    remaining,
    duration,
    onPhaseComplete,
    onPhaseStart,
    onPhasePause,
    moveToolToNextPhase,
    resetPhase,
    resetTimer: () => resetTimer(phase.id), // Use timer store reset
    currentCycle,
    onShowCIConfirmation: handleShowCIConfirmation,
  });

  // Store the handleComplete function in the ref
  useEffect(() => {
    handleCompleteRef.current = handleCompleteFromLogic;
  }, [handleCompleteFromLogic]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { handleStartTimer, handlePauseTimer } = useTimerControls();

  const timerStart = useCallback(() => {
    handleStart();
    handleStartTimer(phase.id, duration); // Start timer store timer
    setError(null); // Clear any previous errors
  }, [handleStart, handleStartTimer, phase.id, duration, setError]);

  const timerPause = useCallback(() => {
    handlePause();
    handlePauseTimer(phase.id); // Pause timer store timer
  }, [handlePause, handlePauseTimer, phase.id]);

  const handleCIModalComplete = useCallback(async () => {
    await handleCIConfirmationComplete();
    handleCIConfirmationClose();
  }, [handleCIConfirmationComplete, handleCIConfirmationClose]);

  const handleCIVerificationModalComplete = useCallback(async () => {
    await handleCIVerificationComplete();
    handleCIVerificationClose();
  }, [handleCIVerificationComplete, handleCIVerificationClose]);

  // Safety check moved to after all hooks are called
  if (!validatePhaseDuration()) {
    // Error handling without console logging
    return null;
  }

  const statusInfo = getStatusInfo();
  const progressInfo = getProgressInfo();
  const borderClasses = getBorderClasses();
  const progressBarColor = getProgressBarColor();
  const timeDisplayText = getTimeDisplayText();
  const shouldShowExpanded = isExpanded;

  // Get timer status
  const timerStatus = timer
    ? { isRunning: timer.isRunning, overexposed: timer.overexposed }
    : null;

  return (
    <div className="space-y-4">
      <PhaseCard title={phase.name}>
        <div
          className={`border rounded-lg transition-all duration-300 ${borderClasses}`}
        >
          {/* Header - Always visible */}
          <PhaseTimerHeader
            phase={phase}
            isExpanded={isExpanded}
            timeDisplayText={timeDisplayText}
            statusInfo={statusInfo}
            onToggleExpand={toggleExpanded}
            onStart={timerStart}
            onMoveToolsToNext={handleMoveToolsToNext}
            timer={timer}
          />

          {/* Expanded Content */}
          {shouldShowExpanded && (
            <PhaseTimerExpanded
              phase={phase}
              shouldShowProgress={progressInfo.shouldShowProgress}
              percentage={progressInfo.percentage}
              progressBarColor={progressBarColor}
              timerError={timerError}
              isBathPhase={isBathPhase()}
              overexposed={overexposed}
              timeDisplayText={timeDisplayText}
              timerStatus={timerStatus}
              currentCycleId={currentCycle?.id}
              onStart={timerStart}
              onPause={timerPause}
              onComplete={handleCompleteFromLogic}
              onMoveToolsToNext={handleMoveToolsToNext}
              onReset={handleReset}
            />
          )}
        </div>
      </PhaseCard>

      {/* CI Confirmation Modal */}
      <DryingCIPopup
        isOpen={ciModalState.isOpen}
        onClose={handleCIConfirmationClose}
        currentCycleId={ciModalState.cycleId}
        facilityId={ciModalState.facilityId}
        toolIds={ciModalState.toolIds}
        onComplete={handleCIModalComplete}
      />

      {/* CI Verification Modal */}
      <AutoclaveCIPopup
        isOpen={ciVerificationModalState.isOpen}
        onClose={handleCIVerificationClose}
        currentCycleId={ciVerificationModalState.cycleId}
        facilityId={ciVerificationModalState.facilityId}
        toolIds={ciVerificationModalState.toolIds}
        onComplete={handleCIVerificationModalComplete}
      />
    </div>
  );
});
