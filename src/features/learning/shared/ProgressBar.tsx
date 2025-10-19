import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  percentage,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div
        className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${percentage}%` }}
      ></div>
      {showLabel && (
        <p className="text-sm text-gray-600 mt-1 text-right">
          {percentage}% complete
        </p>
      )}
    </div>
  );
}
