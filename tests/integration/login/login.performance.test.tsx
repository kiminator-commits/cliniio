import React from 'react';
import { waitFor, screen, act } from '@testing-library/react';
import { renderWithProviders } from '../../utils/renderWithProviders';
import LoginForm from '@/pages/Login/LoginForm';

describe('LoginForm Performance', () => {
  it('renders within acceptable time', async () => {
    const start = performance.now();

    await act(async () => {
      renderWithProviders(<LoginForm />);
    });

    // Wait for lazy-loaded components to finish loading
    await waitFor(() => {
      expect(
        screen.queryByText('Loading Social Logins...')
      ).not.toBeInTheDocument();
    });

    const end = performance.now();
    const renderTime = end - start;
    expect(renderTime).toBeLessThan(1000); // 1000ms threshold - more realistic for test environment
  });
});
