import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiCheckCircle,
  mdiAlertCircle,
} from '@mdi/js';

import {
  useAISettings,
  UnifiedAISettings,
} from '../../../services/ai/aiSettingsService';
import { useFacility } from '../../../contexts/FacilityContext';

import {
  MessageState,
  ServiceStatus,
} from './AIAnalyticsSettings.types';
import { UI_TEXT, TIMEOUTS } from './AIAnalyticsSettings.config';
import FeatureToggles from './AIAnalyticsSettings/components/FeatureToggles';
import AnalyticsConfiguration from './AIAnalyticsSettings/components/AnalyticsConfiguration';
import PerformanceMonitoring from './AIAnalyticsSettings/components/PerformanceMonitoring';
import SecurityPrivacy from './AIAnalyticsSettings/components/SecurityPrivacy';
import IntegrationSettings from './AIAnalyticsSettings/components/IntegrationSettings';
import SystemHealth from './AIAnalyticsSettings/components/SystemHealth';
import UserExperience from './AIAnalyticsSettings/components/UserExperience';
import AnalyticsOverviewPanel from './AnalyticsOverviewPanel';
import PerformancePanel from './PerformancePanel';


const AIAnalyticsSettings: React.FC = () => {
  const { getCurrentFacilityId } = useFacility();
  const facilityId = getCurrentFacilityId();

  // Initialize AI Settings service - must be called unconditionally
  const aiSettingsService = useAISettings();

  // State
  const [settings, setSettings] = useState<UnifiedAISettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);

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
        <p className="text-gray-600">
          {UI_TEXT.MESSAGES.FAILED_TO_LOAD}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsOverviewPanel
        isSaving={isSaving}
        onResetToDefaults={resetToDefaults}
        onSaveSettings={saveSettings}
      />

      {/* Service Status */}
      {serviceStatus && <SystemHealth serviceStatus={serviceStatus} />}

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={
                message.type === 'success' ? mdiCheckCircle : mdiAlertCircle
              }
              size={1}
            />
            {message.text}
          </div>
        </div>
      )}

      <FeatureToggles
        settings={settings}
        updateMasterAI={updateMasterAI}
        updateComputerVision={updateComputerVision}
        updatePredictiveAnalytics={updatePredictiveAnalytics}
        updateSmartWorkflow={updateSmartWorkflow}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Analytics Configuration */}
        <AnalyticsConfiguration
          settings={settings}
          updateAnalytics={updateAnalytics}
        />

        <PerformancePanel
          settings={settings}
          updateIntelligence={updateIntelligence}
        />

        {/* Performance Monitoring */}
        <PerformanceMonitoring
          settings={settings}
          updatePerformance={updatePerformance}
        />

        {/* Data Privacy & Security */}
        <SecurityPrivacy
          settings={settings}
          updatePrivacy={updatePrivacy}
        />

        {/* Integration Settings */}
        <IntegrationSettings
          settings={settings}
          updateIntegration={updateIntegration}
        />

        {/* User Experience */}
        <UserExperience
          settings={settings}
          updateUserExperience={updateUserExperience}
        />
      </div>
    </div>
  );
};

export default AIAnalyticsSettings;
