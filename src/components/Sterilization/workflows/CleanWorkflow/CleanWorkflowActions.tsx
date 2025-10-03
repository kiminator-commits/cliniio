import React from 'react';

interface CleanWorkflowActionsProps {
  onClose: () => void;
}

/**
 * Action buttons component for the CleanWorkflow.
 * Contains the confirm and close button.
 */
export const CleanWorkflowActions: React.FC<CleanWorkflowActionsProps> = ({
  onClose,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onClose}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Confirm & Close
      </button>
    </div>
  );
};
