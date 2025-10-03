import React from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
} from '@mdi/js';

export interface InventoryHeaderTitleProps {
  activeTab: string;
}

const tabConfig = {
  tools: {
    icon: mdiWrench,
    title: 'Tool Management',
    color: '#4ECDC4',
  },
  supplies: {
    icon: mdiPackageVariant,
    title: 'Supplies Management',
    color: '#4ECDC4',
  },
  equipment: {
    icon: mdiPrinter3d,
    title: 'Equipment Management',
    color: '#4ECDC4',
  },
  officeHardware: {
    icon: mdiDesktopClassic,
    title: 'Office Hardware Management',
    color: '#4ECDC4',
  },
};

export const InventoryHeaderTitle: React.FC<InventoryHeaderTitleProps> = ({
  activeTab,
}) => {
  const config = tabConfig[activeTab as keyof typeof tabConfig];

  if (!config) {
    return null;
  }

  return (
    <h2 className="text-2xl font-bold text-[#5b5b5b] tracking-tight flex items-center">
      <Icon
        path={config.icon}
        size={1.1}
        color={config.color}
        className="mr-2"
        aria-hidden="true"
      />
      {config.title}
    </h2>
  );
};
