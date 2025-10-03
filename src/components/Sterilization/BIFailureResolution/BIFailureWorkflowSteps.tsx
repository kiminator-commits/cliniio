import React from 'react';
import Icon from '@mdi/react';
import {
  mdiPackage,
  mdiShieldCheck,
  mdiAccountMultiple,
  mdiFileDocument,
} from '@mdi/js';

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
export const BIFailureWorkflowSteps: React.FC<BIFailureWorkflowStepsProps> = ({
  onToggleExposureReport,
}) => {
  const workflowSteps = [
    {
      id: 'quarantine',
      title: 'Quarantine All Affected Tools',
      description:
        'Ensure all tools from affected batches are properly quarantined',
      icon: mdiPackage,
      status: 'completed',
    },
    {
      id: 're-sterilization',
      title: 'Re-sterilize All Quarantined Tools',
      description: 'Re-sterilize all affected tools using proper protocols',
      icon: mdiShieldCheck,
      status: 'pending',
    },
    {
      id: 'new-bi-test',
      title: 'Perform New BI Test',
      description:
        'Conduct a new biological indicator test to verify sterilization',
      icon: mdiShieldCheck,
      status: 'pending',
    },
    {
      id: 'documentation',
      title: 'Complete Documentation',
      description: 'Document all actions taken and results obtained',
      icon: mdiFileDocument,
      status: 'pending',
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Resolution Workflow Steps
      </h3>

      <div className="space-y-3">
        {workflowSteps.map((step) => (
          <div
            key={step.id}
            className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}
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
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-75">
                    {getStatusText(step.status)}
                  </span>
                </div>
                <p className="text-sm opacity-90">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
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
            <span className="font-medium text-blue-800">
              Patient Exposure Tracking
            </span>
          </div>
          <button
            onClick={onToggleExposureReport}
            onKeyDown={(e) => e.key === 'Enter' && onToggleExposureReport()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            aria-label="View patient exposure report"
          >
            View Patient Exposure Report
          </button>
        </div>
      </div>
    </div>
  );
};
