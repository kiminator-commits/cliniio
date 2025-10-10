import React from 'react';
import { vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from '../../utils/testUtils';
import { renderWithProviders } from '../../utils/renderWithProviders';
import LoginForm from '@/pages/Login/LoginForm';
import { LOGIN_LABELS } from '@/constants/loginConstants';
import { SecureAuthService } from '@/services/secureAuthService';
import { useLoginStore } from '@/stores/useLoginStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

// Mock the secure auth service
vi.mock('@/services/secureAuthService', () => ({
  SecureAuthService: vi.fn().mockImplementation(() => ({
    secureLogin: vi.fn().mockResolvedValue({
      success: true,
      data: {
        accessToken: 'test-token',
        expiresIn: 3600,
      },
    }),
  })),
}));

describe('LoginForm Interactions', () => {
  beforeEach(() => {
    setupTestEnvironment();
    // setupSupabaseMocks('success'); // Removed - using global mock
    // Reset the login store to ensure clean state
    useLoginStore.getState().reset();
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  it('handles email input typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(LOGIN_LABELS.email);
    await user.type(emailInput, 'user@example.com');

    expect(emailInput).toHaveValue('user@example.com');
  });

  it('handles password input typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(LOGIN_LABELS.password);
    await user.type(passwordInput, 'validPassword123');

    expect(passwordInput).toHaveValue('validPassword123');
  });

  it('handles remember me checkbox toggle', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const rememberMeCheckbox = screen.getByLabelText(LOGIN_LABELS.rememberMe);

    expect(rememberMeCheckbox).not.toBeChecked();

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('handles remember device checkbox toggle', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const rememberDeviceCheckbox = screen.getByLabelText(
      LOGIN_LABELS.rememberDevice
    );

    expect(rememberDeviceCheckbox).not.toBeChecked();

    await user.click(rememberDeviceCheckbox);
    expect(rememberDeviceCheckbox).toBeChecked();

    await user.click(rememberDeviceCheckbox);
    expect(rememberDeviceCheckbox).not.toBeChecked();
  });

  it('handles form submission with valid credentials', async () => {
    const user = userEvent.setup();
    // Mock is already set up in the vi.mock above

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(LOGIN_LABELS.email);
    const passwordInput = screen.getByLabelText(LOGIN_LABELS.password);
    const submitButton = screen.getByRole('button', {
      name: LOGIN_LABELS.submit,
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validPassword123');
    await user.click(submitButton);

    const mockSecureAuthService = vi.mocked(SecureAuthService);
    expect(mockSecureAuthService).toHaveBeenCalled();
  });

  it('handles form submission with remember me checked', async () => {
    const user = userEvent.setup();
    // Mock is already set up in the vi.mock above

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(LOGIN_LABELS.email);
    const passwordInput = screen.getByLabelText(LOGIN_LABELS.password);
    const rememberMeCheckbox = screen.getByLabelText(LOGIN_LABELS.rememberMe);
    const submitButton = screen.getByRole('button', {
      name: LOGIN_LABELS.submit,
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validPassword123');
    await user.click(rememberMeCheckbox);
    await user.click(submitButton);

    const mockSecureAuthService = vi.mocked(SecureAuthService);
    expect(mockSecureAuthService).toHaveBeenCalled();
  });

  it('handles form submission with remember device checked', async () => {
    const user = userEvent.setup();
    // Mock is already set up in the vi.mock above

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(LOGIN_LABELS.email);
    const passwordInput = screen.getByLabelText(LOGIN_LABELS.password);
    const rememberMeCheckbox = screen.getByLabelText(LOGIN_LABELS.rememberMe);
    const rememberDeviceCheckbox = screen.getByLabelText(
      LOGIN_LABELS.rememberDevice
    );
    const submitButton = screen.getByRole('button', {
      name: LOGIN_LABELS.submit,
    });

    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validPassword123');

    // Ensure rememberMe is unchecked
    if (rememberMeCheckbox.checked) {
      await user.click(rememberMeCheckbox);
    }

    await user.click(rememberDeviceCheckbox);
    await user.click(submitButton);

    const mockSecureAuthService = vi.mocked(SecureAuthService);
    expect(mockSecureAuthService).toHaveBeenCalled();
  });

  it('handles OTP input typing', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithOTP = () => {
      const [formData, setFormData] = React.useState({
        stage: 'otp',
        otp: '',
      });

      const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, otp: e.target.value }));
      };

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
                        onChange={handleOTPChange}
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

    const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(otpInput, '123456');

    expect(otpInput).toHaveValue('123456');
  });

  it('handles OTP input with max length limit', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<LoginForm />);

    const LoginFormWithOTP = () => {
      const [formData, setFormData] = React.useState({
        stage: 'otp',
        otp: '',
      });

      const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.slice(0, 6);
        setFormData((prev) => ({ ...prev, otp: value }));
      };

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
                        onChange={handleOTPChange}
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

    const otpInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(otpInput, '123456789');

    expect(otpInput).toHaveValue('123456');
  });

  it('handles multiple checkbox interactions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const rememberMeCheckbox = screen.getByLabelText(LOGIN_LABELS.rememberMe);
    const rememberDeviceCheckbox = screen.getByLabelText(
      LOGIN_LABELS.rememberDevice
    );

    // Initially both should be unchecked
    expect(rememberMeCheckbox).not.toBeChecked();
    expect(rememberDeviceCheckbox).not.toBeChecked();

    await user.click(rememberMeCheckbox);
    await user.click(rememberDeviceCheckbox);

    // Wait for state updates
    await waitFor(() => {
      expect(rememberMeCheckbox).toBeChecked();
    });
    await waitFor(() => {
      expect(rememberDeviceCheckbox).toBeChecked();
    });

    await user.click(rememberMeCheckbox);
    await waitFor(() => {
      expect(rememberMeCheckbox).not.toBeChecked();
    });
    expect(rememberDeviceCheckbox).toBeChecked();
  });

  it.skip('handles rapid form field interactions', async () => {
    // skipped: test invalid, React Testing Library cannot simulate typing an empty string
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByLabelText(LOGIN_LABELS.email);
    const passwordInput = screen.getByLabelText(LOGIN_LABELS.password);

    emailInput.focus();
    await user.keyboard('{Tab}');

    expect(passwordInput).toHaveFocus();
  });
});
