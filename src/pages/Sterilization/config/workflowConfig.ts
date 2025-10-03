import {
  mdiSpray,
  mdiWashingMachine,
  mdiAlertCircle,
  mdiFileDocument,
  mdiPackage,
} from '@mdi/js';

export interface WorkflowOption {
  id: string;
  name: string;
  icon: string;
  color: 'green' | 'orange' | 'red' | 'blue' | 'purple';
  description: string;
  statusRequirement: string;
}

export const AVAILABLE_WORKFLOWS: WorkflowOption[] = [
  {
    id: 'clean',
    name: 'Clean Tool',
    icon: mdiSpray,
    color: 'green',
    description: 'Ready to use on patients',
    statusRequirement: 'Complete → Dirty',
  },
  {
    id: 'dirty',
    name: 'Dirty Tool',
    icon: mdiWashingMachine,
    color: 'orange',
    description: 'Ready for cleaning process',
    statusRequirement: 'Dirty → Clean',
  },
  {
    id: 'problem',
    name: 'Tool Problem',
    icon: mdiAlertCircle,
    color: 'red',
    description: 'Report tool issues or problems',
    statusRequirement: 'Any status → Problem',
  },
  {
    id: 'import',
    name: 'Import Autoclave Receipt',
    icon: mdiFileDocument,
    color: 'blue',
    description: 'Import physical autoclave cycle documentation',
    statusRequirement: 'Documentation',
  },
  {
    id: 'packaging',
    name: 'Packaging Workflow',
    icon: mdiPackage,
    color: 'purple',
    description: 'Tools that are ready for packaging',
    statusRequirement: 'Complete → Packaged',
  },
];

export const getWorkflowColorClasses = (color: WorkflowOption['color']) => {
  const colorMap = {
    green: {
      border: 'border-green-200 hover:border-green-300',
      bg: 'bg-green-50 hover:bg-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      descriptionColor: 'text-green-600',
      requirementColor: 'text-green-700',
    },
    orange: {
      border: 'border-orange-200 hover:border-orange-300',
      bg: 'bg-orange-50 hover:bg-orange-100',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      descriptionColor: 'text-orange-600',
      requirementColor: 'text-orange-700',
    },
    red: {
      border: 'border-red-200 hover:border-red-300',
      bg: 'bg-red-50 hover:bg-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      descriptionColor: 'text-red-600',
      requirementColor: 'text-red-700',
    },
    blue: {
      border: 'border-blue-200 hover:border-blue-300',
      bg: 'bg-blue-50 hover:bg-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      descriptionColor: 'text-blue-600',
      requirementColor: 'text-blue-700',
    },
    purple: {
      border: 'border-purple-200 hover:border-purple-300',
      bg: 'bg-purple-50 hover:bg-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      descriptionColor: 'text-purple-600',
      requirementColor: 'text-purple-700',
    },
  };

  return colorMap[color];
};
