import { useEffect, useCallback } from 'react';
import { useSterilizationStore } from '../store/sterilizationStore';

/**
 * Custom hook for BI workflow state management
 * Provides easy access to BI-related state and operations
 */
export const useBIWorkflow = () => {
  const {
    // BI Test State
    biTestCompleted,
    biTestDate,
    biTestResults,
    nextBITestDue,
    lastBITestDate,
    biTestPassed,
    biTestOptedOut,

    // BI Failure State
    biFailureActive,
    biFailureDetails,

    // Activity Log
    activityLog,

    // Actions
    setBiTestCompleted,
    setBiTestDate,
    recordBITestResult,
    setNextBITestDue,
    setLastBITestDate,
    setBiTestPassed,
    setBiTestOptedOut,
    resetBIState,
    activateBIFailure,
    deactivateBIFailure,
    addActivity,
  } = useSterilizationStore();

  // Auto-save state to localStorage when it changes
  useEffect(() => {
    // Note: saveStateToLocalStorage is not available in current store
    // This would need to be implemented in the store if needed
  }, [
    biTestCompleted,
    biTestDate,
    biTestResults,
    nextBITestDue,
    lastBITestDate,
    biTestPassed,
    biTestOptedOut,
  ]);

  // Load state from localStorage on mount
  useEffect(() => {
    // Note: loadStateFromLocalStorage is not available in current store
    // This would need to be implemented in the store if needed
  }, []);

  // Auto-sync with Supabase when there are pending changes
  useEffect(() => {
    // Note: pendingChanges and syncWithSupabase are not available in current store
    // This would need to be implemented in the store if needed
  }, []);

  // Load initial data on mount
  useEffect(() => {
    // Note: loadComplianceSettings, getBIFailureHistory, loadActivityLog are not available
    // This would need to be implemented in the store if needed
  }, []);

  // Convenience methods for common operations
  const recordBIResult = useCallback(
    async (toolId: string, passed: boolean) => {
      await recordBITestResult({
        id: `bi-test-${Date.now()}`,
        toolId,
        passed,
        date: new Date(),
        status: passed ? 'pass' : 'fail',
      });
    },
    [recordBITestResult]
  );

  const createBIFailure = useCallback(
    async (
      affectedToolsCount: number,
      affectedBatchIds: string[],
      operator: string
    ) => {
      await activateBIFailure({
        affectedToolsCount,
        affectedBatchIds,
        operator,
      });
    },
    [activateBIFailure]
  );

  const resolveBIFailureIncident = useCallback(async () => {
    await deactivateBIFailure();
  }, [deactivateBIFailure]);

  const logActivity = useCallback(
    (
      type: 'bi-test' | 'cycle-complete' | 'autoclave-cycle-started',
      title: string,
      toolCount?: number
    ) => {
      addActivity({
        id: `activity-${Date.now()}`,
        type,
        title,
        time: new Date(),
        toolCount: toolCount || 1,
        color: type === 'bi-test' ? 'bg-blue-500' : 'bg-green-500',
      });
    },
    [addActivity]
  );

  return {
    // State
    biTestCompleted,
    biTestDate,
    biTestResults,
    nextBITestDue,
    lastBITestDate,
    biTestPassed,
    biTestOptedOut,
    biFailureActive,
    biFailureDetails,
    activityLog,

    // Actions
    setBiTestCompleted,
    setBiTestDate,
    recordBITestResult,
    setNextBITestDue,
    setLastBITestDate,
    setBiTestPassed,
    setBiTestOptedOut,
    resetBIState,
    activateBIFailure,
    deactivateBIFailure,
    addActivity,

    // Convenience methods
    recordBIResult,
    createBIFailure,
    resolveBIFailureIncident,
    logActivity,
  };
};
