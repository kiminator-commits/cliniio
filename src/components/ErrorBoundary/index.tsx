import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from 'react-error-boundary';
import { reportError } from '@/services/errorReportingService';

/**
 * Simple error fallback component
 */
const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div
      className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg"
      data-testid="error-boundary"
    >
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 mb-4">
        We're sorry, but something unexpected happened.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4">
          <summary className="cursor-pointer text-red-700 font-medium">
            Error details
          </summary>
          <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
};

/**
 * Error boundary wrapper that uses react-error-boundary
 * This provides consistent error handling across the application
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback = ErrorFallback,
  onError,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report error to error reporting service
    reportError(error, errorInfo, {
      component: 'ErrorBoundary',
      page: window.location.pathname,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary FallbackComponent={fallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
