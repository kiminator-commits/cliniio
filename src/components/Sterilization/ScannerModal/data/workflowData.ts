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
}

export const availableWorkflows: WorkflowOption[] = [
  {
    id: 'clean',
    name: 'Clean Tool',
    icon: mdiSpray,
    color: 'green',
    description: 'Ready to use on patients',
  },
  {
    id: 'dirty',
    name: 'Dirty Tool',
    icon: mdiWashingMachine,
    color: 'orange',
    description: 'Ready for cleaning process',
  },
  {
    id: 'problem',
    name: 'Problem Tool',
    icon: mdiAlertCircle,
    color: 'red',
    description: 'Needs repair/replacement',
  },
  {
    id: 'import',
    name: 'Import Autoclave Receipt',
    icon: mdiFileDocument,
    color: 'blue',
    description: 'Import physical autoclave cycle documentation',
  },
  {
    id: 'packaging',
    name: 'Packaging Workflow',
    icon: mdiPackage,
    color: 'purple',
    description: 'Package tools for sterilization',
  },
];

export const getWorkflowColorClasses = (color: string) => {
  switch (color) {
    case 'green':
      return {
        border: 'border-green-200 hover:border-green-300',
        bg: 'bg-green-50 hover:bg-green-100',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
        textSecondary: 'text-green-600',
      };
    case 'orange':
      return {
        border: 'border-orange-200 hover:border-orange-300',
        bg: 'bg-orange-50 hover:bg-orange-100',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-800',
        textSecondary: 'text-orange-600',
      };
    case 'red':
      return {
        border: 'border-red-200 hover:border-red-300',
        bg: 'bg-red-50 hover:bg-red-100',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-800',
        textSecondary: 'text-red-600',
      };
    case 'blue':
      return {
        border: 'border-blue-200 hover:border-blue-300',
        bg: 'bg-blue-50 hover:bg-blue-100',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
        textSecondary: 'text-blue-600',
      };
    case 'purple':
      return {
        border: 'border-purple-200 hover:border-purple-300',
        bg: 'bg-purple-50 hover:bg-purple-100',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-800',
        textSecondary: 'text-purple-600',
      };
    default:
      return {
        border: 'border-gray-200 hover:border-gray-300',
        bg: 'bg-gray-50 hover:bg-gray-100',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-800',
        textSecondary: 'text-gray-600',
      };
  }
};
