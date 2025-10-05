import React, { useState, useCallback } from 'react';
import { ErrorReportingService } from '@/services/errorReportingService';
import { logger } from '@/utils/_core/logger';
import {
  FaExclamationTriangle,
  FaUserShield,
  FaTools,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';
import SupportContact from './SupportContact';
import {
  LOGIN_ERROR_MESSAGES,
  ERROR_CATEGORIES,
  ERROR_ACTIONS as _ERROR_ACTIONS,
  ERROR_SEVERITY,
  ERROR_ESCALATION,
} from '@/constants/errorMessages';

interface UserFriendlyErrorHandlerProps {
  error: Error | string;
  context?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

interface ErrorCategory {
  type: 'auth' | 'network' | 'system' | 'validation' | 'unknown';
  title: string;
  message: string;
  action: 'admin' | 'support' | 'retry' | 'none';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const UserFriendlyErrorHandler: React.FC<
  UserFriendlyErrorHandlerProps
> = ({ error, context = 'login', onRetry, onDismiss }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);
  const [showSupportContact, setShowSupportContact] = useState(false);

  // Analyze error and categorize it
  const categorizeError = useCallback(
    (error: Error | string): ErrorCategory => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const lowerMessage = errorMessage.toLowerCase();

      // Authentication errors - direct to admin
      if (
        lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('invalid credentials') ||
        lowerMessage.includes('authentication failed') ||
        lowerMessage.includes('invalid email') ||
        lowerMessage.includes('password') ||
        lowerMessage.includes('login') ||
        lowerMessage.includes('401') ||
        lowerMessage.includes('403')
      ) {
        return {
          type: ERROR_CATEGORIES.AUTH,
          title: 'Login Issue',
          message: LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS,
          action: ERROR_ESCALATION[ERROR_CATEGORIES.AUTH],
          severity: ERROR_SEVERITY.MEDIUM,
        };
      }

      // Network errors - contact support with technical details
      if (
        lowerMessage.includes('network') ||
        lowerMessage.includes('connection') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('http') ||
        lowerMessage.includes('server') ||
        lowerMessage.includes('500') ||
        lowerMessage.includes('502') ||
        lowerMessage.includes('503') ||
        lowerMessage.includes('504')
      ) {
        return {
          type: ERROR_CATEGORIES.NETWORK,
          title: 'Connection Problem',
          message: LOGIN_ERROR_MESSAGES.NETWORK_ERROR,
          action: ERROR_ESCALATION[ERROR_CATEGORIES.NETWORK],
          severity: ERROR_SEVERITY.HIGH,
        };
      }

      // System errors - contact support with technical details
      if (
        lowerMessage.includes('database') ||
        lowerMessage.includes('internal') ||
        lowerMessage.includes('system') ||
        lowerMessage.includes('service') ||
        lowerMessage.includes('unexpected') ||
        lowerMessage.includes('error')
      ) {
        return {
          type: ERROR_CATEGORIES.SYSTEM,
          title: 'System Issue',
          message: LOGIN_ERROR_MESSAGES.INTERNAL_ERROR,
          action: ERROR_ESCALATION[ERROR_CATEGORIES.SYSTEM],
          severity: ERROR_SEVERITY.HIGH,
        };
      }

      // Validation errors - usually user fixable
      if (
        lowerMessage.includes('required') ||
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('format') ||
        lowerMessage.includes('validation')
      ) {
        return {
          type: ERROR_CATEGORIES.VALIDATION,
          title: 'Please Check Your Input',
          message: errorMessage,
          action: ERROR_ESCALATION[ERROR_CATEGORIES.VALIDATION],
          severity: ERROR_SEVERITY.LOW,
        };
      }

      // Default case
      return {
        type: ERROR_CATEGORIES.UNKNOWN,
        title: 'Something Went Wrong',
        message: LOGIN_ERROR_MESSAGES.UNEXPECTED_ERROR,
        action: ERROR_ESCALATION[ERROR_CATEGORIES.UNKNOWN],
        severity: ERROR_SEVERITY.MEDIUM,
      };
    },
    []
  );

  const errorCategory = categorizeError(error);

  // Generate technical report
  const generateTechnicalReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: typeof error === 'string' ? error : error.message,
        stack:
          typeof error === 'object' && error.stack ? error.stack : undefined,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      category: errorCategory,
    };

    return JSON.stringify(report, null, 2);
  }, [error, context, errorCategory]);

  // Copy technical report to clipboard
  const copyTechnicalReport = useCallback(async () => {
    try {
      const report = generateTechnicalReport();
      await navigator.clipboard.writeText(report);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy technical report:', err);
    }
  }, [generateTechnicalReport]);

  // Report error to service
  const reportError = useCallback(() => {
    try {
      ErrorReportingService.reportError(
        typeof error === 'string' ? new Error(error) : error,
        undefined,
        { context, category: errorCategory.type }
      );
      logger.info('Error reported to service');
    } catch (err) {
      logger.error('Failed to report error:', err);
    }
  }, [error, context, errorCategory.type]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'admin':
        return <FaUserShield className="w-5 h-5" />;
      case 'support':
        return <FaTools className="w-5 h-5" />;
      case 'retry':
        return <FaExclamationTriangle className="w-5 h-5" />;
      default:
        return <FaExclamationTriangle className="w-5 h-5" />;
    }
  };

  // Get action text
  const getActionText = (action: string) => {
    switch (action) {
      case 'admin':
        return 'Contact Administrator';
      case 'support':
        return 'Contact Support';
      case 'retry':
        return 'Try Again';
      default:
        return 'Get Help';
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 ${getSeverityColor(errorCategory.severity)}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getActionIcon(errorCategory.action)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{errorCategory.title}</h3>
          <div className="mt-2 text-sm">
            <p>{errorCategory.message}</p>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            {errorCategory.action === 'retry' && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            )}

            {(errorCategory.action === 'admin' ||
              errorCategory.action === 'support') && (
              <button
                onClick={() => {
                  reportError();
                  setShowSupportContact(true);
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {getActionText(errorCategory.action)}
              </button>
            )}

            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
            </button>
          </div>

          {/* Technical details */}
          {showTechnicalDetails && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Technical Report
                </h4>
                <button
                  onClick={copyTechnicalReport}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  {reportCopied ? (
                    <>
                      <FaCheck className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy className="w-3 h-3 mr-1" />
                      Copy Report
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {generateTechnicalReport()}
              </pre>
            </div>
          )}

          {/* Dismiss button */}
          {onDismiss && (
            <div className="mt-3">
              <button
                onClick={onDismiss}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Support Contact Modal */}
      <SupportContact
        isOpen={showSupportContact}
        onClose={() => setShowSupportContact(false)}
        errorContext={context}
        technicalReport={
          showTechnicalDetails ? generateTechnicalReport() : undefined
        }
      />
    </div>
  );
};

export default UserFriendlyErrorHandler;
