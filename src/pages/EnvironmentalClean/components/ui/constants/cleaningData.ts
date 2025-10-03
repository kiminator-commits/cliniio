import {
  mdiTools,
  mdiAccountGroup,
  mdiCalendarWeek,
  mdiOfficeBuilding,
  mdiBroom,
} from '@mdi/js';
import { Category, SDSSheet } from '../types/cleaningChecklists';

export const categories: Category[] = [
  {
    id: 'setup',
    title: 'Setup/Take Down',
    iconColor: '#FF6B6B',
    icon: mdiTools,
  },
  {
    id: 'patient',
    title: 'Per Patient',
    iconColor: '#4ECDC4',
    icon: mdiAccountGroup,
  },
  {
    id: 'weekly',
    title: 'Weekly',
    iconColor: '#45B7D1',
    icon: mdiCalendarWeek,
  },
  {
    id: 'public',
    title: 'Public Spaces',
    iconColor: '#96CEB4',
    icon: mdiOfficeBuilding,
  },
  { id: 'deep', title: 'Deep Clean', iconColor: '#FF9F1C', icon: mdiBroom },
];

export const sampleSDSSheets: SDSSheet[] = [
  {
    id: '1',
    name: 'Bleach SDS',
    category: 'Cleaning',
    lastUpdated: '2024-03-20',
    url: '/sds/bleach.pdf',
    sections: [],
  },
  {
    id: '2',
    name: 'Disinfectant SDS',
    category: 'Cleaning',
    lastUpdated: '2024-03-19',
    url: '/sds/disinfectant.pdf',
    sections: [],
  },
  {
    id: '3',
    name: 'Hand Sanitizer SDS',
    category: 'Sanitization',
    lastUpdated: '2024-03-18',
    url: '/sds/hand-sanitizer.pdf',
    sections: [],
  },
];
