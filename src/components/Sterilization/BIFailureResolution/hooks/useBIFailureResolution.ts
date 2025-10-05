import { useCallback, useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { BIFailureIncidentService } from '@/services/bi/failure/BIFailureIncidentService';
import { CreateBIFailureParams } from '@/services/bi/failure/BIFailureValidationService';
import { BIFailureError } from '@/services/bi/failure/BIFailureError';
import { supabase } from '@/lib/supabaseClient';

/**
 * Shows a Cliniio-style success notification
 */
const showSuccessNotification = (title: string, message: string) => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `
    fixed top-4 right-4 z-[10000] bg-white border-l-4 border-green-500 
    shadow-lg rounded-lg p-4 max-w-md transform transition-all duration-300 
    animate-slide-in-right
  `;
  notification.style.cssText = `
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  `;

  notification.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-800">${title}</h3>
          <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-600">${message}</p>
      </div>
    </div>
  `;

  // Add CSS animation keyframes if not already present
  if (!document.getElementById('cliniio-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'cliniio-notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Add to DOM
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
};

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

      // Check if we have a stored incident ID that exists in the database
      const storedIncidentId = sessionStorage.getItem(
        'currentBIFailureIncidentId'
      );

      if (storedIncidentId) {
        // Try to resolve the existing incident
        const _result = await BIFailureIncidentService.resolveIncident({
          incidentId: storedIncidentId,
          resolvedByOperatorId: operatorId,
          resolutionNotes,
        });

        console.log('✅ BI Failure Resolution completed:', {
          incidentId: storedIncidentId,
          resolvedByOperatorId: operatorId,
          resolutionNotes,
          timestamp: new Date().toISOString(),
        });

        // Show success notification
        showSuccessNotification(
          'BI Failure Incident Resolved',
          'The BI failure incident has been successfully resolved and logged in the system.'
        );

        // Refresh BI test results to ensure analytics shows the latest data
        setTimeout(() => {
          const sterilizationStore = useSterilizationStore.getState();
          if (sterilizationStore.loadBITestResults) {
            sterilizationStore.loadBITestResults(
              '550e8400-e29b-41d4-a716-446655440000'
            );
            console.log(
              '🔄 Refreshed BI test results after incident resolution'
            );
          }
        }, 1000);
      } else {
        // Create a new BI failure incident first, then resolve it
        const facilityId = '550e8400-e29b-41d4-a716-446655440000'; // Default facility

        // Create incident directly in database with correct schema
        const { data: incidentData, error: createError } = await supabase
          .from('bi_failure_incidents')
          .insert({
            facility_id: facilityId,
            user_id: operatorId,
            incident_type: 'bi_test_failure',
            severity: 'high',
            status: 'open',
            description: 'BI Test Failure - Contamination Detected',
            failure_reason:
              'Biological indicator test failed, indicating sterilization failure',
            metadata: {
              affected_tools_count: biFailureDetails?.affectedToolsCount || 1,
              affected_batch_ids: biFailureDetails?.affectedBatchIds || [
                'DEFAULT-BATCH',
              ],
            },
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create incident: ${createError.message}`);
        }

        // Now resolve the newly created incident
        const _result = await BIFailureIncidentService.resolveIncident({
          incidentId: incidentData.id,
          resolvedByOperatorId: operatorId,
          resolutionNotes,
        });

        // Add activity log entry for the resolved incident
        const sterilizationStore = useSterilizationStore.getState();
        if (sterilizationStore.addActivity) {
          sterilizationStore.addActivity({
            id: `bi-incident-resolved-${incidentData.id}`,
            type: 'incident-resolution',
            title: 'BI Failure Incident Resolved',
            time: new Date(),
            toolCount: biFailureDetails?.affectedToolsCount || 1,
            color: 'bg-blue-500',
            metadata: {
              incidentId: incidentData.id,
              operatorId: operatorId,
              resolutionNotes: resolutionNotes,
            },
          });
        }

        // Show success notification
        showSuccessNotification(
          'BI Failure Incident Resolved',
          'The BI failure incident has been successfully resolved and logged in the system.'
        );

        // Refresh BI test results to ensure analytics shows the latest data
        setTimeout(() => {
          const sterilizationStore = useSterilizationStore.getState();
          if (sterilizationStore.loadBITestResults) {
            sterilizationStore.loadBITestResults(
              '550e8400-e29b-41d4-a716-446655440000'
            );
            console.log(
              '🔄 Refreshed BI test results after incident resolution'
            );
          }
        }, 1000);

        console.log('✅ BI Failure Resolution completed:', {
          incidentId: incidentData.id,
          resolvedByOperatorId: operatorId,
          resolutionNotes,
          timestamp: new Date().toISOString(),
        });

        // Store the real incident ID for future reference
        sessionStorage.setItem('currentBIFailureIncidentId', incidentData.id);
      }

      // Update local state to reflect resolution
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
