import React from 'react';

interface TaskErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
}

export default function TaskErrorDisplay({
  error,
  onRetry,
}: TaskErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Task Loading Error
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#38b2ac] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-opacity-50"
          aria-label="Retry loading tasks"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
