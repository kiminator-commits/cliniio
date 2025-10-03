import React from 'react';

interface TableErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface TableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

class TableErrorBoundary extends React.Component<
  TableErrorBoundaryProps,
  TableErrorBoundaryState
> {
  constructor(props: TableErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TableErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Table Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Table Error</h3>
          <p className="text-red-600 text-sm mt-1">
            Something went wrong with the table display. Please refresh the
            page.
          </p>
          {this.state.error && (
            <details className="mt-2">
              <summary className="text-red-600 text-sm cursor-pointer">
                Error Details
              </summary>
              <pre className="text-xs text-red-500 mt-1 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default TableErrorBoundary;
