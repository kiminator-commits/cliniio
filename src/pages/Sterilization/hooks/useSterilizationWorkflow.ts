import { useState, useCallback } from 'react';

interface WorkflowState {
  currentPhase: string;
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
}

/**
 * Custom hook for managing sterilization workflow state and operations.
 * Provides workflow control and phase management functionality.
 */
export const useSterilizationWorkflow = () => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentPhase: 'idle',
    isActive: false,
    startTime: null,
    endTime: null,
  });

  const startWorkflow = useCallback((phase: string) => {
    setWorkflowState((prev) => ({
      ...prev,
      currentPhase: phase,
      isActive: true,
      startTime: new Date(),
      endTime: null,
    }));
  }, []);

  const endWorkflow = useCallback(() => {
    setWorkflowState((prev) => ({
      ...prev,
      isActive: false,
      endTime: new Date(),
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      currentPhase: 'idle',
      isActive: false,
      startTime: null,
      endTime: null,
    });
  }, []);

  return {
    workflowState,
    startWorkflow,
    endWorkflow,
    resetWorkflow,
  };
};
