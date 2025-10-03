import React from 'react';

interface CleanWorkflowStatusProps {
  scannedData: string;
}

/**
 * Status display component for the CleanWorkflow.
 * Shows the clean tool processing status.
 */
export const CleanWorkflowStatus: React.FC<CleanWorkflowStatusProps> = ({
  scannedData,
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Clean Tool Processed
      </h3>
      <p className="text-green-700 mb-2">
        Tool is clean and ready for use on patients.
      </p>
      <p className="text-sm text-green-600">Scanned: {scannedData}</p>
    </div>
  );
};
