import React, { Component, ReactNode } from 'react';
import {
  KnowledgeHubError,
  ErrorType,
  ErrorSeverity,
  ApiError,
} from '../../types/errors';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: KnowledgeHubError) => void;
  componentName?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  error: KnowledgeHubError | null;
  retryCount: number;
}

export abstract class BaseErrorBoundary<
  P extends BaseErrorBoundaryProps = BaseErrorBoundaryProps,
  S extends BaseErrorBoundaryState = BaseErrorBoundaryState,
> extends Component<P, S> {
  protected retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: P) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    } as S;
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<BaseErrorBoundaryState> {
    // Convert React error to KnowledgeHubError
    let errorType: ErrorType;
    let retryable = false;
    let severity: ErrorSeverity;

    if (error instanceof ApiError) {
      errorType = error.type;
      retryable = error.retryable;
      severity = error.severity;
    } else {
      // Classify unknown errors
      const message = error.message.toLowerCase();

      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection')
      ) {
        errorType = ErrorType.NETWORK_ERROR;
        retryable = true;
        severity = ErrorSeverity.HIGH;
      } else if (message.includes('timeout')) {
        errorType = ErrorType.TIMEOUT_ERROR;
        retryable = true;
        severity = ErrorSeverity.MEDIUM;
      } else if (message.includes('auth') || message.includes('unauthorized')) {
        errorType = ErrorType.UNAUTHORIZED;
        retryable = false;
        severity = ErrorSeverity.CRITICAL;
      } else if (
        message.includes('validation') ||
        message.includes('invalid')
      ) {
        errorType = ErrorType.VALIDATION_ERROR;
        retryable = false;
        severity = ErrorSeverity.MEDIUM;
      } else if (message.includes('not found') || message.includes('404')) {
        errorType = ErrorType.CONTENT_NOT_FOUND;
        retryable = false;
        severity = ErrorSeverity.LOW;
      } else {
        errorType = ErrorType.OPERATION_FAILED;
        retryable = true;
        severity = ErrorSeverity.MEDIUM;
      }
    }

    const knowledgeHubError: KnowledgeHubError = {
      type: errorType,
      message: error.message,
      timestamp: new Date(),
      retryable,
      severity,
      context: {
        component: 'BaseErrorBoundary',
        operation: error.name,
      },
    };

    return {
      hasError: true,
      error: knowledgeHubError,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, componentName } = this.props;
    const { error: currentError } = this.state;

    console.error(
      `ErrorBoundary caught an error${componentName ? ` in ${componentName}` : ''}:`,
      error,
      errorInfo
    );

    if (currentError && onError) {
      onError(currentError);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Production error logging:', {
        error: currentError,
        errorInfo,
        timestamp: new Date().toISOString(),
      });
    }
  }

  componentWillUnmount() {
    // Clear all timeouts to prevent memory leaks
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts = [];
  }

  protected clearAllTimeouts() {
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts = [];
  }

  protected addTimeout(timeout: NodeJS.Timeout) {
    this.retryTimeouts.push(timeout);
  }

  protected getErrorSeverity(error: KnowledgeHubError): ErrorSeverity {
    return error.severity;
  }

  protected getSeverityStyles(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'bg-red-50 border-red-200 text-red-800';
      case ErrorSeverity.HIGH:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  protected getErrorMessage(error: KnowledgeHubError): string {
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
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment and try again.';
      case ErrorType.SERVER_ERROR:
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }

  protected renderErrorDetails(error: KnowledgeHubError) {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <details className="w-full mt-4">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Error Details
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(error, null, 2)}
        </pre>
      </details>
    );
  }

  protected handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Force re-render after a delay
    const timeout = setTimeout(() => {
      this.forceUpdate();
    }, retryDelay);

    this.addTimeout(timeout);
  };

  abstract renderErrorContent(error: KnowledgeHubError): ReactNode;

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }
      return this.renderErrorContent(error);
    }

    return children;
  }
}
