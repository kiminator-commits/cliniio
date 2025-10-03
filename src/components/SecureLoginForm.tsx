// Secure login form component using the new authentication system
import React, { useState } from 'react';
import { useSecureAuth } from '../hooks/useSecureAuth';

interface SecureLoginFormProps {
  onLoginSuccess?: (user: unknown) => void;
  onLoginError?: (error: string) => void;
  className?: string;
  showMigrationStatus?: boolean;
}

export const SecureLoginForm: React.FC<SecureLoginFormProps> = ({
  onLoginSuccess,
  onLoginError,
  className = '',
  showMigrationStatus = true,
}) => {
  const { login, isLoading, error, migrationStatus } = useSecureAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remainingAttempts: number;
    resetTime: number;
  } | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setRateLimitInfo(null);

    try {
      const result = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result.success) {
        onLoginSuccess?.(formData.email);
        // Form will be reset by parent component or redirect
      } else {
        if (result.rateLimitInfo) {
          setRateLimitInfo(result.rateLimitInfo);
        }
        onLoginError?.(result.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      onLoginError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format rate limit reset time
  const formatResetTime = (resetTime: number): string => {
    const now = Date.now();
    const timeLeft = Math.max(0, resetTime - now);
    const minutes = Math.ceil(timeLeft / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  // Check if form is disabled
  const isFormDisabled = isLoading || isSubmitting || migrationStatus.isRunning;

  return (
    <div className={`secure-login-form ${className}`}>
      {/* Migration Status */}
      {showMigrationStatus && migrationStatus.isRunning && (
        <div className="migration-status">
          <div className="migration-progress">
            <h3>Updating Security System</h3>
            <p>Please wait while we update your authentication system...</p>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(migrationStatus.stepsCompleted.length / 5) * 100}%` 
                }}
              />
            </div>
            <div className="migration-steps">
              {migrationStatus.stepsCompleted.map((step, _index) => (
                <div key={step} className="step completed">
                  ✓ {step.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Migration Errors */}
      {showMigrationStatus && migrationStatus.errors.length > 0 && (
        <div className="migration-errors">
          <h3>Migration Failed</h3>
          <p>There was an error updating the security system:</p>
          <ul>
            {migrationStatus.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <p>Please refresh the page to try again.</p>
        </div>
      )}

      {/* Login Form */}
      {!migrationStatus.isRunning && (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-header">
            <h2>Secure Login</h2>
            <p>Sign in to your account</p>
          </div>

          {/* Global Error */}
          {error && (
            <div className="error-message global-error">
              {error}
            </div>
          )}

          {/* Rate Limit Warning */}
          {rateLimitInfo && (
            <div className="rate-limit-warning">
              <h4>Rate Limit Exceeded</h4>
              <p>
                Too many login attempts. Please try again in{' '}
                {formatResetTime(rateLimitInfo.resetTime)}.
              </p>
              <p>
                Remaining attempts: {rateLimitInfo.remainingAttempts}
              </p>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              className={formErrors.email ? 'error' : ''}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
            {formErrors.email && (
              <span className="field-error">{formErrors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isFormDisabled}
              className={formErrors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            {formErrors.password && (
              <span className="field-error">{formErrors.password}</span>
            )}
          </div>

          {/* Remember Me */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isFormDisabled}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isFormDisabled}
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Security Notice */}
          <div className="security-notice">
            <p>
              <strong>🔒 Secure Authentication:</strong> This login uses advanced 
              security features including rate limiting, threat detection, and 
              cryptographic verification.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default SecureLoginForm;
