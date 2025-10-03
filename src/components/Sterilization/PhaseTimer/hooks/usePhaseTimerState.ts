import { useState, useRef } from 'react';

/**
 * Custom hook for managing PhaseTimer component state.
 * Extracts state management logic from the main component.
 */
export const usePhaseTimerState = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerError, setTimerError] = useState<string | null>(null);

  // Use a ref to store the handleComplete function so it can be called from the onComplete callback
  const handleCompleteRef = useRef<(() => void) | null>(null);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const setExpanded = (expanded: boolean) => setIsExpanded(expanded);

  return {
    isExpanded,
    setIsExpanded,
    isRunning,
    setIsRunning,
    timerError,
    setTimerError,
    handleCompleteRef,
    toggleExpanded,
    setExpanded,
  };
};
