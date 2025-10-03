import React, { useRef, useEffect, useState } from 'react';
import { FaUser, FaExclamationCircle } from 'react-icons/fa';
import { LoginFormData } from '../types';

interface EmailFieldProps {
  formData: LoginFormData;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const EmailField: React.FC<EmailFieldProps> = ({
  formData,
  handleChange,
  disabled = false,
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  // Auto-focus email field on component mount
  useEffect(() => {
    if (emailInputRef.current && !disabled) {
      emailInputRef.current.focus();
    }
  }, [disabled]);

  // Real-time email validation
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('email')(e);
    setEmailTouched(true);
  };

  const emailError = emailTouched ? validateEmail(formData.email) : null;

  return (
    <div>
      <span id="emailHelp" className="sr-only">
        Enter your email address.
      </span>
      <label htmlFor="email" className="sr-only">
        Email
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
          disabled={disabled}
          aria-label="Email address"
          aria-describedby="emailHelp"
          className={`appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200 ${
            emailError
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
          placeholder="Email address"
          value={formData.email}
          onChange={handleEmailChange}
          onBlur={() => setEmailTouched(true)}
          ref={emailInputRef}
        />
      </div>
      {emailError && (
        <div className="mt-2 flex items-center space-x-2">
          <FaExclamationCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">{emailError}</p>
        </div>
      )}
    </div>
  );
};

export default EmailField;
