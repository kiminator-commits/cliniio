import React, { useState } from 'react';
import { FaLock, FaExclamationCircle } from 'react-icons/fa';
import { LoginFormData } from '../types';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface PasswordFieldProps {
  formData: LoginFormData;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  formData,
  handleChange,
  disabled = false,
  showStrengthIndicator = false,
}) => {
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Real-time password validation
  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8)
      return 'Password must be at least 8 characters long';
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('password')(e);
    setPasswordTouched(true);
  };

  const passwordError = passwordTouched
    ? validatePassword(formData.password)
    : null;

  return (
    <div>
      <span id="passwordHelp" className="sr-only">
        Enter your account password.
      </span>
      <label htmlFor="password" className="sr-only">
        Password
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
          disabled={disabled}
          aria-label="Password"
          aria-describedby="passwordHelp"
          className={`appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200 ${
            passwordError
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
          placeholder="Password"
          value={formData.password}
          onChange={handlePasswordChange}
          onBlur={() => setPasswordTouched(true)}
        />
      </div>

      {/* Enhanced Password Strength Indicator - only show when creating new password */}
      {showStrengthIndicator && (
        <PasswordStrengthIndicator password={formData.password} />
      )}

      {passwordError && (
        <div className="mt-2 flex items-center space-x-2">
          <FaExclamationCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">{passwordError}</p>
        </div>
      )}
    </div>
  );
};

export default PasswordField;
