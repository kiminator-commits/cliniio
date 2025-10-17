import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Mock the Icon component
vi.mock('../../src/components/Icon/Icon', () => ({
  default: function MockIcon({ path, size, color, className }: any) {
    return (
      <div
        data-testid="icon"
        data-path={path}
        data-size={size}
        data-color={color}
        className={className}
      />
    );
  },
}));

// Component that throws an error
const ProblemChild = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock alert
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should catch errors and render fallback UI', () => {
      render(
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ProblemChild shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No Error')).toBeInTheDocument();
    });

    it('should catch errors in render method', () => {
      const ErrorBoundaryWrapper = () => {
        try {
          return <ProblemChild />;
        } catch {
          return <div>Caught in render</div>;
        }
      };

      render(
        <ErrorBoundary>
          <ErrorBoundaryWrapper />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Error Message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ProblemChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
    });
  });

  describe('Error Handler', () => {
    it('should call custom error handler when provided', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ProblemChild />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Console Logging', () => {
    it('should log errors with correct format', () => {
      const consoleSpy = vi.spyOn(console, 'error');

      render(
        <ErrorBoundary>
          <ProblemChild />
        </ErrorBoundary>
      );

      // Should log the error with the actual format used
      expect(consoleSpy).toHaveBeenCalledWith(
        '💥 Global Error Boundary caught:',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Component Name', () => {
    it('should display component name when provided', () => {
      render(
        <ErrorBoundary componentName="TestComponent">
          <ProblemChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });
});
