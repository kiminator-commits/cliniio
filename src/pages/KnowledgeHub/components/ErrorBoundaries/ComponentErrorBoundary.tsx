import React, { ReactNode } from 'react';
import { mdiAlertCircle, mdiRefresh, mdiClose } from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import {
  KnowledgeHubError,
  ErrorType,
  ErrorSeverity,
} from '../../types/errors';
import { BaseErrorBoundary } from './BaseErrorBoundary';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
  onError?: (error: KnowledgeHubError) => void;
  showRetry?: boolean;
  className?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export class ComponentErrorBoundary extends BaseErrorBoundary<ComponentErrorBoundaryProps> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleDismiss = () => {
    this.setState(
      {
        hasError: false,
        error: null,
      },
      () => {
        // Force a re-render to ensure children are rendered
        this.forceUpdate();
      }
    );
  };

  renderErrorContent = (error: KnowledgeHubError) => {
    const { componentName, showRetry = true, className = '' } = this.props;
    const severity = this.getErrorSeverity(error);

    const getSeverityStyles = () => this.getSeverityStyles(severity);

    const getErrorMessage = () => {
      switch (error.type) {
        case ErrorType.NETWORK_ERROR:
          return 'Failed to load data. Please check your connection.';
        case ErrorType.VALIDATION_ERROR:
          return 'Invalid data received.';
        case ErrorType.CONTENT_NOT_FOUND:
          return 'Content not available.';
        case ErrorType.OPERATION_FAILED:
          return 'Operation failed. Please try again.';
        case ErrorType.UNAUTHORIZED:
          return 'Access denied. Please log in again.';
        case ErrorType.RATE_LIMIT_EXCEEDED:
          return 'Too many requests. Please wait and try again.';
        case ErrorType.SERVER_ERROR:
          return 'Server error. Please try again later.';
        case ErrorType.TIMEOUT_ERROR:
          return 'Request timed out. Please try again.';
        default:
          return 'Component encountered an error.';
      }
    };

    return (
      <div
        className={`p-4 rounded-lg border ${getSeverityStyles()} ${className}`}
      >
        <div className="flex items-start space-x-3">
          <Icon
            path={mdiAlertCircle}
            size={1.2}
            color={severity === ErrorSeverity.CRITICAL ? '#ef4444' : '#f59e0b'}
            className="flex-shrink-0 mt-0.5"
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {componentName} Error
            </h3>
            <p className="text-sm text-gray-600 mb-2">{getErrorMessage()}</p>

            <div className="flex items-center space-x-2">
              {showRetry && error.retryable && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
                >
                  <Icon path={mdiRefresh} size={0.6} />
                  Retry
                </button>
              )}

              <button
                onClick={this.handleDismiss}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
              >
                <Icon path={mdiClose} size={0.6} />
                Dismiss
              </button>
            </div>
          </div>
        </div>

        {this.renderErrorDetails(error)}
      </div>
    );
  };

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
