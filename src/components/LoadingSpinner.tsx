import React from 'react';
import { LoadingSpinner as NewLoadingSpinner } from './ui/Skeleton';

// Maintain backward compatibility with existing imports
export default function LoadingSpinner() {
  return <NewLoadingSpinner size="md" />;
}

// Also export the new LoadingSpinner for direct use
export { LoadingSpinner } from './ui/Skeleton';
