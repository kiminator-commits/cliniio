import React, { useState, useEffect } from 'react';
// Production-ready home page component
import Icon from '@mdi/react';
import {
  mdiPackage,
  mdiShieldCheck,
  mdiAccountMultiple,
  mdiFileDocument,
  mdiCheck,
  mdiAccount as _mdiAccount,
  mdiClock as _mdiClock,
  mdiAlertCircle,
} from '@mdi/js';
import { useUser } from '@/contexts/UserContext';

/**
 * Props for the BIFailureWorkflowSteps component.
 * @interface BIFailureWorkflowStepsProps
 * @property {boolean} showExposureReport - Whether to show the exposure report section
 * @property {() => void} onToggleExposureReport - Callback to toggle exposure report visibility
 */
interface BIFailureWorkflowStepsProps {
  showExposureReport: boolean;
  onToggleExposureReport: () => void;
}

/**
 * Workflow steps component for BI Failure Resolution modal.
 * Displays the step-by-step resolution process including quarantine, re-sterilization,
 * new BI test, documentation, and supervisor approval.
 * Provides clear guidance for operators during the resolution process.
 *
 * @param {BIFailureWorkflowStepsProps} props - Component props containing exposure report state and toggle callback
 * @returns {JSX.Element} Workflow steps display component with resolution guidance
 */
// Function to clear workflow state (can be called from parent components)
export const clearBIFailureWorkflowState = () => {
  sessionStorage.removeItem('biFailureWorkflowState');
  console.log('🗑️ Cleared BI failure workflow state');
};

