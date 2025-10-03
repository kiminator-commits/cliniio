import React from 'react';
import Icon from '@mdi/react';
import { mdiClock } from '@mdi/js';

interface BITestActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonState: {
    disabled: boolean;
    className: string;
  };
}

/**
 * Action buttons component for the Biological Indicator Test.
 * Contains the submit and cancel buttons.
 */
export const BITestActions: React.FC<BITestActionsProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonState,
}) => {
  return (
    <div className="flex gap-3">
      <button
        onClick={onSubmit}
        disabled={submitButtonState.disabled}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${submitButtonState.className}`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <Icon path={mdiClock} size={1} className="animate-spin" />
            Recording...
          </div>
        ) : (
          'Record Result'
        )}
      </button>

      <button
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
};
