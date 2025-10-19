import React from 'react';

interface Action {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ActionBarProps {
  actions: Action[];
  currentContext?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function ActionBar({
  actions = [],
  currentContext,
  showProgress = false,
  progress = 0,
}: ActionBarProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm py-3 px-4 flex flex-col sm:flex-row items-center justify-between z-10">
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {currentContext && (
          <p className="text-sm text-gray-600 truncate max-w-xs">
            Current:{' '}
            <span className="font-medium text-gray-900">{currentContext}</span>
          </p>
        )}
        {showProgress && (
          <p className="text-xs text-gray-500">Progress: {progress}%</p>
        )}
      </div>
      <div className="flex gap-3 mt-3 sm:mt-0">
        {actions.map(({ id, label, onClick, variant = 'primary' }) => (
          <button
            key={id}
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              variant === 'primary'
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </footer>
  );
}
