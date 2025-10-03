import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface LoadingIndicatorProps {
  loading: boolean;
  loadingStep: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  loading,
  loadingStep,
}) => {
  if (!loading) return null;

  return (
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
      <LoadingSpinner size="sm" />
      <span>{loadingStep || 'Processing...'}</span>
    </div>
  );
};

export default LoadingIndicator;
