import React from 'react';
import { FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { LOGIN_LABELS } from '../../constants/loginConstants';
import { rateLimiter } from '../../lib/rateLimiter';
import { LoginFormData, FormErrors } from './types';
import PasswordStrengthIndicator from './components/PasswordStrengthIndicator';

interface Props {
  formData: LoginFormData;
  errors: FormErrors;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LoginFormFields: React.FC<Props> = ({
  formData,
  errors,
  handleChange,
}) => {
  // Get rate limiting info for display
  const remainingAttempts = rateLimiter.getRemainingAttempts(formData.email);
  const isRateLimited = rateLimiter.isRateLimited(formData.email);
  const lockoutTime = rateLimiter.formatLockoutTime(formData.email);

  return (
    <div className="space-y-4 w-full">
      {/* Rate limiting warning */}
      {isRateLimited && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Account temporarily locked</p>
              <p>Please try again in {lockoutTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* Remaining attempts warning */}
      {!isRateLimited && remainingAttempts <= 3 && remainingAttempts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning</p>
              <p>
                {remainingAttempts} login attempt
                {remainingAttempts !== 1 ? 's' : ''} remaining before account
                lockout
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email field */}
      <div>
        <span id="emailHelp" className="sr-only">
          Enter your email address.
        </span>
        <label htmlFor="email" className="sr-only">
          {LOGIN_LABELS.email}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isRateLimited}
            aria-label="Email address"
            aria-describedby="emailHelp"
            className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange('email')}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-2">{errors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div>
        <span id="passwordHelp" className="sr-only">
          Enter your account password.
        </span>
        <label htmlFor="password" className="sr-only">
          {LOGIN_LABELS.password}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isRateLimited}
            aria-label="Password"
            aria-describedby="passwordHelp"
            className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange('password')}
          />
        </div>
        <PasswordStrengthIndicator password={formData.password} />
        {errors.password && (
          <p className="text-red-500 text-sm mt-2">{errors.password}</p>
        )}
      </div>

      {/* OTP field - only show in OTP stage */}
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
            disabled={isRateLimited}
            placeholder="Enter 6-digit code"
            value={formData.otp || ''}
            onChange={handleChange('otp')}
            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-gray-300 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-2">{errors.otp}</p>
          )}
        </div>
      )}

      {/* Remember me and Remember device checkboxes */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              disabled={isRateLimited}
              aria-label={LOGIN_LABELS.rememberMe}
              checked={formData.rememberMe}
              onChange={handleChange('rememberMe')}
              className="h-4 w-4 text-blue-600 focus:outline-none border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              {LOGIN_LABELS.rememberMe}
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="remember-device"
              name="remember-device"
              type="checkbox"
              disabled={isRateLimited}
              aria-label={LOGIN_LABELS.rememberDevice}
              checked={formData.rememberDevice}
              onChange={handleChange('rememberDevice')}
              className="h-4 w-4 text-blue-600 focus:outline-none border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="remember-device"
              className="ml-2 block text-sm text-gray-900"
            >
              {LOGIN_LABELS.rememberDevice}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginFormFields;
