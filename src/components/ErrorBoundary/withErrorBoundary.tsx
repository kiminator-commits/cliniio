import React, { ComponentType } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface WithErrorBoundaryOptions {
  componentName?: string;
  fallback?: React.ComponentType<React.ErrorInfo>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const { componentName, fallback: _fallback, onError: _onError } = options;

  const displayName =
    componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundaryComponent;
}

// Convenience function for wrapping components with specific error handling
export function withComponentErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  return withErrorBoundary(WrappedComponent, {
    componentName,
    onError: (error, errorInfo) => {
      console.error(`Error in ${componentName}:`, error, errorInfo);
    },
  });
}
