import { render, screen } from '@testing-library/react';
import SterilizationErrorFallback from '../../../src/components/Sterilization/SterilizationErrorFallback';
import '@testing-library/jest-dom';
import { describe, test, expect, it } from 'vitest';

describe('SterilizationErrorFallback', () => {
  it('displays message and retry button', () => {
    render(<SterilizationErrorFallback />);

    expect(
      screen.getByText(/An error occurred while loading sterilization data/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Refresh Page/i)).toBeInTheDocument();
  });
});
