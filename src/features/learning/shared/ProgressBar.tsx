import React from 'react';

// TODO: Implement shared version from CourseViewer
// This component will provide consistent progress visualization across both CourseViewer and ContentBuilder
// Features to include:
// - Multiple progress bar types (course, level, lesson)
// - Animated progress transitions
// - Customizable colors and sizes
// - Accessibility support

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
