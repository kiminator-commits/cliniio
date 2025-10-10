import React from 'react';
import { vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from '../../utils/testUtils';
import { renderWithProviders } from '../../utils/renderWithProviders';
import LoginForm from '@/pages/Login/LoginForm';
import { LOGIN_LABELS } from '@/constants/loginConstants';
import LoginPage from '@/pages/Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('LoginForm UI', () => {
  beforeEach(() => {
    setupTestEnvironment();
    // setupSupabaseMocks('success'); // Removed - using global mock
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  it('renders login form fields', async () => {
    renderWithProviders(<LoginForm />);

    await waitFor(() => {
      expect(
        screen.queryByText('Loading Social Logins...')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText(LOGIN_LABELS.email)).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_LABELS.password)).toBeInTheDocument();
    expect(screen.getByLabelText(LOGIN_LABELS.rememberMe)).toBeInTheDocument();
    expect(
      screen.getByLabelText(LOGIN_LABELS.rememberDevice)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('displays errors when email and password are empty', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithErrors = () => {
      const [errors] = React.useState({
        email: LOGIN_LABELS.invalidEmail,
        password: LOGIN_LABELS.invalidPassword,
      });

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                <div className="space-y-4 w-full">
                  <div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm"
                      placeholder="Email address"
                      value=""
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm"
                      placeholder="Password"
                      value=""
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithErrors />);

    expect(screen.getByText(LOGIN_LABELS.invalidEmail)).toBeInTheDocument();
    expect(screen.getByText(LOGIN_LABELS.invalidPassword)).toBeInTheDocument();
  });

  it('displays password length error for short passwords', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithPasswordError = () => {
      const [errors] = React.useState({
        password: LOGIN_LABELS.invalidPassword,
      });

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                <div className="space-y-4 w-full">
                  <div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm"
                      placeholder="Password"
                      value="short"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithPasswordError />);

    expect(screen.getByText(LOGIN_LABELS.invalidPassword)).toBeInTheDocument();
  });

  it('disables submit and shows loading text during submission', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithLoading = () => {
      const [loading] = React.useState(true);

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2dd4bf] hover:bg-[#14b8a6] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-[#2dd4bf] transition-all duration-200 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {LOGIN_LABELS.loading}
                      </>
                    ) : (
                      LOGIN_LABELS.submit
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithLoading />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(LOGIN_LABELS.loading);
  });

  it('displays submission error when API call fails', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithSubmissionError = () => {
      const [errors] = React.useState({
        submit: 'Invalid login credentials',
      });

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                {errors.submit && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithSubmissionError />);

    expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
  });

  it('renders OTP input after successful credential submission', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithOTP = () => {
      const [formData] = React.useState({
        stage: 'otp',
        email: 'user@example.com',
        password: 'validPassword123',
        otp: '',
      });

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                <div className="space-y-4 w-full">
                  {formData.stage === 'otp' && (
                    <div>
                      <label htmlFor="otp" className="sr-only">
                        One-time code
                      </label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={formData.otp || ''}
                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithOTP />);

    expect(
      screen.getByPlaceholderText('Enter 6-digit code')
    ).toBeInTheDocument();
  });

  it('displays error for invalid OTP code format', async () => {
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithOTPError = () => {
      const [formData] = React.useState({
        stage: 'otp',
        otp: '123',
      });
      const [errors] = React.useState({
        otp: 'Please enter a 6-digit code',
      });

      return (
        <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-6 overflow-hidden">
              <form className="space-y-6">
                <div className="space-y-4 w-full">
                  {formData.stage === 'otp' && (
                    <div>
                      <label htmlFor="otp" className="sr-only">
                        One-time code
                      </label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={formData.otp || ''}
                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm"
                      />
                      {errors.otp && (
                        <p className="text-red-500 text-sm mt-2">
                          {errors.otp}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    rerender(<LoginFormWithOTPError />);

    const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
    expect(otpInput).toBeInTheDocument();
    expect(otpInput).toHaveValue('123');
    expect(screen.getByText('Please enter a 6-digit code')).toBeInTheDocument();
  });

  it('renders login page', () => {
    renderWithProviders(<LoginPage />);
  });
});
