import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

export const WarningMessage: React.FC = () => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Icon
          path={mdiAlertCircle}
          size={1.2}
          className="text-red-500 mt-0.5"
        />
        <div>
          <h3 className="font-medium text-red-800 mb-2">
            Immediate Action Required
          </h3>
          <p className="text-sm text-red-700">
            A Biological Indicator test failure indicates that the sterilization
            process may not have been effective. All tools processed since the
            last successful BI test must be quarantined and re-sterilized.
          </p>
        </div>
      </div>
    </div>
  );
};
