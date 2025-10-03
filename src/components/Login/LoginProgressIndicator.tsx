import React from 'react';

export type LoadingStep =
  | 'idle'
  | 'connecting'
  | 'authenticating'
  | 'verifying'
  | 'success';

interface LoginProgressIndicatorProps {
  loading: boolean;
  loadingStep: LoadingStep;
  className?: string;
}

export const LoginProgressIndicator: React.FC<LoginProgressIndicatorProps> = ({
  loading,
  loadingStep,
  className = '',
}) => {
  if (!loading || loadingStep === 'idle') {
    return null;
  }

  const getStepMessage = (step: LoadingStep): string => {
    switch (step) {
      case 'connecting':
        return 'Connecting to server...';
      case 'authenticating':
        return 'Authenticating credentials...';
      case 'verifying':
        return 'Verifying session...';
      case 'success':
        return 'Login successful! Redirecting...';
      default:
        return 'Processing...';
    }
  };

  const getStepProgress = (step: LoadingStep): number => {
    switch (step) {
      case 'connecting':
        return 25;
      case 'authenticating':
        return 50;
      case 'verifying':
        return 75;
      case 'success':
        return 100;
      default:
        return 0;
    }
  };

  const getStepColor = (step: LoadingStep): string => {
    switch (step) {
      case 'success':
        return 'bg-green-600';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div
      className={`mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className={`animate-spin h-5 w-5 ${loadingStep === 'success' ? 'text-green-600' : 'text-blue-600'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            {loadingStep === 'success' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            ) : (
              <>
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
              </>
            )}
          </svg>
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              loadingStep === 'success' ? 'text-green-900' : 'text-blue-900'
            }`}
          >
            {getStepMessage(loadingStep)}
          </p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className={`${getStepColor(loadingStep)} h-2 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${getStepProgress(loadingStep)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
