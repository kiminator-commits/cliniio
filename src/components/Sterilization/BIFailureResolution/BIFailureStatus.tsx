import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

/**
 * Props for the BIFailureStatus component.
 * @interface BIFailureStatusProps
 * @property {object} biFailureDetails - Details of the current BI failure incident
 */
interface BIFailureStatusProps {
  biFailureDetails: {
    date: Date;
    affectedToolsCount: number;
    affectedBatchIds: string[];
    operator: string;
  } | null;
}

/**
 * Status component for BI Failure Resolution modal.
 * Displays the current incident status, affected tools count, failure date, and affected batches.
 * Provides clear visual indication of the current BI failure state.
 *
 * @param {BIFailureStatusProps} props - Component props containing BI failure details
 * @returns {JSX.Element} Status display component with incident information
 */
export const BIFailureStatus: React.FC<BIFailureStatusProps> = ({
  biFailureDetails,
}) => {
  if (!biFailureDetails) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon path={mdiAlertCircle} size={1.2} className="text-red-500" />
          <span className="font-medium text-red-800">
            Current Status: BI Failure Active
          </span>
        </div>
        <div className="text-sm text-red-700 space-y-1">
          <p>
            <strong>Affected Tools:</strong> 0 tools are currently quarantined
          </p>
          <p>
            <strong>Failure Date:</strong> Unknown date
          </p>
          <p>
            <strong>Affected Batches:</strong> No batch IDs available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <Icon path={mdiAlertCircle} size={1.2} className="text-red-500" />
        <span className="font-medium text-red-800">
          Current Status: BI Failure Active
        </span>
      </div>
      <div className="text-sm text-red-700 space-y-1">
        <p>
          <strong>Affected Tools:</strong> {biFailureDetails.affectedToolsCount}{' '}
          tools are currently quarantined
        </p>
        <p>
          <strong>Failure Date:</strong>{' '}
          {biFailureDetails.date
            ? biFailureDetails.date.toLocaleDateString()
            : 'Unknown date'}
        </p>
        <p>
          <strong>Detected By:</strong> {biFailureDetails.operator}
        </p>
        <p>
          <strong>Affected Batches:</strong>{' '}
          {biFailureDetails.affectedBatchIds.length > 0 ? (
            <span className="font-mono text-xs">
              {biFailureDetails.affectedBatchIds.join(', ')}
            </span>
          ) : (
            'No batch IDs available'
          )}
        </p>
      </div>
    </div>
  );
};
