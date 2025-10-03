import React from 'react';
import { WorkflowType } from '../../../config/workflowConfig';
import { SimpleTool } from '../../../types/toolTypes';

interface WorkflowComponentProps {
  workflowType: WorkflowType;
  scannedTool: SimpleTool;
  onComplete: () => void;
}

/**
 * WorkflowComponent - handles different sterilization workflow types.
 * This is a placeholder component that will be expanded based on workflow requirements.
 */
const WorkflowComponent: React.FC<WorkflowComponentProps> = ({
  workflowType,
  scannedTool,
  onComplete,
}) => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        {workflowType
          ? workflowType.charAt(0).toUpperCase() + workflowType.slice(1)
          : 'Unknown'}{' '}
        Workflow
      </h3>
      <p className="text-blue-700 mb-4">
        Processing tool: <strong>{scannedTool.name}</strong>
      </p>

      <div className="space-y-2">
        <p className="text-sm text-blue-600">• Name: {scannedTool.name}</p>
        <p className="text-sm text-blue-600">
          • Barcode: {scannedTool.barcode}
        </p>
      </div>

      <button
        onClick={onComplete}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Complete Workflow
      </button>
    </div>
  );
};

export default WorkflowComponent;
