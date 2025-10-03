import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiRefresh } from '@mdi/js';

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
 * Props for the BIFailureErrorDisplay component.
 * @interface BIFailureErrorDisplayProps
 * @property {ErrorState | null} error - Current error state
 * @property {() => void} onRetry - Callback function for retry attempts
 * @property {(severity: string) => string} getErrorColor - Function to get error color classes
 */
interface BIFailureErrorDisplayProps {
  error: ErrorState | null;
  onRetry: () => void;
  getErrorColor: (severity: string) => string;
}

/**
 * Error display component for BI Failure Resolution modal.
 * Displays error messages with appropriate styling based on severity level.
 * Provides retry functionality for recoverable errors.
 * Handles accessibility and user feedback for error states.
 *
 * @param {BIFailureErrorDisplayProps} props - Component props containing error state and handlers
 * @returns {JSX.Element | null} Error display component or null if no error
 */
export const BIFailureErrorDisplay: React.FC<BIFailureErrorDisplayProps> = ({
  error,
  onRetry,
  getErrorColor,
}) => {
  if (!error) {
    return null;
  }

  const handleRetry = () => {
    onRetry();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && error.retryable) {
      handleRetry();
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor(error.severity)}`}>
      <div className="flex items-start space-x-3">
        <Icon
          path={mdiAlertCircle}
          size={1.2}
          className="mt-0.5 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">
              {error.severity === 'critical' && 'Critical Error'}
              {error.severity === 'high' && 'High Priority Error'}
              {error.severity === 'medium' && 'Error'}
              {error.severity === 'low' && 'Warning'}
            </h4>
            {error.code && (
              <span className="text-xs font-mono bg-white bg-opacity-75 px-2 py-1 rounded">
                Error Code: {error.code}
              </span>
            )}
          </div>

          <p className="text-sm mb-3">{error.message}</p>

          {error.retryable && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetry}
                onKeyDown={handleKeyDown}
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium bg-white bg-opacity-75 hover:bg-opacity-90 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
                aria-label="Retry the operation"
              >
                <Icon path={mdiRefresh} size={0.9} />
                <span>Retry</span>
              </button>
              <span className="text-xs opacity-75">
                This error may be temporary. You can try again.
              </span>
            </div>
          )}

          {!error.retryable && (
            <p className="text-xs opacity-75">
              This error requires manual intervention. Please contact your
              supervisor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
