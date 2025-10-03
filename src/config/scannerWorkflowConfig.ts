import {
  mdiSpray,
  mdiWashingMachine,
  mdiAlertCircle,
  mdiFileDocument,
  mdiPackage,
} from '@mdi/js';

export interface WorkflowConfig {
  id: string;
  name: string;
  icon: string;
  color: 'green' | 'orange' | 'red' | 'blue' | 'purple';
  description: string;
  statusRequirement: string;
}

export const SCANNER_WORKFLOWS: WorkflowConfig[] = [
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

export const getWorkflowConfig = (id: string): WorkflowConfig | undefined => {
  return SCANNER_WORKFLOWS.find((workflow) => workflow.id === id);
};
