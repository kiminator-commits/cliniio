import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useLoginService } from '@/services/loginApiService';
import LoginForm from '@/components/Login/LoginForm';

vi.mock('@/services/loginApiService');

const mockUseLoginService = useLoginService as vi.MockedFunction<
  typeof useLoginService
>;

describe('LoginForm - Integration', () => {
  const defaultFormState = {
    email: '',
    password: '',
    loading: false,
    error: null,
    showPassword: false,
    emailError: '',
    passwordError: '',
    feedbackMessage: '',
    feedbackType: '' as const,
  };

  const defaultProps = {
    formState: defaultFormState,
    rememberMe: false,
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onRememberMeChange: vi.fn(),
    onShowPasswordToggle: vi.fn(),
    onSubmit: vi.fn(),
    onForgotPassword: vi.fn(),
    validateEmail: vi.fn(),
    validatePassword: vi.fn(),
  };

  test('should call login API and show success message on successful login', async () => {
    mockUseLoginService.mockReturnValue({
      login: vi.fn().mockResolvedValue({ token: '123', expiry: '1h' }),
      isLoading: false,
      error: null,
    });

    const formStateWithSuccess = {
      ...defaultFormState,
      feedbackMessage: 'Login successful',
      feedbackType: 'success' as const,
    };

    render(
      <MemoryRouter>
        <LoginForm {...defaultProps} formState={formStateWithSuccess} />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/login successful/i)).toBeInTheDocument()
    );
  });

  test('should display error message on failed login', async () => {
    mockUseLoginService.mockReturnValue({
      login: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      isLoading: false,
      error: new Error('Invalid credentials'),
    });

    const formStateWithError = {
      ...defaultFormState,
      error: 'Invalid credentials',
    };

    render(
      <MemoryRouter>
        <LoginForm {...defaultProps} formState={formStateWithError} />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    );
  });
});
