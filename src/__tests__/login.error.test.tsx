import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    jest.restoreAllMocks();
  });

  it('displays fallback UI when error occurs', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    await act(async () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
    });

    // Wait for the error boundary to catch and handle the error
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
