import React, { Component, ReactNode } from 'react';

interface LoginErrorBoundaryProps {
  children: ReactNode;
}

interface LoginErrorBoundaryState {
  hasError: boolean;
}

class LoginErrorBoundary extends Component<
  LoginErrorBoundaryProps,
  LoginErrorBoundaryState
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong. Please try again later.</h2>;
    }
    return this.props.children;
  }
}

export default LoginErrorBoundary;
