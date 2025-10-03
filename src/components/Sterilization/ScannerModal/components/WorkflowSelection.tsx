import React from 'react';
import Icon from '@mdi/react';
import {
  availableWorkflows,
  getWorkflowColorClasses,
} from '../data/workflowData';

interface WorkflowSelectionProps {
  onWorkflowSelect: (workflow: string) => void;
}

export const WorkflowSelection: React.FC<WorkflowSelectionProps> = ({
  onWorkflowSelect,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Select Workflow
      </h3>
      <div className="space-y-3">
        {availableWorkflows.map((workflow) => {
          const colorClasses = getWorkflowColorClasses(workflow.color);
          return (
            <button
              key={workflow.id}
              onClick={() => onWorkflowSelect(workflow.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${colorClasses.border} ${colorClasses.bg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses.iconBg}`}>
                  <Icon
                    path={workflow.icon}
                    size={1.2}
                    className={colorClasses.iconColor}
                  />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-sm ${colorClasses.textColor}`}
                  >
                    {workflow.name}
                  </h4>
                  <p className={`text-xs ${colorClasses.textSecondary}`}>
                    {workflow.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
