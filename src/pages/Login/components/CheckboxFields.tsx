import React from 'react';
import { LoginFormData } from '../types';
import { LOGIN_LABELS } from '../../../constants/loginConstants';

interface CheckboxFieldsProps {
  formData: LoginFormData;
  handleChange: (
    field: keyof LoginFormData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const CheckboxFields: React.FC<CheckboxFieldsProps> = ({
  formData,
  handleChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            disabled={disabled}
            aria-label={LOGIN_LABELS.rememberMe}
            checked={formData.rememberMe}
            onChange={handleChange('rememberMe')}
            className={`h-4 w-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <label
            htmlFor="remember-me"
            className={`ml-2 block text-sm transition-colors duration-200 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}
          >
            {LOGIN_LABELS.rememberMe}
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="remember-device"
            name="remember-device"
            type="checkbox"
            disabled={disabled}
            aria-label={LOGIN_LABELS.rememberDevice}
            checked={formData.rememberDevice}
            onChange={handleChange('rememberDevice')}
            className={`h-4 w-4 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <label
            htmlFor="remember-device"
            className={`ml-2 block text-sm transition-colors duration-200 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}
          >
            {LOGIN_LABELS.rememberDevice}
          </label>
        </div>
      </div>
    </div>
  );
};

export default CheckboxFields;
