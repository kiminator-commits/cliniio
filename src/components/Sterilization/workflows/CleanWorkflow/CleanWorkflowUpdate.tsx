import React from 'react';

/**
 * Status update component for the CleanWorkflow.
 * Shows the automatic status change notification.
 */
export const CleanWorkflowUpdate: React.FC = () => {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <h4 className="text-md font-semibold text-orange-800 mb-2">
        Status Update
      </h4>
      <p className="text-orange-700 mb-2">
        <strong>Tool has been marked as "dirty"</strong> and will need
        sterilization after use.
      </p>
      <p className="text-sm text-orange-600">
        This change is automatically reflected in the inventory system.
      </p>
    </div>
  );
};
