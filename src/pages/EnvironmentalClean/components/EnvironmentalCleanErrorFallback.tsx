import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiRefresh, mdiHome, mdiHelpCircle } from '@mdi/js';

interface EnvironmentalCleanErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const EnvironmentalCleanErrorFallback: React.FC<
  EnvironmentalCleanErrorFallbackProps
> = ({ error, resetErrorBoundary }) => {
  const getErrorDetails = (error: Error) => {
    // Categorize errors for better user guidance
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        title: 'Connection Error',
        description:
          'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try refreshing the page or check your network connection.',
        severity: 'warning' as const,
      };
    }

    if (
      error.message.includes('permission') ||
      error.message.includes('unauthorized')
    ) {
      return {
        title: 'Access Denied',
        description: "You don't have permission to access this feature.",
        suggestion:
          'Contact your administrator if you believe this is an error.',
        severity: 'error' as const,
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to complete.',
        suggestion:
          'Try again in a moment. If the problem persists, contact support.',
        severity: 'warning' as const,
      };
    }

    return {
      title: 'Unexpected Error',
      description:
        'Something went wrong while loading the Environmental Clean module.',
      suggestion:
        'Try refreshing the page. If the problem continues, contact support.',
      severity: 'error' as const,
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              errorDetails.severity === 'error' ? 'bg-red-100' : 'bg-yellow-100'
            }`}
          >
            <Icon
              path={mdiAlertCircle}
              size={2}
              className={
                errorDetails.severity === 'error'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }
            />
          </div>

          {/* Error Title */}
          <h2
            className={`text-xl font-semibold mb-2 ${
              errorDetails.severity === 'error'
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}
          >
            {errorDetails.title}
          </h2>

          {/* Error Description */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            {errorDetails.description}
          </p>

          {/* Technical Details (collapsible for debugging) */}
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center">
              <Icon path={mdiHelpCircle} size={0.8} className="mr-1" />
              Technical Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 break-all">
              {error.message}
              {error.stack && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="text-xs text-gray-500">Stack trace:</div>
                  <div className="mt-1">{error.stack}</div>
                </div>
              )}
            </div>
          </details>

          {/* Suggestion */}
          <p className="text-sm text-gray-600 mb-6">
            💡 {errorDetails.suggestion}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetErrorBoundary}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon path={mdiRefresh} size={0.8} className="mr-2" />
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Icon path={mdiHome} size={0.8} className="mr-2" />
              Go Home
            </button>
          </div>

          {/* Support Contact */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Still having trouble? Contact support at{' '}
              <a
                href="mailto:support@cliniio.com"
                className="text-blue-600 hover:underline"
              >
                support@cliniio.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCleanErrorFallback;
