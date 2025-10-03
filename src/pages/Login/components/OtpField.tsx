import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import { LoginFormData } from '../types';

interface OtpFieldProps {
  formData: LoginFormData;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const OtpField: React.FC<OtpFieldProps> = ({
  formData,
  handleChange,
  disabled = false,
}) => {
  const [otpTouched, setOtpTouched] = useState(false);

  // Real-time OTP validation
  const validateOtp = (otp: string): string | null => {
    if (!otp) return 'Verification code is required';
    if (otp.length !== 6) return 'Verification code must be 6 digits';
    if (!/^\d{6}$/.test(otp))
      return 'Verification code must contain only numbers';
    return null;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('otp')(e);
    setOtpTouched(true);
  };

  const otpError = otpTouched ? validateOtp(formData.otp || '') : null;

  // Only show OTP field in OTP stage
  if (formData.stage !== 'otp') return null;

  return (
    <div>
      <label htmlFor="otp" className="sr-only">
        One-time code
      </label>
      <input
        id="otp"
        name="otp"
        type="text"
        maxLength={6}
        disabled={disabled}
        placeholder="Enter 6-digit code"
        value={formData.otp || ''}
        onChange={handleOtpChange}
        onBlur={() => setOtpTouched(true)}
        className={`appearance-none rounded-lg relative block w-full px-3 py-3 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 sm:text-sm transition-colors duration-200 ${
          otpError
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
      />
      {otpError && (
        <div className="mt-2 flex items-center space-x-2">
          <FaExclamationCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600">{otpError}</p>
        </div>
      )}
    </div>
  );
};

export default OtpField;
