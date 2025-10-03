import React from 'react';
import Icon from '@mdi/react';
import { WorkflowConfig } from '../../config/scannerWorkflowConfig';
import {
  getWorkflowBorderClasses,
  getWorkflowIconBgClasses,
  getWorkflowIconColorClasses,
  getWorkflowTitleColorClasses,
  getWorkflowDescriptionColorClasses,
  getWorkflowStatusColorClasses,
} from '../../utils/workflowColorUtils';

interface WorkflowCardProps {
  workflow: WorkflowConfig;
  onClick: (workflowId: string) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(workflow.id)}
      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${getWorkflowBorderClasses(
        workflow.color
      )}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${getWorkflowIconBgClasses(workflow.color)}`}
        >
          <Icon
            path={workflow.icon}
            size={1.2}
            className={getWorkflowIconColorClasses(workflow.color)}
          />
        </div>
        <div>
          <h4
            className={`font-semibold text-sm ${getWorkflowTitleColorClasses(workflow.color)}`}
          >
            {workflow.name}
          </h4>
          <p
            className={`text-xs ${getWorkflowDescriptionColorClasses(workflow.color)}`}
          >
            {workflow.description}
          </p>
          <p
            className={`text-xs mt-1 font-medium ${getWorkflowStatusColorClasses(workflow.color)}`}
          >
            {workflow.statusRequirement}
          </p>
        </div>
      </div>
    </button>
  );
};
