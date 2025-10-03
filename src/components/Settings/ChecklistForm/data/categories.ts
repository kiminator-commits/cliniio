import {
  mdiTools,
  mdiAccountGroup,
  mdiCalendarWeek,
  mdiOfficeBuilding,
  mdiBroom,
} from '@mdi/js';

export interface ChecklistCategory {
  id: 'setup' | 'patient' | 'weekly' | 'public' | 'deep';
  title: string;
  icon: string;
  color: string;
}

export const categories: ChecklistCategory[] = [
  { id: 'setup', title: 'Setup/Take Down', icon: mdiTools, color: '#FF6B6B' },
  {
    id: 'patient',
    title: 'Per Patient',
    icon: mdiAccountGroup,
    color: '#4ECDC4',
  },
  { id: 'weekly', title: 'Weekly', icon: mdiCalendarWeek, color: '#45B7D1' },
  {
    id: 'public',
    title: 'Public Spaces',
    icon: mdiOfficeBuilding,
    color: '#96CEB4',
  },
  { id: 'deep', title: 'Deep Clean', icon: mdiBroom, color: '#FF9F1C' },
];
