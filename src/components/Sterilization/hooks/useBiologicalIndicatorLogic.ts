import { useCallback } from 'react';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import {
  BiologicalIndicatorService,
  BITestValidation,
} from '../services/biologicalIndicatorService';
import { BITestResult } from '../../../types/sterilizationTypes';

/**
 * Props for the useBiologicalIndicatorLogic hook.
 * @interface UseBiologicalIndicatorLogicProps
 * @property {'pass' | 'fail' | null} selectedResult - The currently selected BI test result
 * @property {boolean} isSubmitting - Whether the form is currently being submitted
 * @property {string} operatorName - Name of the operator performing the test
 * @property {(result: BITestResult) => void} onComplete - Callback when test submission completes
 * @property {() => void} onClose - Callback to close the test interface
 */
interface UseBiologicalIndicatorLogicProps {
  selectedResult: 'pass' | 'fail' | null;
  isSubmitting: boolean;
  operatorName: string;
  onComplete: (result: BITestResult) => void;
  onClose: () => void;
}

/**
 * Custom hook that provides logic for managing Biological Indicator (BI) test workflows.
 * Handles test validation, submission, result processing, and UI state management.
 * Provides utility functions for test result handling and user feedback.
 *
 * @param {UseBiologicalIndicatorLogicProps} props - Configuration object containing test data and callbacks
 * @returns {object} Object containing all BI test logic functions and utilities
 */
export const useBiologicalIndicatorLogic = ({
  selectedResult,
  isSubmitting,
  operatorName,
  onComplete,
  onClose,
}: UseBiologicalIndicatorLogicProps) => {
  const store = useSterilizationStore();

  const validateSubmission = useCallback((): BITestValidation => {
    const lastTestDate = store.lastBITestDate
      ? new Date(store.lastBITestDate)
      : null;
    return BiologicalIndicatorService.validateBITestSubmission(
      selectedResult,
      lastTestDate
    );
  }, [selectedResult, store.lastBITestDate]);

  /**
   * Handles the submission of BI test results with validation and error handling.
   * Processes test results, shows appropriate warnings for failures, and triggers completion callbacks.
   */
  /**
   * Handles the submission of BI test results with validation and error handling.
   * Processes test results, shows appropriate warnings for failures, and triggers completion callbacks.
   */
  const handleSubmit = useCallback(() => {
    // BUSINESS LOGIC: Pre-submission validation
    // Validate test submission against regulatory requirements and business rules
    const validation = validateSubmission();

    // BUSINESS LOGIC: Validation failure handling
    // Stop submission if validation fails and show error message to operator
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    // BUSINESS LOGIC: Critical failure notification
    // Note: FAIL confirmation is now handled by the BIFailConfirmationModal component
    // This provides a better user experience with detailed information about affected tools

    // BUSINESS LOGIC: Test result processing
    // Only process if a valid result is selected
    if (selectedResult) {
      // BUSINESS LOGIC: Test result creation
      // Create formal test result record with operator attribution for audit trail
      const result = BiologicalIndicatorService.createBITestResult(
        selectedResult,
        operatorName
      );

      // BUSINESS LOGIC: User experience optimization
      // Brief delay provides visual feedback and prevents rapid state changes
      // This improves user experience and ensures proper completion handling
      setTimeout(() => {
        onComplete(result);
        onClose();
      }, 500);
    }
  }, [selectedResult, operatorName, validateSubmission, onComplete, onClose]);

  const getFailWarningMessage = useCallback((): string => {
    return BiologicalIndicatorService.getFailWarningMessage();
  }, []);

  const shouldShowFailWarning = useCallback((): boolean => {
    return BiologicalIndicatorService.shouldShowFailWarning(selectedResult);
  }, [selectedResult]);

  const getSubmitButtonState = useCallback(() => {
    return BiologicalIndicatorService.getSubmitButtonState(
      selectedResult,
      isSubmitting
    );
  }, [selectedResult, isSubmitting]);

  const getResultSelectionClasses = useCallback(
    (currentResult: 'pass' | 'fail'): string => {
      return BiologicalIndicatorService.getResultSelectionClasses(
        selectedResult,
        currentResult
      );
    },
    [selectedResult]
  );

  const getCurrentDateTime = useCallback((): string => {
    return BiologicalIndicatorService.getCurrentDateTime();
  }, []);

  return {
    validateSubmission,
    handleSubmit,
    getFailWarningMessage,
    shouldShowFailWarning,
    getSubmitButtonState,
    getResultSelectionClasses,
    getCurrentDateTime,
  };
};
