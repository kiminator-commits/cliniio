import React, { useState } from 'react';
import { FaSync, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Tooltip } from './Tooltip';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  className = '',
  size = 'md',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshStatus('idle');

    try {
      await onRefresh();
      setLastRefresh(new Date());
      setRefreshStatus('success');

      // Reset success status after 2 seconds
      setTimeout(() => setRefreshStatus('idle'), 2000);
    } catch (error) {
      console.error('Refresh failed:', error);
      setRefreshStatus('error');

      // Reset error status after 3 seconds
      setTimeout(() => setRefreshStatus('idle'), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getIcon = () => {
    if (isRefreshing) {
      return <FaSync className="animate-spin" />;
    }

    switch (refreshStatus) {
      case 'success':
        return <FaCheck className="text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaSync />;
    }
  };

  const getTooltip = () => {
    if (isRefreshing) return 'Refreshing...';
    if (refreshStatus === 'success') return 'Updated successfully';
    if (refreshStatus === 'error') return 'Refresh failed';
    if (lastRefresh) return `Last updated: ${lastRefresh.toLocaleTimeString()}`;
    return 'Refresh';
  };

  const getAriaLabel = () => {
    if (isRefreshing) return 'Refreshing performance metrics';
    if (refreshStatus === 'success')
      return 'Performance metrics updated successfully';
    if (refreshStatus === 'error')
      return 'Failed to refresh performance metrics - try again';
    if (lastRefresh)
      return `Refresh performance metrics - Last updated: ${lastRefresh.toLocaleTimeString()}`;
    return 'Refresh performance metrics (PRN)';
  };

  return (
    <Tooltip content={getTooltip()}>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          bg-white hover:bg-gray-50
          border border-gray-200 hover:border-gray-300
          rounded-lg shadow-sm hover:shadow-md
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={getAriaLabel()}
      >
        {getIcon()}
      </button>
    </Tooltip>
  );
};

export default RefreshButton;
