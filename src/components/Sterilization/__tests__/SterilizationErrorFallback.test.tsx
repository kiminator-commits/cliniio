import { render, screen } from '@testing-library/react';
import SterilizationErrorFallback from '../SterilizationErrorFallback';
import '@testing-library/jest-dom';

describe('SterilizationErrorFallback', () => {
  it('displays message and retry button', () => {
    render(<SterilizationErrorFallback />);

    expect(
      screen.getByText(/An error occurred while loading sterilization data/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });
});
