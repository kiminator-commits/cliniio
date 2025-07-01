import React from 'react';
import { WorkflowType } from '@/types/sterilizationTypes';

interface WorkflowSelectorProps {
  workflows: WorkflowType[];
  selectedWorkflow: WorkflowType | null;
  onSelect: (workflow: WorkflowType) => void;
}

const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  workflows,
  selectedWorkflow,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {workflows.map(workflow => (
        <button
          key={workflow}
          onClick={() => onSelect(workflow)}
          className={`px-4 py-2 border rounded ${
            selectedWorkflow === workflow ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
          }`}
        >
          {workflow}
        </button>
      ))}
    </div>
  );
};

export default React.memo(WorkflowSelector);
