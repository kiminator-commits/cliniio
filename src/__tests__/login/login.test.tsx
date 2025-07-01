import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UIProvider } from '../../contexts/UIContext';
import LoginForm from '../../pages/Login/LoginForm';
import { LOGIN_LABELS } from '../../constants/loginConstants';
import LoginPage from '../../pages/Login';

describe('LoginForm', () => {
  it('renders login form fields', async () => {
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

    expect(screen.getByLabelText(LOGIN_LABELS.email)).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_LABELS.password)).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_LABELS.rememberMe)).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_LABELS.rememberDevice)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: LOGIN_LABELS.submit })).toBeInTheDocument();
  });
});

describe('Login Page', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <LoginPage />
        </UIProvider>
      </MemoryRouter>
    );
    // ... existing code ...
  });

  it('handles form submission', () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <LoginPage />
        </UIProvider>
      </MemoryRouter>
    );
    // ... existing code ...
  });
});
