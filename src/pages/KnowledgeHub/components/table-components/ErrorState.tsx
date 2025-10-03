import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiRefresh } from '@mdi/js';

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-32 text-center">
    <Icon path={mdiAlertCircle} size={2} color="#ef4444" className="mb-2" />
    <p className="text-red-600 font-medium mb-2">Failed to load content</p>
    <p className="text-gray-500 text-sm mb-4">{error.message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#3db8b0] transition"
    >
      <Icon path={mdiRefresh} size={0.8} />
      Retry
    </button>
  </div>
);
