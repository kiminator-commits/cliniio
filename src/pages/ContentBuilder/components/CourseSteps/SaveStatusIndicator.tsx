import React from 'react';
import Icon from '@mdi/react';
import {
  mdiCheckCircle,
  mdiAlertCircle,
  mdiLoading,
  mdiClockOutline,
} from '@mdi/js';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  className?: string;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  lastSaved,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: mdiLoading,
          text: 'Saving...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'saved':
        return {
          icon: mdiCheckCircle,
          text: 'Saved',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: mdiAlertCircle,
          text: 'Save failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: mdiClockOutline,
          text: 'Ready',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();
  const isSpinning = status === 'saving';

  // Don't show anything when idle/ready
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <Icon
        path={config.icon}
        size={0.8}
        className={`${config.color} ${isSpinning ? 'animate-spin' : ''}`}
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs text-gray-500">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SaveStatusIndicator;
