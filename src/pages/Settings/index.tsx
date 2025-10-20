import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import Icon from '@mdi/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { supabase } from '../../lib/supabaseClient';
import {
  FacilitySettingsService,
  FacilitySettings,
} from '../../services/FacilitySettingsService';
import { useUser } from '../../contexts/UserContext';
import { useAIUsageAlerts } from '../../hooks/useAIUsageAlerts';
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
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [complianceFlagCount, setComplianceFlagCount] = useState<number>(0);
  const [_facilitySettings, _setFacilitySettings] =
    useState<FacilitySettings | null>(null);
  const { currentUser } = useUser();
  const aiUsageAlerts = useAIUsageAlerts();

  // Handle URL parameters to open specific sections
  useEffect(() => {
    // Removed error handling from location state
  }, [location.state]);

  // Handle URL parameters to open specific sections
  useEffect(() => {
    const section = searchParams.get('section');
    const _subtab = searchParams.get('subtab');
    const review = searchParams.get('review');
    
    if (section && settingsSections.some(s => s.id === section)) {
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => setOpenDrawer(section), 0);
    }
    
    // Handle deep linking for content approval
    if (review && section === 'content') {
      // Store review content ID for the PublishingTab to use
      sessionStorage.setItem('reviewContentId', review);
    }
  }, [searchParams]);

  // Fetch compliance flag count for styling only (not displayed)
  useEffect(() => {
    async function fetchComplianceFlags() {
      try {
        const { count, error } = await supabase
          .from('audit_flags')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);
        if (!error && typeof count === 'number') {
          setComplianceFlagCount(count);
        }
      } catch (e) {
        console.error('Failed to fetch compliance flags:', e);
      }
    }
    fetchComplianceFlags();
    
    // Listen for compliance issue resolution events
    const handleComplianceResolved = () => {
      setTimeout(() => {
        fetchComplianceFlags();
      }, 300);
    };
    
    window.addEventListener('complianceIssueResolved', handleComplianceResolved);
    
    return () => {
      window.removeEventListener('complianceIssueResolved', handleComplianceResolved);
    };
  }, []);

  // Load facility settings on component mount
  useEffect(() => {
    const loadFacilitySettings = async () => {
      if (currentUser?.facility_id) {
        try {
          const settings = await FacilitySettingsService.getFacilitySettings(
            currentUser.facility_id
          );
          if (settings) {
            _setFacilitySettings(settings);
          }
        } catch (err) {
          console.error('Error loading facility settings:', err);
        }
      }
    };

    loadFacilitySettings();
  }, [currentUser?.facility_id]);

  // Function to update facility settings
  const _updateFacilitySettings = async (updates: Partial<FacilitySettings>) => {
    if (currentUser?.facility_id) {
      try {
        const updatedSettings =
          await FacilitySettingsService.updateFacilitySettings(
            currentUser.facility_id,
            updates
          );
        if (updatedSettings) {
          _setFacilitySettings(updatedSettings);
        }
      } catch (err) {
        console.error('Error updating facility settings:', err);
      }
    }
  };

  const handleCardClick = (id: string) => {
    try {
      setOpenDrawer((prev) => (prev === id ? null : id));
    } catch (err) {
      console.error('Error opening settings card:', err);
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
            className={`rounded-xl shadow p-6 border text-left transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none w-full min-h-[180px] flex flex-col justify-between ${
              openDrawer === section.id ? 'ring-2 ring-[#4ECDC4]' : ''
            } ${
              (section.id === 'system' && complianceFlagCount > 0) || 
              (section.id === 'analytics' && aiUsageAlerts.hasIssues)
                ? 'border-red-500 bg-red-100 shadow-red-200 shadow-lg' 
                : 'bg-white border-gray-100'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span
                  className={`${sectionColors[section.id].bg} rounded-md p-2 mr-3`}
                >
                  <Icon
                    path={section.icon}
                    size={1}
                    className={sectionColors[section.id].icon}
                  />
                </span>
                <h3 className={`text-base font-medium ${
                  (section.id === 'system' && complianceFlagCount > 0) || 
                  (section.id === 'analytics' && aiUsageAlerts.hasIssues)
                    ? 'text-red-800' 
                    : 'text-gray-700'
                }`}>
                  {section.label}
                </h3>
              </div>
              {/* Compliance warning indicator for System Administration */}
              {section.id === 'system' && complianceFlagCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  !
                </div>
              )}
              {/* AI Usage warning indicator for Analytics */}
              {section.id === 'analytics' && aiUsageAlerts.hasIssues && (
                <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  !
                </div>
              )}
            </div>
            <p className={`text-sm mt-auto ${
              (section.id === 'system' && complianceFlagCount > 0) || 
              (section.id === 'analytics' && aiUsageAlerts.hasIssues)
                ? 'text-red-600 font-medium' 
                : 'text-gray-500'
            }`}>
              {section.id === 'system' && complianceFlagCount > 0 
                ? '⚠️ Compliance issues require attention'
                : section.id === 'analytics' && aiUsageAlerts.hasIssues
                ? `⚠️ AI usage ${aiUsageAlerts.isExceeded ? 'exceeded' : 'approaching'} limit (${Math.round(aiUsageAlerts.usagePercentage)}%)`
                : section.description
              }
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
              <ErrorBoundary>
                <ProfileAccountSettings />
              </ErrorBoundary>
            )}

            {section.id === 'system' && (
              <ErrorBoundary>
                <SystemAdministrationSettings 
                  initialTab={searchParams.get('tab')} 
                  complianceFlagCount={complianceFlagCount}
                />
              </ErrorBoundary>
            )}

            {section.id === 'system-config' && (
              <ErrorBoundary>
                <BillingSettings />
              </ErrorBoundary>
            )}

            {section.id === 'content' && (
              <ErrorBoundary>
                <ContentManagementSettings />
              </ErrorBoundary>
            )}

            {section.id === 'learning' && (
              <ErrorBoundary>
                <LearningTrainingSettings />
              </ErrorBoundary>
            )}

            {section.id === 'cleaning' && (
              <ErrorBoundary>
                <EnvironmentalCleaningSettings />
              </ErrorBoundary>
            )}

            {section.id === 'inventory' && (
              <ErrorBoundary>
                <InventoryManagementSettings />
              </ErrorBoundary>
            )}

            {section.id === 'sterilization' && (
              <ErrorBoundary>
                <SterilizationSettings />
              </ErrorBoundary>
            )}

            {section.id === 'analytics' && (
              <ErrorBoundary>
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
    <SharedLayout 
      hasComplianceIssues={complianceFlagCount > 0}
      hasAIUsageIssues={aiUsageAlerts.hasIssues}
    >
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
