import React from 'react';
import { useLoginForm } from './hooks/useLoginForm';
import { useLoginStore } from '@/stores/useLoginStore';
import LoginHeader from './LoginHeader';
import LoginFooter from './LoginFooter';
import EmailField from './components/EmailField';
import PasswordField from './components/PasswordField';
import CheckboxFields from './components/CheckboxFields';
import OtpField from './components/OtpField';
import LoginProgressIndicator from './components/LoginProgressIndicator';
import LoadingIndicator from './components/LoadingIndicator';
import SecurityWarnings from './components/SecurityWarnings';
import OfflineWarning from './components/OfflineWarning';
import { ErrorBoundary } from '../../components/ErrorBoundary';

const LoginForm: React.FC = () => {
  const {
    formData,
    errors,
    loading,
    loadingStep,
    handleChange,
    handleSubmit,
    handleForgotPassword,
  } = useLoginForm();
  
  const { csrfToken, isSecureMode } = useLoginStore();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email.trim()) {
      return;
    }
    if (!formData.password.trim()) {
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedPassword = formData.password;

    // Secure CSRF token validation
    const validateCsrfToken = () => {
      if (!isSecureMode) return true; // Skip validation in non-secure mode
      return !!csrfToken && csrfToken.length > 0;
    };
    
    const logSecurityEvent = (event: string, user: string, reason?: string) => {
      console.log(
        `[SECURITY] ${event} for user: ${user}`,
        reason ? `Reason: ${reason}` : ''
      );
    };

    await handleSubmit(
      sanitizedEmail,
      sanitizedPassword,
      validateCsrfToken,
      logSecurityEvent
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <LoginHeader />

          <form className="mt-8 space-y-6" onSubmit={handleFormSubmit}>
            {/* Hidden CSRF token field for secure authentication */}
            {isSecureMode && csrfToken && (
              <input
                type="hidden"
                name="csrfToken"
                value={csrfToken}
              />
            )}
            
            <div className="space-y-4">
              <EmailField
                formData={formData}
                handleChange={handleChange}
                disabled={loading}
              />

              <PasswordField
                formData={formData}
                handleChange={handleChange}
                disabled={loading}
              />

              <CheckboxFields
                formData={formData}
                handleChange={handleChange}
                disabled={loading}
              />
            </div>

            {formData.stage === 'otp' && (
              <OtpField
                formData={formData}
                handleChange={handleChange}
                disabled={loading}
              />
            )}

            <SecurityWarnings />
            <OfflineWarning />

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.submit}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <LoadingIndicator
                    loading={loading}
                    loadingStep={loadingStep}
                  />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {loading && loadingStep && (
              <LoginProgressIndicator
                loading={loading}
                loadingStep={loadingStep}
              />
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          <LoginFooter />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LoginForm;
