import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle } from '@mdi/js';

import {
  useAISettings,
  UnifiedAISettings,
} from '../../../services/ai/aiSettingsService';
import { useFacility } from '@/contexts/FacilityContext';

import { MessageState, ServiceStatus } from './AIAnalyticsSettings.types';
import { UI_TEXT, TIMEOUTS } from './AIAnalyticsSettings.config';
import FeatureToggles from './AIAnalyticsSettings/components/FeatureToggles';
import AnalyticsConfiguration from './AIAnalyticsSettings/components/AnalyticsConfiguration';
import PerformanceMonitoring from './AIAnalyticsSettings/components/PerformanceMonitoring';
import SecurityPrivacy from './AIAnalyticsSettings/components/SecurityPrivacy';
import IntegrationSettings from './AIAnalyticsSettings/components/IntegrationSettings';
import SystemHealth from './AIAnalyticsSettings/components/SystemHealth';
import UserExperience from './AIAnalyticsSettings/components/UserExperience';
import TokenUsageDashboard from './AIAnalyticsSettings/components/TokenUsageDashboard';
import ThrottlingControls from './AIAnalyticsSettings/components/ThrottlingControls';
import { useAIUsageAlerts } from '../../../hooks/useAIUsageAlerts';
import AnalyticsOverviewPanel from './AnalyticsOverviewPanel';
import PerformancePanel from './PerformancePanel';

