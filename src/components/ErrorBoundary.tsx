'use client';

import React from 'react';
import { observabilityService } from '@/services/observability/observabilityService';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?:
    | React.ComponentType<{ error?: Error; errorInfo?: React.ErrorInfo }>
    | React.ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 Global Error Boundary caught:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    await observabilityService.logCritical('Global React component crash', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        // Check if it's a React element (JSX) or a component type
        if (React.isValidElement(this.props.fallback)) {
          return this.props.fallback;
        } else {
          const FallbackComponent = this.props.fallback as React.ComponentType<{
            error?: Error;
            errorInfo?: React.ErrorInfo;
          }>;
          return (
            <FallbackComponent error={this.state.error} errorInfo={undefined} />
          );
        }
      }

      // Default fallback UI
      return (
        <div className="p-6 text-center text-red-700 bg-red-50 rounded-xl">
          <h2 className="font-semibold mb-2">Something went wrong.</h2>
          <p className="text-sm opacity-75">
            The team has been notified and is investigating.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
