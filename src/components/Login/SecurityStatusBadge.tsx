import React from 'react';

interface SecurityStatusBadgeProps {
  isCSRFEnabled: boolean;
  className?: string;
}

export const SecurityStatusBadge: React.FC<SecurityStatusBadgeProps> = ({
  isCSRFEnabled,
  className = '',
}) => {
  if (!isCSRFEnabled) {
    return null;
  }

  return (
    <div
      className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`}
    >
      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clipRule="evenodd"
        />
      </svg>
      Secure Login Enabled
    </div>
  );
};
