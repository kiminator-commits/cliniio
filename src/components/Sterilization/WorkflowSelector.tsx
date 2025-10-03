import React from 'react';
import { SCANNER_WORKFLOWS } from '../../config/scannerWorkflowConfig';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowSelectorProps {
  onWorkflowSelect: (workflowId: string) => void;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  onWorkflowSelect,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Select Workflow
      </h3>
      <div className="space-y-3">
        {SCANNER_WORKFLOWS.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onClick={onWorkflowSelect}
          />
        ))}
      </div>
    </div>
  );
};
