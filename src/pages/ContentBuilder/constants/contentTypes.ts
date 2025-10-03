import {
  mdiSchool,
  mdiFileDocument,
  mdiClipboardList,
  mdiAlertCircle,
  mdiBookOpen,
} from '@mdi/js';

export interface ContentTypeConfig {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const contentTypes: ContentTypeConfig[] = [
  {
    id: 'course',
    label: 'Course',
    icon: mdiSchool,
    description: 'Interactive learning modules with assessments',
  },
  {
    id: 'policy',
    label: 'Policy',
    icon: mdiFileDocument,
    description: 'Organizational rules and guidelines',
  },
  {
    id: 'procedure',
    label: 'Procedure',
    icon: mdiClipboardList,
    description: 'Step-by-step operational instructions',
  },
  {
    id: 'sms',
    label: 'SDS Sheet',
    icon: mdiAlertCircle,
    description: 'Safety data sheets and chemical information',
  },
  {
    id: 'pathway',
    label: 'Learning Pathway',
    icon: mdiBookOpen,
    description: 'Combined learning experiences',
  },
];
