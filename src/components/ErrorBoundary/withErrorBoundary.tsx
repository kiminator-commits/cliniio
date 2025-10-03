import React, { ComponentType } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface WithErrorBoundaryOptions {
  componentName?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: unknown) => void;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const { componentName, fallback, onError } = options;

  const displayName =
    componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary
        componentName={displayName}
        fallback={fallback}
        onError={onError}
      >
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
