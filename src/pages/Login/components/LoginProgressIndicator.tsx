import React from 'react';
import { LoadingStep } from '@/components/Login/LoginProgressIndicator';
import { LOGIN_CONFIG } from '../../../constants/loginConstants';

interface LoginProgressIndicatorProps {
  loading: boolean;
  loadingStep: LoadingStep;
}

const LoginProgressIndicator: React.FC<LoginProgressIndicatorProps> = ({
  loading,
  loadingStep,
}) => {
  const getProgressBarWidth = (step: LoadingStep) => {
    switch (step) {
      case LOGIN_CONFIG.PROGRESS_STEPS.CONNECTING:
        return 'progress-bar-25';
      case LOGIN_CONFIG.PROGRESS_STEPS.AUTHENTICATING:
        return 'progress-bar-50';
      case LOGIN_CONFIG.PROGRESS_STEPS.VERIFYING:
        return 'progress-bar-75';
      case LOGIN_CONFIG.PROGRESS_STEPS.SUCCESS:
        return 'progress-bar-100';
      default:
        return 'progress-bar-0';
    }
  };

  if (!loading || loadingStep === LOGIN_CONFIG.PROGRESS_STEPS.IDLE) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            {loadingStep === LOGIN_CONFIG.PROGRESS_STEPS.CONNECTING &&
              'Connecting to server...'}
            {loadingStep === LOGIN_CONFIG.PROGRESS_STEPS.AUTHENTICATING &&
              'Authenticating credentials...'}
            {loadingStep === LOGIN_CONFIG.PROGRESS_STEPS.VERIFYING &&
              'Verifying session...'}
            {loadingStep === LOGIN_CONFIG.PROGRESS_STEPS.SUCCESS &&
              'Login successful! Redirecting...'}
          </p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out ${getProgressBarWidth(loadingStep)}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginProgressIndicator;
