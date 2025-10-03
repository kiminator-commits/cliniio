import React from 'react';
import Icon from '@mdi/react';
import { mdiCalendar } from '@mdi/js';

interface BITestContentProps {
  getCurrentDateTime: () => string;
}

/**
 * Content section for the Biological Indicator Test modal.
 * Contains the date/time display and description.
 */
export const BITestContent: React.FC<BITestContentProps> = ({
  getCurrentDateTime,
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon path={mdiCalendar} size={1} className="text-gray-500" />
          <span className="text-sm text-gray-600">{getCurrentDateTime()}</span>
        </div>
        <p className="text-gray-700 mb-4">
          Please complete the daily Biological Indicator test and record the
          result below.
        </p>
      </div>
    </div>
  );
};
