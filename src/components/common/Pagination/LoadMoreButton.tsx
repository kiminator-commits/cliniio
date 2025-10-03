import React from 'react';
import Icon from '../../Icon/Icon';
import { mdiLoading, mdiChevronDown } from '@mdi/js';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
  buttonText?: string;
  loadingText?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onLoadMore,
  hasMore,
  isLoading,
  className = '',
  buttonText = 'Load More',
  loadingText = 'Loading...',
}) => {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className={`flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        {isLoading ? (
          <>
            <Icon path={mdiLoading} size={16} className="animate-spin mr-2" />
            {loadingText}
          </>
        ) : (
          <>
            {buttonText}
            <Icon path={mdiChevronDown} size={16} className="ml-2" />
          </>
        )}
      </button>
    </div>
  );
};
