import React, { useState, useEffect } from 'react';
import { sessionManager } from '../lib/sessionManager';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface SessionStatusProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

const SessionStatus: React.FC<SessionStatusProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const [sessionInfo, setSessionInfo] = useState(
    sessionManager.getSessionInfo()
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setSessionInfo(sessionManager.getSessionInfo());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(updateInterval);
  }, []);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (remainingTime: number): string => {
    if (remainingTime < 5 * 60 * 1000) return 'text-red-600'; // Less than 5 minutes
    if (remainingTime < 15 * 60 * 1000) return 'text-yellow-600'; // Less than 15 minutes
    return 'text-green-600';
  };

  const getStatusIcon = (remainingTime: number) => {
    if (remainingTime < 5 * 60 * 1000)
      return <FaExclamationTriangle className="h-4 w-4" />;
    return <FaClock className="h-4 w-4" />;
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          {getStatusIcon(sessionInfo.remainingTime)}
          <span
            className={`text-sm font-medium ${getStatusColor(sessionInfo.remainingTime)}`}
          >
            {formatTime(sessionInfo.remainingTime)}
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Session Status</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon(sessionInfo.remainingTime)}
          <span
            className={`text-sm font-medium ${getStatusColor(sessionInfo.remainingTime)}`}
          >
            {formatTime(sessionInfo.remainingTime)} remaining
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Session started:</span>
          <span>
            {new Date(sessionInfo.sessionStartTime).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Last activity:</span>
          <span>
            {new Date(sessionInfo.lastActivityTime).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Inactive timeout:</span>
          <span>{formatTime(sessionInfo.inactiveTimeRemaining)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => sessionManager.extendSession()}
          className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Extend Session
        </button>
      </div>
    </div>
  );
};

export default SessionStatus;
