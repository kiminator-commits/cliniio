import React from 'react';
import { useCleanWorkflow } from './useCleanWorkflow';
import { CleanWorkflowStatus } from './CleanWorkflowStatus';
import { CleanWorkflowUpdate } from './CleanWorkflowUpdate';
import { CleanWorkflowActions } from './CleanWorkflowActions';

interface CleanWorkflowProps {
  scannedData: string;
  onClose: () => void;
  toolId?: string;
}

/**
 * Refactored CleanWorkflow component.
 * Uses extracted sub-components and custom hook for better organization.
 * Now includes Supabase integration for tool scanning.
 */
export default function CleanWorkflow({
  scannedData,
  onClose,
  toolId,
}: CleanWorkflowProps) {
  // Business logic separated into hook
  const { isProcessing, scanResult } = useCleanWorkflow({
    scannedData,
    toolId,
  });

  return (
    <div className="space-y-4">
      <CleanWorkflowStatus scannedData={scannedData} />

      {/* Scan Result Display */}
      {scanResult && (
        <div
          className={`p-4 rounded-lg border ${
            scanResult.success
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                scanResult.success ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="font-medium">
              {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
            </span>
          </div>
          <p className="mt-1 text-sm">{scanResult.message}</p>
          {isProcessing && (
            <div className="mt-2 text-sm text-gray-600">Processing scan...</div>
          )}
        </div>
      )}

      <CleanWorkflowUpdate />
      <CleanWorkflowActions onClose={onClose} />
    </div>
  );
}
