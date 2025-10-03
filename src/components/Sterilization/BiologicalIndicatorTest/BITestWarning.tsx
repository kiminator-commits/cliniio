import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

interface BITestWarningProps {
  shouldShow: boolean;
  message: string;
}

/**
 * Warning component for the Biological Indicator Test.
 * Displays critical alerts when a fail result is selected.
 */
export const BITestWarning: React.FC<BITestWarningProps> = ({
  shouldShow,
  message,
}) => {
  if (!shouldShow) return null;

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon path={mdiAlertCircle} size={1} className="text-red-500" />
        <span className="font-medium text-red-800">Critical Alert</span>
      </div>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
};
