import React, { ReactNode } from 'react';
import { mdiAlertCircle, mdiRefresh, mdiHome, mdiReload } from '@mdi/js';
import Icon from '@/components/Icon/Icon';
import {
  KnowledgeHubError,
  ErrorType,
  ErrorSeverity,
} from '../../types/errors';
import { BaseErrorBoundary } from './BaseErrorBoundary';

interface KnowledgeHubErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: KnowledgeHubError) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface KnowledgeHubErrorBoundaryState {
  hasError: boolean;
  error: KnowledgeHubError | null;
  retryCount: number;
  errorCount: number;
  lastErrorTime: Date | null;
}

export class KnowledgeHubErrorBoundary extends BaseErrorBoundary<
  KnowledgeHubErrorBoundaryProps,
  KnowledgeHubErrorBoundaryState
> {
  private retryCount = 0;

  constructor(props: KnowledgeHubErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorCount: 0,
      lastErrorTime: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<KnowledgeHubErrorBoundaryState> {
    const baseState = super.getDerivedStateFromError(error);
    return {
      ...baseState,
      errorCount: 1,
      lastErrorTime: new Date(),
    };
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { error } = this.state;

    if (!error?.retryable || this.retryCount >= maxRetries) {
      return;
    }

    this.retryCount++;
    this.setState({ hasError: false, error: null });

    // Add exponential backoff
    const delay = retryDelay * Math.pow(2, this.retryCount - 1);
    const timeout = setTimeout(() => {
      // Force a re-render to retry the operation
      this.forceUpdate();
    }, delay);

    // Track the timeout to prevent memory leaks
    this.addTimeout(timeout);
  };

  handleReset = () => {
    // Clear all existing timeouts when resetting
    this.clearAllTimeouts();

    this.retryCount = 0;
    this.setState(
      {
        hasError: false,
        error: null,
        errorCount: 0,
        lastErrorTime: null,
      },
      () => {
        // Force a re-render to ensure children are rendered
        this.forceUpdate();
      }
    );
  };

  handleNavigateHome = () => {
    window.location.href = '/';
  };

  renderErrorContent = (error: KnowledgeHubError) => {
    const severity = this.getErrorSeverity(error);
    const { retryable } = error;

    const getSeverityStyles = () => this.getSeverityStyles(severity);

    const getErrorIcon = () => {
      switch (error.type) {
        case ErrorType.NETWORK_ERROR:
        case ErrorType.TIMEOUT_ERROR:
          return mdiRefresh;
        case ErrorType.UNAUTHORIZED:
          return mdiAlertCircle;
        default:
          return mdiAlertCircle;
      }
    };

    const getErrorMessage = () => this.getErrorMessage(error);

    const getActionButtons = () => {
      const buttons = [];

      if (retryable && this.retryCount < (this.props.maxRetries || 3)) {
        buttons.push(
          <button
            key="retry"
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#3db8b0] transition-colors"
          >
            <Icon path={mdiReload} size={0.8} />
            Retry
          </button>
        );
      }

      buttons.push(
        <button
          key="reset"
          onClick={this.handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          <Icon path={mdiRefresh} size={0.8} />
          Reset
        </button>
      );

      if (error.type === ErrorType.UNAUTHORIZED) {
        buttons.push(
          <button
            key="home"
            onClick={this.handleNavigateHome}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Icon path={mdiHome} size={0.8} />
            Go Home
          </button>
        );
      }

      return buttons;
    };

    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${getSeverityStyles()}`}
      >
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex flex-col items-center text-center space-y-4">
            <Icon
              path={getErrorIcon()}
              size={3}
              color={
                severity === ErrorSeverity.CRITICAL ? '#ef4444' : '#f59e0b'
              }
            />

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {error.type ? error.type.replace('_', ' ') : 'UNKNOWN ERROR'}
              </h2>
              <p className="text-gray-600 mb-4">{getErrorMessage()}</p>
              {error.message && (
                <p className="text-sm text-gray-500 mb-4">{error.message}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {getActionButtons()}
            </div>

            {this.renderErrorDetails(error)}

            {this.retryCount > 0 && (
              <p className="text-xs text-gray-500">
                Retry attempt {this.retryCount} of {this.props.maxRetries || 3}
              </p>
            )}
          </div>
        </div>
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
