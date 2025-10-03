import { Component, ReactNode } from 'react';
import { mdiAlertCircle, mdiRefresh, mdiBug, mdiInformation } from '@mdi/js';
import Icon from './Icon/Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: unknown) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: unknown;
}

interface ErrorAnalysis {
  type: 'hook_import' | 'syntax' | 'runtime' | 'network' | 'unknown';
  message: string;
  solution: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    fallback: <div>Something went wrong.</div>,
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Only log in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('[ErrorBoundary]', { error, errorInfo });
    }

    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private analyzeError = (error: Error): ErrorAnalysis => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Check for React hook import errors
    if (
      (message.includes('is not defined') && stack.includes('useref')) ||
      stack.includes('useeffect') ||
      stack.includes('usestate')
    ) {
      return {
        type: 'hook_import',
        message: 'Missing React Hook Import',
        solution:
          'Add the missing hook to your React import statement. For example: import React, { useState, useEffect, useRef } from "react";',
        severity: 'medium',
      };
    }

    // Check for other common React errors
    if (message.includes('hooks') && message.includes('rules')) {
      return {
        type: 'hook_import',
        message: 'React Hooks Rules Violation',
        solution:
          'Ensure hooks are called at the top level of your component, not inside loops, conditions, or nested functions.',
        severity: 'high',
      };
    }

    // Check for syntax errors
    if (error.name === 'SyntaxError' || message.includes('syntax')) {
      return {
        type: 'syntax',
        message: 'Syntax Error',
        solution:
          'Check your code for missing brackets, semicolons, or other syntax issues. The error details below may help identify the problem.',
        severity: 'high',
      };
    }

    // Check for reference errors
    if (error.name === 'ReferenceError') {
      return {
        type: 'runtime',
        message: 'Reference Error',
        solution:
          "A variable or function is being used before it's defined. Check your imports and variable declarations.",
        severity: 'medium',
      };
    }

    // Check for network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('http')
    ) {
      return {
        type: 'network',
        message: 'Network Error',
        solution:
          'Check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.',
        severity: 'medium',
      };
    }

    // Default case
    return {
      type: 'unknown',
      message: 'Unexpected Error',
      solution:
        'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
      severity: 'medium',
    };
  };

  private getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReportError = () => {
    const { error, errorInfo } = this.state;
    const { componentName } = this.props;

    // Create error report
    const errorReport = {
      component: componentName || 'Unknown Component',
      error: error?.message,
      stack: error?.stack,
      errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error Report:', errorReport);

    // In a real app, you would send this to your error reporting service
    // For now, we'll just show an alert
    alert('Error report has been generated. Thank you for your feedback.');
  };

  private renderErrorContent = () => {
    const { error } = this.state;
    const { componentName } = this.props;

    if (!error) return null;

    const analysis = this.analyzeError(error);
    const severityColor = this.getSeverityColor(analysis.severity);

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="flex items-start space-x-4">
            <Icon
              path={mdiAlertCircle}
              size={2}
              color={severityColor}
              className="flex-shrink-0 mt-1"
            />

            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {analysis.message}
                </h2>
                {componentName && (
                  <p className="text-sm text-gray-600 mb-3">
                    Error occurred in:{' '}
                    <span className="font-medium">{componentName}</span>
                  </p>
                )}
                <p className="text-gray-700 mb-4">{analysis.solution}</p>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Icon path={mdiRefresh} size={1} />
                  Try Again
                </button>

                <button
                  onClick={this.handleReportError}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Icon path={mdiBug} size={1} />
                  Report Error
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="border border-gray-200 rounded-lg">
                  <summary className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100">
                    <Icon path={mdiInformation} size={1} />
                    <span className="font-medium">
                      Error Details (Development)
                    </span>
                  </summary>
                  <div className="p-4 bg-gray-50">
                    <div className="mb-3">
                      <strong>Error Type:</strong> {error.name}
                    </div>
                    <div className="mb-3">
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderErrorContent();
    }

    try {
      return this.props.children;
    } catch (error) {
      this.setState({ hasError: true, error: error as Error });
      return this.props.fallback || this.renderErrorContent();
    }
  }
}
