import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnvironmentalCleanErrorFallback from '@/pages/EnvironmentalClean/components/EnvironmentalCleanErrorFallback';

describe('EnvironmentalCleanErrorFallback', () => {
  it('displays error message and retry button', () => {
    const error = new Error('Test error message');
    const resetErrorBoundary = vi.fn();

    render(
      <EnvironmentalCleanErrorFallback
        error={error}
        resetErrorBoundary={resetErrorBoundary}
      />
    );

    expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /Try Again/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(resetErrorBoundary).toHaveBeenCalled();
  });
});
