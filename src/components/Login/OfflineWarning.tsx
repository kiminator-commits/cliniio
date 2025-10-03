import React from 'react';
import { LOGIN_ERRORS } from '@/constants/loginConstants';

interface OfflineWarningProps {
  isOnline: boolean;
  className?: string;
}

export const OfflineWarning: React.FC<OfflineWarningProps> = ({
  isOnline,
  className = '',
}) => {
  if (isOnline) {
    return null;
  }

  return (
    <div
      className={`mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800 font-medium">
            {LOGIN_ERRORS.offline}
          </p>
        </div>
      </div>
    </div>
  );
};
