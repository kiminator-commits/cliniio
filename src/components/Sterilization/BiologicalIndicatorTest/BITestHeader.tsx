import React from 'react';
import Icon from '@mdi/react';
import { mdiTestTube, mdiClose } from '@mdi/js';

interface BITestHeaderProps {
  onClose: () => void;
  isSubmitting: boolean;
}

/**
 * Header component for the Biological Indicator Test modal.
 * Contains the title, description, and close button.
 */
export const BITestHeader: React.FC<BITestHeaderProps> = ({
  onClose,
  isSubmitting,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Icon path={mdiTestTube} size={1.5} className="text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Daily BI Test</h2>
          <p className="text-sm text-gray-600">Required every 24 hours</p>
        </div>
      </div>
      <button
        onClick={onClose}
        disabled={isSubmitting}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <Icon path={mdiClose} size={1} className="text-gray-500" />
      </button>
    </div>
  );
};
