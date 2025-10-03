import React from 'react';
import {
  mdiAlertCircle,
  mdiRefresh,
  mdiClose,
  mdiInformation,
  mdiExclamation,
} from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import {
  KnowledgeHubError,
  ErrorType,
  getErrorSeverity,
  ErrorSeverity,
} from '../../types/errors';

interface ErrorDisplayProps {
  error: KnowledgeHubError;
  onRetry?: () => void;
  onDismiss?: () => void;
  onAction?: (action: string) => void;
  showDetails?: boolean;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  onAction,
  showDetails = false,
  className = '',
  variant = 'card',
}) => {
  const severity = getErrorSeverity(error);

  const getSeverityStyles = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: '#ef4444',
          button: 'bg-red-100 hover:bg-red-200 text-red-800',
        };
      case ErrorSeverity.HIGH:
        return {
          container: 'bg-orange-50 border-orange-200 text-orange-800',
          icon: '#f97316',
          button: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
        };
      case ErrorSeverity.MEDIUM:
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: '#eab308',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
        };
      case ErrorSeverity.LOW:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: '#3b82f6',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: '#6b7280',
          button: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        };
    }
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
        return mdiRefresh;
      case ErrorType.UNAUTHORIZED:
        return mdiExclamation;
      case ErrorType.VALIDATION_ERROR:
        return mdiInformation;
      default:
        return mdiAlertCircle;
    }
  };

  const getErrorMessage = () => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return 'Connection issue detected. Please check your internet connection and try again.';
      case ErrorType.TIMEOUT_ERROR:
        return 'The request took too long to complete. Please try again.';
      case ErrorType.UNAUTHORIZED:
        return 'Your session has expired. Please log in again to continue.';
      case ErrorType.VALIDATION_ERROR:
        return 'The data provided is invalid. Please check your input and try again.';
      case ErrorType.CONTENT_NOT_FOUND:
        return 'The requested content could not be found.';
      case ErrorType.OPERATION_FAILED:
        return 'The operation failed. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'inline':
        return 'p-2 rounded text-sm';
      case 'banner':
        return 'p-3 rounded-lg border-l-4';
      case 'card':
      default:
        return 'p-4 rounded-lg border shadow-sm';
    }
  };

  const styles = getSeverityStyles();
  const variantStyles = getVariantStyles();

  return (
    <div className={`${styles.container} ${variantStyles} ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon
          path={getErrorIcon()}
          size={variant === 'inline' ? 1 : 1.2}
          color={styles.icon}
          className="flex-shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium mb-1 ${variant === 'inline' ? 'text-sm' : 'text-base'}`}
          >
            {error.type ? error.type.replace('_', ' ') : 'UNKNOWN ERROR'}
          </h3>
          <p
            className={`text-gray-600 mb-2 ${variant === 'inline' ? 'text-xs' : 'text-sm'}`}
          >
            {getErrorMessage()}
          </p>

          {error.message && error.message !== getErrorMessage() && (
            <p
              className={`text-gray-500 mb-2 ${variant === 'inline' ? 'text-xs' : 'text-sm'}`}
            >
              {error.message}
            </p>
          )}

          {error.context && showDetails && (
            <div className="mb-2">
              <p
                className={`text-gray-500 ${variant === 'inline' ? 'text-xs' : 'text-sm'}`}
              >
                Component: {error.context.component || 'Unknown'}
                {error.context.action && ` | Action: ${error.context.action}`}
                {error.context.contentId &&
                  ` | Content ID: ${error.context.contentId}`}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {error.retryable && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${styles.button}`}
              >
                <Icon path={mdiRefresh} size={0.6} />
                Retry
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${styles.button}`}
              >
                <Icon path={mdiClose} size={0.6} />
                Dismiss
              </button>
            )}

            {error.type === ErrorType.UNAUTHORIZED && onAction && (
              <button
                onClick={() => onAction('login')}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {showDetails && process.env.NODE_ENV === 'development' && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
            Error Details
          </summary>
          <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
