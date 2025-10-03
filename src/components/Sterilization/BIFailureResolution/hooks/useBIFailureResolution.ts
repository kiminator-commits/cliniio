import { useCallback, useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { BIFailureIncidentService } from '@/services/bi/failure/BIFailureIncidentService';
import { CreateBIFailureParams } from '@/services/bi/failure/BIFailureValidationService';
import { BIFailureError } from '@/services/bi/failure/BIFailureError';

/**
 * Get current operator ID from Supabase auth service
 * Uses the comprehensive SupabaseAuthService for proper authentication
 */
const getCurrentOperatorId = async (): Promise<string> => {
  try {
    // Import the Supabase auth service
    const { SupabaseAuthService } = await import(
      '@/services/supabase/authService'
    );

    // Get current user from Supabase auth service
    const { user, error } = await SupabaseAuthService.getCurrentUser();

    if (error) {
      console.warn('Auth service error:', error);
    }

    if (user?.id) {
      return user.id;
    }

    // Fallback to session storage for development/testing
    const storedOperatorId =
      sessionStorage.getItem('currentOperatorId') ||
      localStorage.getItem('currentOperatorId');

    if (storedOperatorId) {
      return storedOperatorId;
    }

    // Development fallback for testing
    if (process.env.NODE_ENV === 'development') {
      const devOperatorId = 'dev-operator-001';
      return devOperatorId;
    }

    // Production fallback - this should not happen in production
    console.error(
      'No operator ID found in production. User may not be authenticated.'
    );
    throw new Error('User not authenticated - no operator ID available');
  } catch (error) {
    console.error('Failed to get operator ID:', error);

    // In development, provide a fallback to prevent blocking
    if (process.env.NODE_ENV === 'development') {
      return 'dev-operator-001';
    }

    // In production, re-throw the error to prevent invalid operations
    throw new Error('Authentication required - unable to get operator ID');
  }
};

/**
 * Props for the useBIFailureResolution hook.
 * @interface UseBIFailureResolutionProps
 * @property {() => void} onClose - Callback when the resolution modal is closed
 * @property {() => void} onSuccess - Callback when resolution is successful
 */
interface UseBIFailureResolutionProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Error state interface for BI failure resolution.
 * @interface ErrorState
 */
interface ErrorState {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
}

/**
 * Custom hook that provides logic for managing BI Failure Resolution workflows.
 * Handles incident resolution, error handling, and UI state management.
 * Provides utility functions for resolution workflow and user feedback.
 *
 * @param {UseBIFailureResolutionProps} props - Configuration object containing callbacks
 * @returns {object} Object containing all BI failure resolution logic functions and state
 */
export const useBIFailureResolution = ({
  onClose,
  onSuccess,
}: UseBIFailureResolutionProps) => {
  const { biFailureDetails, deactivateBIFailure } = useSterilizationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [showExposureReport, setShowExposureReport] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  /**
   * Handles the resolution of BI failure incidents with validation and error handling.
   * Processes resolution workflow, shows appropriate error messages, and triggers success callbacks.
   */
  const handleResolve = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get operator ID from auth context or use fallback
      const operatorId = await getCurrentOperatorId();

      // Check if we have a valid incident to resolve
      if (!biFailureDetails) {
        throw new Error('No BI failure incident to resolve');
      }

      // Since the sterilization store doesn't maintain incident IDs, we'll create a new incident
      // and then immediately resolve it, or use a session-based approach
      const incidentId =
        sessionStorage.getItem('currentBIFailureIncidentId') ||
        `temp-${Date.now()}`;

      const _result = await BIFailureIncidentService.resolveIncident({
        incidentId: incidentId,
        resolvedByOperatorId: operatorId,
        resolutionNotes,
      });

      deactivateBIFailure();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to resolve BI failure incident:', error);

      if (error instanceof BIFailureError) {
        setError({
          message: error.message,
          code: error.code,
          severity: error.severity,
          retryable: error.retryable,
        });
      } else if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'BIFailureError'
      ) {
        const biError = error as BIFailureError;
        setError({
          message: biError.message,
          code: biError.code,
          severity: biError.severity,
          retryable: biError.retryable,
        });
      } else {
        setError({
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          severity: 'high',
          retryable: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    resolutionNotes,
    deactivateBIFailure,
    onSuccess,
    onClose,
    biFailureDetails,
  ]);

  /**
   * Creates a new BI failure incident when a failure is detected
   */
  const createIncident = useCallback(
    async (failureData: {
      facilityId: string;
      affectedToolsCount: number;
      affectedBatchIds: string[];
      failureReason?: string;
      severityLevel?: 'low' | 'medium' | 'high' | 'critical';
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        // Get operator ID from auth context or use fallback
        const operatorId = await getCurrentOperatorId();

        const incidentParams: CreateBIFailureParams = {
          facility_id: failureData.facilityId,
          detected_by_operator_id: operatorId,
          affected_tools_count: failureData.affectedToolsCount,
          affected_batch_ids: failureData.affectedBatchIds,
          failure_reason: failureData.failureReason,
          severity_level: failureData.severityLevel || 'high',
        };

        const incident =
          await BIFailureIncidentService.createIncident(incidentParams);

        return incident;
      } catch (error) {
        console.error('Failed to create BI failure incident:', error);

        if (error instanceof BIFailureError) {
          setError({
            message: error.message,
            code: error.code,
            severity: error.severity,
            retryable: error.retryable,
          });
        } else {
          setError({
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create incident',
            severity: 'high',
            retryable: false,
          });
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Handles retry attempts for failed resolution operations.
   */
  const handleRetry = useCallback(() => {
    setError(null);
    handleResolve();
  }, [handleResolve]);

  /**
   * Handles closing the resolution modal and cleaning up state.
   */
  const handleClose = useCallback(() => {
    setError(null);
    setShowExposureReport(false);
    onClose();
  }, [onClose]);

  /**
   * Handles backdrop click events for modal dismissal.
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  /**
   * Handles keyboard events for modal interaction.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  /**
   * Toggles the exposure report display.
   */
  const toggleExposureReport = useCallback(() => {
    setShowExposureReport((prev) => !prev);
  }, []);

  /**
   * Updates resolution notes.
   */
  const updateResolutionNotes = useCallback((notes: string) => {
    setResolutionNotes(notes);
  }, []);

  /**
   * Gets the error icon based on severity level.
   */
  const getErrorIcon = useCallback(() => {
    // This would return the appropriate icon path based on severity
    // Implementation would depend on the icon library being used
    return 'mdiAlertCircle'; // Default icon
  }, []);

  /**
   * Gets the error color classes based on severity level.
   */
  const getErrorColor = useCallback((severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  /**
   * Checks if the resolution button should be disabled.
   */
  const isResolveButtonDisabled = useCallback(() => {
    return isLoading || !biFailureDetails;
  }, [isLoading, biFailureDetails]);

  /**
   * Gets the resolve button text based on current state.
   */
  const getResolveButtonText = useCallback(() => {
    if (isLoading) return 'Resolving...';
    return 'Confirm Resolution';
  }, [isLoading]);

  return {
    // State
    isLoading,
    error,
    showExposureReport,
    resolutionNotes,
    biFailureDetails,

    // Actions
    handleResolve,
    createIncident,
    handleRetry,
    handleClose,
    handleBackdropClick,
    handleKeyDown,
    toggleExposureReport,
    updateResolutionNotes,

    // Utilities
    getErrorIcon,
    getErrorColor,
    isResolveButtonDisabled,
    getResolveButtonText,
  };
};
