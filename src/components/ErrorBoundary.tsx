'use client';

import React from 'react';
import { observabilityService } from '@/services/observability/observabilityService';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('💥 Global Error Boundary caught:', error, errorInfo);

    await observabilityService.logCritical('Global React component crash', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
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
