import React from 'react';
import { getWorkflowConfig } from '../../config/scannerWorkflowConfig';

interface WorkflowInfoProps {
  workflowId: string;
  color?: 'blue' | 'orange' | 'purple';
}

export const WorkflowInfo: React.FC<WorkflowInfoProps> = ({
  workflowId,
  color = 'blue',
}) => {
  const workflow = getWorkflowConfig(workflowId);

  if (!workflow) {
    return null;
  }

  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 text-blue-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-800 text-orange-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 text-purple-600',
    };
    return colorMap[color];
  };

  const [bgClass, borderClass, titleClass, descClass] =
    getColorClasses().split(' ');

  return (
    <div className={`${bgClass} border ${borderClass} rounded-lg p-3`}>
      <h3 className={`font-semibold ${titleClass} text-sm mb-1`}>
        {workflow.name} Workflow
      </h3>
      <p className={`${descClass} text-xs`}>{workflow.description}</p>
      <div className="mt-2 text-xs text-blue-500">
        <strong>Tool Status:</strong> {workflow.statusRequirement}
      </div>
    </div>
  );
};
