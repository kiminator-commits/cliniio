import { WorkflowConfig } from '../config/scannerWorkflowConfig';

export const getWorkflowBorderClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green:
      'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
    orange:
      'border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100',
    blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
    purple:
      'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100',
    red: 'border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100',
  };
  return colorMap[color];
};

export const getWorkflowIconBgClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    red: 'bg-red-100',
  };
  return colorMap[color];
};

export const getWorkflowIconColorClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };
  return colorMap[color];
};

export const getWorkflowTitleColorClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green: 'text-green-800',
    orange: 'text-orange-800',
    blue: 'text-blue-800',
    purple: 'text-purple-800',
    red: 'text-red-800',
  };
  return colorMap[color];
};

export const getWorkflowDescriptionColorClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };
  return colorMap[color];
};

export const getWorkflowStatusColorClasses = (
  color: WorkflowConfig['color']
): string => {
  const colorMap = {
    green: 'text-green-700',
    orange: 'text-orange-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    red: 'text-red-700',
  };
  return colorMap[color];
};