export const BIFailureWorkflowSteps: React.FC<BIFailureWorkflowStepsProps> = ({
  onToggleExposureReport,
}) => {
  const { currentUser, initializeUserContext } = useUser();

  // Ensure user context is initialized when workflow opens
  useEffect(() => {
    if (!currentUser) {
      initializeUserContext();
    }
  }, [currentUser, initializeUserContext]);

  // Local workflow state (no database dependency)
  const [workflowProgress, setWorkflowProgress] = useState<
    {
      step_id: string;
      status: 'pending' | 'in_progress' | 'completed';
      completed_by_user_id?: string;
      completed_at?: string;
      notes?: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize workflow steps on component mount
  useEffect(() => {
    const initializeWorkflow = () => {
      setIsLoading(true);

      // Check if workflow state exists in session storage
      const savedWorkflowState = sessionStorage.getItem(
        'biFailureWorkflowState'
      );

      if (savedWorkflowState) {
        try {
          const parsedState = JSON.parse(savedWorkflowState);
          setWorkflowProgress(parsedState);
          console.log('📋 Restored workflow state from session storage');
        } catch (error) {
          console.error('Failed to parse saved workflow state:', error);
          // Fall back to initial steps
          createInitialSteps();
        }
      } else {
        createInitialSteps();
      }

      setIsLoading(false);
    };

    const createInitialSteps = () => {
      const initialSteps = [
        { step_id: 'quarantine', status: 'in_progress' as const },
        { step_id: 're-sterilization', status: 'pending' as const },
        { step_id: 'new-bi-test', status: 'pending' as const },
        { step_id: 'documentation', status: 'pending' as const },
      ];
      setWorkflowProgress(initialSteps);
    };

    initializeWorkflow();
  }, []);

  const handleStepComplete = async (stepId: string) => {
    if (!currentUser) {
      console.error('No current user available - currentUser:', currentUser);
      return;
    }

    // Use user ID if available, otherwise fall back to email
    const userId = currentUser.id || currentUser.email || 'unknown-user';

    // Find the current step index first
    const currentStepIndex = workflowProgress.findIndex(
      (step) => step.step_id === stepId
    );

    if (currentStepIndex === -1) {
      console.error(`Step ${stepId} not found`);
      return;
    }

    try {
      // Update local workflow state
      const updatedSteps = [...workflowProgress];

      // Mark current step as completed
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        status: 'completed',
        completed_by_user_id: userId,
        completed_at: new Date().toISOString(),
        notes: `Completed by ${currentUser.email}`,
      };

      // Mark next step as in_progress (if exists)
      if (currentStepIndex + 1 < updatedSteps.length) {
        updatedSteps[currentStepIndex + 1] = {
          ...updatedSteps[currentStepIndex + 1],
          status: 'in_progress',
        };
      }

      // Update state
      setWorkflowProgress(updatedSteps);

      // Save to session storage
      sessionStorage.setItem(
        'biFailureWorkflowState',
        JSON.stringify(updatedSteps)
      );

      console.log(
        `✅ Step ${stepId} completed by ${currentUser.email || 'unknown user'}`
      );
    } catch (error) {
      console.error(`Failed to complete step ${stepId}:`, error);
      setError(
        `Failed to complete step: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Helper function to get step status from workflow progress
  const getStepStatus = (
    stepId: string
  ): 'pending' | 'in_progress' | 'completed' => {
    const step = workflowProgress.find((s) => s.step_id === stepId);
    return (
      (step?.status as 'pending' | 'in_progress' | 'completed') || 'pending'
    );
  };

  // Helper function to check if step can be completed (is next in sequence)
  const canCompleteStep = (stepId: string): boolean => {
    const step = workflowProgress.find((s) => s.step_id === stepId);
    return step?.status === 'in_progress';
  };

  // Helper function to get step completion info
  const getStepCompletionInfo = (stepId: string) => {
    const step = workflowProgress.find((s) => s.step_id === stepId);
    return {
      completedBy: step?.completed_by_user_id,
      completedAt: step?.completed_at,
      notes: step?.notes,
    };
  };

  // Create reactive workflow steps that update with state changes
  const workflowSteps = [
    {
      id: 'quarantine',
      title: 'Quarantine All Affected Tools',
      description:
        'Ensure all tools from affected batches are properly quarantined',
      icon: mdiPackage,
      isInteractive: true,
    },
    {
      id: 're-sterilization',
      title: 'Re-sterilize All Quarantined Tools',
      description: 'Re-sterilize all affected tools using proper protocols',
      icon: mdiShieldCheck,
      isInteractive: true,
    },
    {
      id: 'new-bi-test',
      title: 'Perform New BI Test',
      description:
        'Conduct a new biological indicator test to verify sterilization',
      icon: mdiShieldCheck,
      isInteractive: true,
    },
    {
      id: 'documentation',
      title: 'Complete Documentation',
      description: 'Document all actions taken and results obtained',
      icon: mdiFileDocument,
      isInteractive: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Resolution Workflow Steps
        </h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">
            Loading workflow progress...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Resolution Workflow Steps
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <Icon
              path={mdiAlertCircle}
              size={1.2}
              className="text-red-500 mr-2"
            />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Resolution Workflow Steps
      </h3>

      <div className="space-y-3">
        {workflowSteps.map((step) => {
          const status = getStepStatus(step.id);
          const isCompleted = status === 'completed';
          const _isInProgress = status === 'in_progress';
          const isPending = status === 'pending';
          const canComplete = canCompleteStep(step.id);
          const completionInfo = getStepCompletionInfo(step.id);

          return (
            <div
              key={step.id}
              className={`border rounded-lg p-4 ${
                isPending
                  ? 'text-gray-400 bg-gray-50 border-gray-200'
                  : getStatusColor(status)
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  path={step.icon}
                  size={1.2}
                  className="mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <div className="flex items-center space-x-2">
                      {canComplete ? (
                        <button
                          onClick={() => handleStepComplete(step.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                        >
                          <Icon path={mdiCheck} size={0.8} />
                          <span>Mark Complete</span>
                        </button>
                      ) : isCompleted ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-75">
                          {getStatusText(status)}
                        </span>
                      ) : isPending ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-500">
                          Waiting for previous step
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm opacity-90">{step.description}</p>

                  {/* Show completion details for completed steps */}
                  {step.isInteractive && isCompleted && (
                    <div className="mt-2 text-xs opacity-75">
                      <div className="flex items-center space-x-4">
                        <span>
                          ✅ Completed by:{' '}
                          {completionInfo.completedBy || 'Unknown'}
                        </span>
                        <span>
                          🕒{' '}
                          {completionInfo.completedAt
                            ? new Date(
                                completionInfo.completedAt
                              ).toLocaleString()
                            : 'Unknown time'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Exposure Tracking */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon
              path={mdiAccountMultiple}
              size={1.2}
              className="text-blue-500"
            />
            <span className="font-medium text-blue-800">Exposure Tracking</span>
          </div>
          <button
            onClick={onToggleExposureReport}
            onKeyDown={(e) => e.key === 'Enter' && onToggleExposureReport()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            aria-label="View exposure report"
          >
            View Exposure Report
          </button>
        </div>
      </div>
    </div>
  );
};