const AIAnalyticsSettings: React.FC = () => {
  const { getCurrentFacilityId } = useFacility();
  const facilityId = getCurrentFacilityId();
  const aiUsageAlerts = useAIUsageAlerts();

  // Initialize AI Settings service - must be called unconditionally
  const aiSettingsService = useAISettings();

  // State
  const [settings, setSettings] = useState<UnifiedAISettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_message, setMessage] = useState<MessageState | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('overview');

  // Load settings function
  const loadSettings = useCallback(async () => {
    if (!aiSettingsService) return;

    setIsLoading(true);
    try {
      const loadedSettings = await aiSettingsService.loadUnifiedSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      setMessage({ type: 'error', text: UI_TEXT.MESSAGES.SAVE_ERROR });
    } finally {
      setIsLoading(false);
    }
  }, [aiSettingsService]);

  // Load service status function
  const loadServiceStatus = useCallback(async () => {
    if (!aiSettingsService) return;

    try {
      const status = await aiSettingsService.getServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  }, [aiSettingsService]);

  // Load settings on component mount
  useEffect(() => {
    if (aiSettingsService) {
      loadSettings();
      loadServiceStatus();
    }
  }, [aiSettingsService, loadSettings, loadServiceStatus]);

  const saveSettings = async () => {
    if (!aiSettingsService || !settings) return;

    setIsSaving(true);
    try {
      const success = await aiSettingsService.saveUnifiedSettings(settings);

      if (success) {
        // Apply settings to running services
        await aiSettingsService.applySettings(settings);

        setMessage({
          type: 'success',
          text: UI_TEXT.MESSAGES.SAVE_SUCCESS,
        });
        setTimeout(() => setMessage(null), TIMEOUTS.MESSAGE_DISPLAY);

        // Reload service status
        await loadServiceStatus();
      } else {
        setMessage({ type: 'error', text: UI_TEXT.MESSAGES.SAVE_ERROR });
      }
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      setMessage({ type: 'error', text: UI_TEXT.MESSAGES.SAVE_ERROR });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!aiSettingsService) return;

    try {
      const defaultSettings = await aiSettingsService.loadUnifiedSettings();
      setSettings(defaultSettings);
      setMessage({ type: 'success', text: UI_TEXT.MESSAGES.RESET_SUCCESS });
      setTimeout(() => setMessage(null), TIMEOUTS.RESET_MESSAGE_DISPLAY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setMessage({ type: 'error', text: UI_TEXT.MESSAGES.RESET_ERROR });
    }
  };

  // Update functions for nested settings
  const updateComputerVision = (
    key: keyof UnifiedAISettings['computerVision'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            computerVision: { ...prev.computerVision, [key]: value },
          }
        : null
    );
  };

  const updatePredictiveAnalytics = (
    key: keyof UnifiedAISettings['predictiveAnalytics'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            predictiveAnalytics: { ...prev.predictiveAnalytics, [key]: value },
          }
        : null
    );
  };

  const updateSmartWorkflow = (
    key: keyof UnifiedAISettings['smartWorkflow'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            smartWorkflow: { ...prev.smartWorkflow, [key]: value },
          }
        : null
    );
  };

  const updateAnalytics = (
    key: keyof UnifiedAISettings['analytics'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            analytics: { ...prev.analytics, [key]: value },
          }
        : null
    );
  };

  const updateIntelligence = (
    key: keyof UnifiedAISettings['intelligence'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            intelligence: { ...prev.intelligence, [key]: value },
          }
        : null
    );
  };

  const updatePerformance = (
    key: keyof UnifiedAISettings['performance'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            performance: { ...prev.performance, [key]: value },
          }
        : null
    );
  };

  const updatePrivacy = (
    key: keyof UnifiedAISettings['privacy'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            privacy: { ...prev.privacy, [key]: value },
          }
        : null
    );
  };

  const updateIntegration = (
    key: keyof UnifiedAISettings['integration'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            integration: { ...prev.integration, [key]: value },
          }
        : null
    );
  };

  const updateUserExperience = (
    key: keyof UnifiedAISettings['userExperience'],
    value: boolean
  ) => {
    if (!settings) return;
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            userExperience: { ...prev.userExperience, [key]: value },
          }
        : null
    );
  };

  // Master AI toggle
  const updateMasterAI = (value: boolean) => {
    if (!settings) return;
    setSettings((prev) => (prev ? { ...prev, aiEnabled: value } : null));
  };

  if (!facilityId) {
    return (
      <div className="text-center py-8">
        <Icon
          path={mdiAlertCircle}
          size={2}
          className="text-red-500 mx-auto mb-4"
        />
        <p className="text-gray-600">
          {UI_TEXT.MESSAGES.FACILITY_NOT_AVAILABLE}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4] mx-auto mb-4"></div>
        <p className="text-gray-600">{UI_TEXT.MESSAGES.LOADING}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <Icon
          path={mdiAlertCircle}
          size={2}
          className="text-red-500 mx-auto mb-4"
        />
        <p className="text-gray-600">{UI_TEXT.MESSAGES.FAILED_TO_LOAD}</p>
      </div>
    );
  }

  // Early return if facility ID is not available
  if (!facilityId || !aiSettingsService) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Facility Not Available
            </h3>
            <p className="text-gray-600">
              AI Settings are not available because no facility is currently selected. 
              Please ensure you are logged in and have access to a facility.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Usage Alert Banner */}
      {aiUsageAlerts.hasIssues && (
        <div className={`p-4 rounded-lg border-l-4 ${
          aiUsageAlerts.isExceeded 
            ? 'bg-red-50 border-red-500' 
            : 'bg-yellow-50 border-yellow-500'
        }`}>
          <div className="flex items-center">
            <Icon 
              path={aiUsageAlerts.isExceeded ? mdiAlertCircle : mdiAlertCircle} 
              size={1.2} 
              className={`mr-3 ${
                aiUsageAlerts.isExceeded ? 'text-red-600' : 'text-yellow-600'
              }`} 
            />
            <div>
              <h3 className={`font-semibold ${
                aiUsageAlerts.isExceeded ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {aiUsageAlerts.isExceeded ? 'AI Usage Limit Exceeded' : 'AI Usage Warning'}
              </h3>
              <p className={`text-sm ${
                aiUsageAlerts.isExceeded ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {aiUsageAlerts.isExceeded 
                  ? `You've used ${aiUsageAlerts.usedTokens.toLocaleString()} tokens (${Math.round(aiUsageAlerts.usagePercentage)}%) of your ${aiUsageAlerts.limitTokens.toLocaleString()} token limit.`
                  : `You've used ${aiUsageAlerts.usedTokens.toLocaleString()} tokens (${Math.round(aiUsageAlerts.usagePercentage)}%) of your ${aiUsageAlerts.limitTokens.toLocaleString()} token limit. Consider adjusting throttling settings.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'usage', name: 'Usage & Limits', icon: '📈' },
              { id: 'features', name: 'AI Features', icon: '⚙️' },
              { id: 'settings', name: 'Settings', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#4ECDC4] text-[#4ECDC4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AnalyticsOverviewPanel
                isSaving={isSaving}
                onResetToDefaults={resetToDefaults}
                onSaveSettings={saveSettings}
              />
              {serviceStatus && <SystemHealth serviceStatus={serviceStatus} />}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <TokenUsageDashboard facilityId={facilityId} />
              <ThrottlingControls
                settings={{
                  enabled: true,
                  requestsPerMinute: 60,
                  requestsPerHour: 1000,
                  burstLimit: 10,
                  monthlyTokenLimit: 1000000,
                  warningThreshold: 75,
                  criticalThreshold: 90,
                }}
                onUpdateSettings={(newSettings) => {
                  console.log('Updating throttling settings:', newSettings);
                }}
                currentUsage={{
                  requestsThisMinute: 15,
                  requestsThisHour: 120,
                  monthlyTokens: 125000,
                  monthlyTokenLimit: 1000000,
                }}
              />
            </div>
          )}

          {activeTab === 'features' && (
            <FeatureToggles
              settings={settings}
              updateMasterAI={updateMasterAI}
              updateComputerVision={updateComputerVision}
              updatePredictiveAnalytics={updatePredictiveAnalytics}
              updateSmartWorkflow={updateSmartWorkflow}
            />
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsConfiguration
                settings={settings}
                updateAnalytics={updateAnalytics}
              />
              <PerformancePanel
                settings={settings}
                updateIntelligence={updateIntelligence}
              />
              <PerformanceMonitoring
                settings={settings}
                updatePerformance={updatePerformance}
              />
              <SecurityPrivacy
                settings={settings}
                updatePrivacy={updatePrivacy}
              />
              <IntegrationSettings
                settings={settings}
                updateIntegration={updateIntegration}
              />
              <UserExperience
                settings={settings}
                updateUserExperience={updateUserExperience}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsSettings;
