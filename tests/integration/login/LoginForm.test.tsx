import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from '@/components/Login/LoginForm';

describe('LoginForm', () => {
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

  test('should display email validation error if email is empty', () => {
    const formStateWithEmailError = {
      ...defaultFormState,
      emailError: 'Email is required',
    };

    render(<LoginForm {...defaultProps} formState={formStateWithEmailError} />);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  test('should display email validation error if email is invalid', () => {
    const formStateWithEmailError = {
      ...defaultFormState,
      emailError: 'Email is not valid',
    };

    render(<LoginForm {...defaultProps} formState={formStateWithEmailError} />);

    expect(screen.getByText(/email is not valid/i)).toBeInTheDocument();
  });

  test('should display password validation error if password is empty', () => {
    const formStateWithPasswordError = {
      ...defaultFormState,
      passwordError: 'Password is required',
    };

    render(
      <LoginForm {...defaultProps} formState={formStateWithPasswordError} />
    );

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  test('should fail login with invalid credentials', async () => {
    const formStateWithError = {
      ...defaultFormState,
      error: 'Invalid credentials',
    };

    render(<LoginForm {...defaultProps} formState={formStateWithError} />);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('should show loading state when logging in', () => {
    const formStateWithLoading = {
      ...defaultFormState,
      loading: true,
    };

    render(<LoginForm {...defaultProps} formState={formStateWithLoading} />);

    expect(screen.getByText(/logging in.../i)).toBeInTheDocument();
  });
});
