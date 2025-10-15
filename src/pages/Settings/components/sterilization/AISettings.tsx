import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiBrain,
  mdiCog,
  mdiContentSave,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiChartBar,
  mdiTune,
} from '@mdi/js';
import { SterilizationAISettings } from '@/services/ai/sterilizationAIService';
import { useFacility } from '@/contexts/FacilityContext';
import {
  AI_FEATURE_CATEGORIES,
  AI_DATA_RETENTION_OPTIONS,
  AI_CONFIDENCE_THRESHOLD_LIMITS,
  MESSAGE_TIMEOUT,
} from './settings';
import {
  fetchSettings,
  saveSettings,
  resetDefaults,
  createDefaultSettings,
} from './settings';
import {
  trackSettingChanged,
  trackSaveAttempt,
  trackSaveResult,
  trackResetAttempt,
  trackResetResult,
  trackAIFeatureToggle,
} from './settings';

export const AISettings: React.FC = () => {
  const { getCurrentFacilityId } = useFacility();

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<SterilizationAISettings>(() => {
    const facilityId = getCurrentFacilityId();
    return createDefaultSettings(facilityId || '');
  });

  const [aiMessage, setAiMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // AI Settings Helper Functions
  const handleAISettingChange = (
    field: keyof SterilizationAISettings,
    value: boolean | number | string
  ) => {
    const facilityId = getCurrentFacilityId();
    if (facilityId) {
      trackAIFeatureToggle(field, value as boolean, facilityId);
    }
    setAiSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAISettingsSave = async () => {
    try {
      setIsLoading(true);

      // Get user context for facility_id
      const facilityId = getCurrentFacilityId();
      if (!facilityId) {
        setAiMessage({ type: 'error', text: 'User facility not found' });
        return;
      }

      trackSaveAttempt(aiSettings, facilityId);

      // Save settings using extracted API function
      const success = await saveSettings(facilityId, aiSettings);

      if (success) {
        trackSaveResult(true, facilityId);
        setAiMessage({
          type: 'success',
          text: 'AI settings saved successfully!',
        });
        setTimeout(() => setAiMessage(null), MESSAGE_TIMEOUT);
      } else {
        trackSaveResult(false, facilityId, 'Save operation failed');
        setAiMessage({ type: 'error', text: 'Failed to save AI settings' });
      }
    } catch (error) {
      trackSaveResult(
        false,
        getCurrentFacilityId() || '',
        error instanceof Error ? error.message : 'Unknown error'
      );
      setAiMessage({ type: 'error', text: 'Failed to save AI settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISettingsReset = async () => {
    try {
      setIsLoading(true);

      const facilityId = getCurrentFacilityId();
      if (!facilityId) {
        setAiMessage({ type: 'error', text: 'User facility not found' });
        return;
      }

      trackResetAttempt(facilityId);

      const defaultSettings = createDefaultSettings(facilityId);
      setAiSettings(defaultSettings);

      // Save to database using extracted API function
      const success = await resetDefaults(facilityId);

      if (success) {
        trackResetResult(true, facilityId);
        setAiMessage({
          type: 'success',
          text: 'AI settings reset to defaults',
        });
        setTimeout(() => setAiMessage(null), MESSAGE_TIMEOUT);
      } else {
        trackResetResult(false, facilityId, 'Reset operation failed');
        setAiMessage({ type: 'error', text: 'Failed to reset AI settings' });
      }
    } catch (error) {
      trackResetResult(
        false,
        getCurrentFacilityId() || '',
        error instanceof Error ? error.message : 'Unknown error'
      );
      setAiMessage({ type: 'error', text: 'Failed to reset AI settings' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load AI settings on component mount
  useEffect(() => {
    const loadAISettings = async () => {
      const facilityId = getCurrentFacilityId();
      if (!facilityId) return;

      try {
        const settings = await fetchSettings(facilityId);

        if (settings) {
          setAiSettings(settings);
        } else {
          // Create default settings if none exist
          const defaultSettings = createDefaultSettings(facilityId);
          setAiSettings(defaultSettings);
          await saveSettings(facilityId, defaultSettings);
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    };

    loadAISettings();
  }, [getCurrentFacilityId]);

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            AI-Powered Sterilization Features
          </h3>
          <p className="text-sm text-gray-600">
            Configure intelligent automation and machine learning capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAISettingsReset}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          >
            Reset
          </button>
          <button
            onClick={handleAISettingsSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-[#4ECDC4] text-white rounded-md hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] disabled:opacity-50"
          >
            <Icon path={mdiContentSave} size={0.8} className="inline mr-1" />
            Save AI Settings
          </button>
        </div>
      </div>

      {/* AI Message Display */}
      {aiMessage && (
        <div
          className={`p-4 rounded-lg border mb-6 ${
            aiMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={
                aiMessage.type === 'success' ? mdiCheckCircle : mdiAlertCircle
              }
              size={1}
              className="text-current"
            />
            {aiMessage.text}
          </div>
        </div>
      )}

      {/* Master AI Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiBrain} size={1.5} className="text-purple-600" />
          <div>
            <h4 className="text-lg font-semibold text-purple-800">
              Master AI Control
            </h4>
            <p className="text-sm text-purple-700">
              Enable or disable all AI features globally
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor="aiEnabledToggle"
              className="text-sm font-medium text-purple-800"
            >
              Enable AI Features
            </label>
            <p className="text-xs text-purple-600 mt-1">
              Master switch for all sterilization AI capabilities
            </p>
          </div>
          <button
            id="aiEnabledToggle"
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackSettingChanged(
                  'ai_enabled',
                  aiSettings.ai_enabled,
                  !aiSettings.ai_enabled,
                  facilityId
                );
              }
              handleAISettingChange('ai_enabled', !aiSettings.ai_enabled);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              aiSettings.ai_enabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            aria-label={`${aiSettings.ai_enabled ? 'Disable' : 'Enable'} AI Features`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiSettings.ai_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* AI Feature Categories */}
      <div className="space-y-6">
        {/* Computer Vision */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiCog} size={1.2} className="text-blue-600" />
            <h4 className="font-medium text-gray-800">Computer Vision</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURE_CATEGORIES.COMPUTER_VISION.map(
              ({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label
                      htmlFor={`${key}Toggle`}
                      className="text-sm font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                  <button
                    id={`${key}Toggle`}
                    onClick={() => {
                      const facilityId = getCurrentFacilityId();
                      if (facilityId) {
                        trackSettingChanged(
                          key as keyof SterilizationAISettings,
                          aiSettings[key as keyof SterilizationAISettings],
                          !aiSettings[key as keyof SterilizationAISettings],
                          facilityId
                        );
                      }
                      handleAISettingChange(
                        key as keyof SterilizationAISettings,
                        !aiSettings[key as keyof SterilizationAISettings]
                      );
                    }}
                    disabled={!aiSettings.ai_enabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      aiSettings[key as keyof SterilizationAISettings]
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } ${!aiSettings.ai_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={`${aiSettings[key as keyof SterilizationAISettings] ? 'Disable' : 'Enable'} ${label}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        aiSettings[key as keyof SterilizationAISettings]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiChartBar} size={1.2} className="text-green-600" />
            <h4 className="font-medium text-gray-800">Predictive Analytics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURE_CATEGORIES.PREDICTIVE_ANALYTICS.map(
              ({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label
                      htmlFor={`${key}Toggle`}
                      className="text-sm font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                  <button
                    id={`${key}Toggle`}
                    onClick={() => {
                      const facilityId = getCurrentFacilityId();
                      if (facilityId) {
                        trackSettingChanged(
                          key as keyof SterilizationAISettings,
                          aiSettings[key as keyof SterilizationAISettings],
                          !aiSettings[key as keyof SterilizationAISettings],
                          facilityId
                        );
                      }
                      handleAISettingChange(
                        key as keyof SterilizationAISettings,
                        !aiSettings[key as keyof SterilizationAISettings]
                      );
                    }}
                    disabled={!aiSettings.ai_enabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                      aiSettings[key as keyof SterilizationAISettings]
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    } ${!aiSettings.ai_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={`${aiSettings[key as keyof SterilizationAISettings] ? 'Disable' : 'Enable'} ${label}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        aiSettings[key as keyof SterilizationAISettings]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* Smart Workflow */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiCog} size={1.2} className="text-orange-600" />
            <h4 className="font-medium text-gray-800">
              Smart Workflow Automation
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURE_CATEGORIES.SMART_WORKFLOW.map(
              ({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label
                      htmlFor={`${key}Toggle`}
                      className="text-sm font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                  <button
                    id={`${key}Toggle`}
                    onClick={() => {
                      const facilityId = getCurrentFacilityId();
                      if (facilityId) {
                        trackSettingChanged(
                          key as keyof SterilizationAISettings,
                          aiSettings[key as keyof SterilizationAISettings],
                          !aiSettings[key as keyof SterilizationAISettings],
                          facilityId
                        );
                      }
                      handleAISettingChange(
                        key as keyof SterilizationAISettings,
                        !aiSettings[key as keyof SterilizationAISettings]
                      );
                    }}
                    disabled={!aiSettings.ai_enabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 ${
                      aiSettings[key as keyof SterilizationAISettings]
                        ? 'bg-orange-600'
                        : 'bg-gray-200'
                    } ${!aiSettings.ai_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={`${aiSettings[key as keyof SterilizationAISettings] ? 'Disable' : 'Enable'} ${label}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        aiSettings[key as keyof SterilizationAISettings]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        </div>

        {/* AI Configuration */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiTune} size={1.2} className="text-purple-600" />
            <h4 className="font-medium text-gray-800">AI Configuration</h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="aiConfidenceThreshold"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI Confidence Threshold
                </label>
                <input
                  id="aiConfidenceThreshold"
                  type="range"
                  min={AI_CONFIDENCE_THRESHOLD_LIMITS.min}
                  max={AI_CONFIDENCE_THRESHOLD_LIMITS.max}
                  step={AI_CONFIDENCE_THRESHOLD_LIMITS.step}
                  value={aiSettings.ai_confidence_threshold || 0.8}
                  onChange={(e) => {
                    const facilityId = getCurrentFacilityId();
                    if (facilityId) {
                      trackSettingChanged(
                        'ai_confidence_threshold',
                        aiSettings.ai_confidence_threshold,
                        parseFloat(e.target.value),
                        facilityId
                      );
                    }
                    handleAISettingChange(
                      'ai_confidence_threshold',
                      parseFloat(e.target.value)
                    );
                  }}
                  disabled={!aiSettings.ai_enabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50%</span>
                  <span>
                    {Math.round(aiSettings.ai_confidence_threshold * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="aiDataRetentionDays"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data Retention (Days)
                </label>
                <select
                  id="aiDataRetentionDays"
                  value={aiSettings.ai_data_retention_days || 365}
                  onChange={(e) => {
                    const facilityId = getCurrentFacilityId();
                    if (facilityId) {
                      trackSettingChanged(
                        'ai_data_retention_days',
                        aiSettings.ai_data_retention_days,
                        parseInt(e.target.value),
                        facilityId
                      );
                    }
                    handleAISettingChange(
                      'ai_data_retention_days',
                      parseInt(e.target.value)
                    );
                  }}
                  disabled={!aiSettings.ai_enabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4] disabled:opacity-50"
                >
                  {AI_DATA_RETENTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
