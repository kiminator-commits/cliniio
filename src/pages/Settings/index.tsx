import React, { useState } from 'react';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import Icon from '@mdi/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  mdiAccount,
  mdiCog,
  mdiBookOpen,
  mdiSchool,
  mdiSpray,
  mdiPackageVariant,
  mdiThermometer,
  mdiCurrencyUsd,
  mdiChartLine,
} from '@mdi/js';

import { ProfileAccountSettings } from './components/ProfileAccountSettings';
import SystemAdministrationSettings from './components/SystemAdministrationSettings';
import BillingSettings from './components/BillingSettings';
import AIAnalyticsSettings from './components/AIAnalyticsSettings';
import SterilizationSettings from './components/SterilizationSettingsPanel';
import ContentManagementSettings from './components/ContentManagementSettings';
import LearningTrainingSettings from './components/LearningTrainingSettings';
import EnvironmentalCleaningSettings from './components/EnvironmentalCleaningSettings';
import InventoryManagementSettings from './components/InventoryManagementSettings';

const settingsSections = [
  {
    id: 'profile',
    label: 'Profile & Account',
    icon: mdiAccount,
    description: 'Manage your admin account information and personal settings.',
  },

  {
    id: 'system',
    label: 'System Administration',
    icon: mdiCog,
    description: 'Manage users, roles, permissions, and system-wide settings.',
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: mdiBookOpen,
    description: 'Create, edit, and manage Knowledge Hub and Library content.',
  },
  {
    id: 'learning',
    label: 'Learning & Training',
    icon: mdiSchool,
    description:
      'Configure training modules, certifications, and learning paths.',
  },
  {
    id: 'cleaning',
    label: 'Environmental Cleaning',
    icon: mdiSpray,
    description: 'Manage room cleaning schedules, protocols, and status.',
  },
  {
    id: 'inventory',
    label: 'Inventory Management',
    icon: mdiPackageVariant,
    description:
      'Oversee inventory, categories, stock levels, and procurement.',
  },
  {
    id: 'sterilization',
    label: 'Sterilization',
    icon: mdiThermometer,
    description: 'Monitor sterilization cycles, equipment, and compliance.',
  },
  {
    id: 'system-config',
    label: 'Billing',
    icon: mdiCurrencyUsd,
    description:
      'Manage billing settings, payment methods, and subscription plans.',
  },
  {
    id: 'analytics',
    label: 'AI and Analytics',
    icon: mdiChartLine,
    description:
      'Configure AI features, view system analytics, and generate intelligent reports.',
  },
];

const sectionColors: Record<string, { bg: string; icon: string }> = {
  profile: { bg: 'bg-blue-100', icon: 'text-blue-700' },
  system: { bg: 'bg-green-100', icon: 'text-green-800' },
  content: { bg: 'bg-purple-200', icon: 'text-purple-900' },
  learning: { bg: 'bg-yellow-200', icon: 'text-yellow-900' },
  cleaning: { bg: 'bg-teal-100', icon: 'text-teal-700' },
  inventory: { bg: 'bg-blue-100', icon: 'text-blue-700' },
  sterilization: { bg: 'bg-purple-200', icon: 'text-purple-900' },
  'system-config': { bg: 'bg-green-100', icon: 'text-green-800' },
  analytics: { bg: 'bg-yellow-200', icon: 'text-yellow-900' },
};

const Settings: React.FC = () => {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCardClick = (id: string) => {
    try {
      setError(null);
      setOpenDrawer((prev) => (prev === id ? null : id));
    } catch (err) {
      console.error('Error opening settings card:', err);
      setError(err instanceof Error ? err.message : 'Failed to open settings');
    }
  };

  // Helper to render the grid with inline drawer
  const renderGridWithDrawer = () => {
    const items: React.ReactNode[] = [];
    for (let i = 0; i < settingsSections.length; i++) {
      const section = settingsSections[i];
      items.push(
        <div key={section.id} className="relative">
          <button
            onClick={() => handleCardClick(section.id)}
            className={`bg-white rounded-xl shadow p-6 border border-gray-100 text-left transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none w-full min-h-[180px] flex flex-col justify-between ${openDrawer === section.id ? 'ring-2 ring-[#4ECDC4]' : ''}`}
            type="button"
          >
            <div className="flex items-center mb-4">
              <span
                className={`${sectionColors[section.id].bg} rounded-md p-2 mr-3`}
              >
                <Icon
                  path={section.icon}
                  size={1}
                  className={sectionColors[section.id].icon}
                />
              </span>
              <h3 className="text-base font-medium text-gray-700">
                {section.label}
              </h3>
            </div>
            <p className="text-gray-500 text-sm mt-auto">
              {section.description}
            </p>
          </button>
        </div>
      );
      // If this is the open drawer, insert the drawer after this card
      if (openDrawer === section.id) {
        items.push(
          <div
            key={section.id + '-drawer'}
            className="col-span-full bg-white border border-gray-200 rounded-xl shadow-lg p-6 animate-fade-in my-2"
            style={{ gridColumn: '1 / -1' }}
          >
            {section.id === 'profile' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Profile Settings
                  </div>
                }
              >
                <ProfileAccountSettings />
              </ErrorBoundary>
            )}

            {section.id === 'system' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load System Administration Settings
                  </div>
                }
              >
                <SystemAdministrationSettings />
              </ErrorBoundary>
            )}

            {section.id === 'system-config' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Billing Settings
                  </div>
                }
              >
                <BillingSettings />
              </ErrorBoundary>
            )}

            {section.id === 'content' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Content Management Settings
                  </div>
                }
              >
                <ContentManagementSettings />
              </ErrorBoundary>
            )}

            {section.id === 'learning' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Learning & Training Settings
                  </div>
                }
              >
                <LearningTrainingSettings />
              </ErrorBoundary>
            )}

            {section.id === 'cleaning' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Environmental Cleaning Settings
                  </div>
                }
              >
                <EnvironmentalCleaningSettings />
              </ErrorBoundary>
            )}

            {section.id === 'inventory' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Inventory Management Settings
                  </div>
                }
              >
                <InventoryManagementSettings />
              </ErrorBoundary>
            )}

            {section.id === 'sterilization' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load Sterilization Settings
                  </div>
                }
              >
                <SterilizationSettings />
              </ErrorBoundary>
            )}

            {section.id === 'analytics' && (
              <ErrorBoundary
                fallback={
                  <div className="text-red-600 p-4">
                    Failed to load AI Analytics Settings
                  </div>
                }
              >
                <AIAnalyticsSettings />
              </ErrorBoundary>
            )}
          </div>
        );
      }
    }
    return items;
  };

  return (
    <SharedLayout>
      <div className="flex flex-col min-h-screen">
        <div className="p-4 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">
              Admin Settings
            </h1>
            <p className="text-gray-500 text-sm">
              Configure system-wide settings, manage users, and control
              application features
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {renderGridWithDrawer()}
            </div>
          </div>
        </div>
      </div>
    </SharedLayout>
  );
};

export default Settings;
