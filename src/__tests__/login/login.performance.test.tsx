import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIProvider } from '../../contexts/UIContext';
import LoginForm from '../../pages/Login/LoginForm';

describe('LoginForm Performance', () => {
  it.skip('renders within acceptable time', async () => {
    const start = performance.now();

    await act(async () => {
      render(
        <MemoryRouter>
          <UIProvider>
            <LoginForm />
          </UIProvider>
        </MemoryRouter>
      );
    });

    // Wait for lazy-loaded components to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading Social Logins...')).not.toBeInTheDocument();
    });

    const end = performance.now();
    const renderTime = end - start;
    expect(renderTime).toBeLessThan(200); // 200ms threshold
  });
});
