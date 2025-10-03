import React from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
} from '@mdi/js';

interface InventoryTabHeaderProps {
  activeTab: string;
  children: React.ReactNode;
}

/**
 * Tab header component that displays the appropriate title and icon based on the active tab.
 * Handles the visual presentation of different inventory categories.
 */
export const InventoryTabHeader: React.FC<InventoryTabHeaderProps> = ({
  activeTab,
  children,
}) => {
  const getTabConfig = (tab: string) => {
    const configs = {
      tools: {
        icon: mdiWrench,
        title: 'Tool Management',
        color: '#4ECDC4',
        textColor: '#5b5b5b',
      },
      supplies: {
        icon: mdiPackageVariant,
        title: 'Supplies Management',
        color: '#4ECDC4',
        textColor: '#374151',
      },
      equipment: {
        icon: mdiPrinter3d,
        title: 'Equipment Management',
        color: '#4ECDC4',
        textColor: '#374151',
      },
      officeHardware: {
        icon: mdiDesktopClassic,
        title: 'Office Hardware Management',
        color: '#4ECDC4',
        textColor: '#374151',
      },
    };

    return configs[tab as keyof typeof configs] || configs.tools;
  };

  const config = getTabConfig(activeTab);

  return (
    <div
      className="flex items-center justify-between mb-6 flex-shrink-0"
      role="banner"
      aria-label={`${config.title.toLowerCase()} section`}
    >
      <h2
        className="text-2xl font-bold tracking-tight flex items-center"
        style={{ color: config.textColor }}
      >
        <Icon
          path={config.icon}
          size={1.1}
          color={config.color}
          className="mr-2"
          aria-hidden="true"
        />
        {config.title}
      </h2>
      {children}
    </div>
  );
};
