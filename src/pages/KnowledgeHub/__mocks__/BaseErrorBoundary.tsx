import React, { Component, ReactNode } from 'react';

interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  componentName?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface BaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
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
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (onError) {
      onError(error);
    }
  }

  componentWillUnmount() {
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

  protected getErrorSeverity(): string {
    return 'MEDIUM';
  }

  protected getSeverityStyles(): string {
    return 'bg-gray-50 border-gray-200 text-gray-800';
  }

  protected getErrorMessage(): string {
    return 'An unexpected error occurred. Please try again or contact support.';
  }

  protected renderErrorDetails() {
    return null;
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

    const timeout = setTimeout(() => {
      this.forceUpdate();
    }, retryDelay);

    this.addTimeout(timeout);
  };

  abstract renderErrorContent(error: Error): ReactNode;

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
