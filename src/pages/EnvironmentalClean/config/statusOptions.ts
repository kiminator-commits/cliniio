import {
  mdiBroom,
  mdiProgressClock,
  mdiCheckCircle,
  mdiPackageVariant,
  mdiShieldAlert,
  mdiBiohazard,
  mdiWrench,
} from '@mdi/js';

export const statusOptions = [
  { key: 'Dirty', label: 'Dirty', icon: mdiBroom, color: '#dc2626' },
  {
    key: 'In Progress',
    label: 'In Progress',
    icon: mdiProgressClock,
    color: '#ca8a04',
  },
  {
    key: 'Available',
    label: 'Available',
    icon: mdiCheckCircle,
    color: '#16a34a',
  },
  {
    key: 'Low Inventory',
    label: 'Low Inventory',
    icon: mdiPackageVariant,
    color: '#9333ea',
  },
  { key: 'Theft', label: 'Theft', icon: mdiShieldAlert, color: '#4b5563' },
  {
    key: 'Biohazard',
    label: 'Biohazard',
    icon: mdiBiohazard,
    color: '#dc2626',
  },
  {
    key: 'Out of Service',
    label: 'Out of Service',
    icon: mdiWrench,
    color: '#b45309',
  },
];
