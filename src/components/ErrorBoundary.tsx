import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  static defaultProps = {
    fallback: <div>Something went wrong.</div>,
  };

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Only log in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      console.error('[ErrorBoundary]', { error, info });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }

    try {
      return this.props.children;
    } catch (error) {
      this.setState({ hasError: true, error: error as Error });
      return this.props.fallback || <div>Something went wrong.</div>;
    }
  }
}
