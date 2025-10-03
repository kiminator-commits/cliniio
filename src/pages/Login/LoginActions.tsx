import React from 'react';
import { LOGIN_LABELS } from '../../constants/loginConstants';
import { FaExclamationTriangle } from 'react-icons/fa';

import { LoginFormData, FormErrors } from './types';

interface Props {
  loading: boolean;
  loadingStep?:
    | 'idle'
    | 'connecting'
    | 'authenticating'
    | 'verifying'
    | 'success';
  errors: FormErrors;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  formData: LoginFormData;
}

const LoginActions: React.FC<Props> = ({
  loading,
  loadingStep = 'idle',
  errors,
  onSubmit,
  onForgotPassword,
  formData,
}) => (
  <>
    {errors.submit && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">{errors.submit}</p>
            <button
              type="button"
              onClick={onSubmit}
              className="mt-2 text-sm text-red-600 hover:text-red-800 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )}
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
            {loadingStep === 'connecting' && LOGIN_LABELS.connecting}
            {loadingStep === 'authenticating' && LOGIN_LABELS.authenticating}
            {loadingStep === 'verifying' && LOGIN_LABELS.verifying}
            {loadingStep === 'success' && LOGIN_LABELS.success}
            {loadingStep === 'idle' && LOGIN_LABELS.authenticating}
          </>
        ) : formData.stage === 'credentials' ? (
          LOGIN_LABELS.submit
        ) : (
          'Verify'
        )}
      </button>
    </div>
    <div className="text-center">
      <div className="mt-4 text-center flex items-center justify-center">
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={loading}
          className={`text-sm text-[#4ECDC4] hover:text-[#45b7af] cursor-pointer focus:outline-none transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  </>
);

export default LoginActions;
