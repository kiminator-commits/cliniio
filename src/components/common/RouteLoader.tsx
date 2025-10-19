import React from 'react';

/**
 * Shared RouteLoader component for consistent loading states across app routes
 * Provides a clean, reusable loading indicator for Suspense fallbacks
 */
export default function RouteLoader() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-transparent">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-gray-400" />
      <span className="ml-3 text-gray-500 text-sm font-medium">Loading...</span>
    </div>
  );
}
