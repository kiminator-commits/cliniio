import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { SterilizationAISettings as SterilizationAISettingsType } from '../../../services/ai/sterilization/types';
import Icon from '@mdi/react';
import {
  mdiCog,
  mdiContentSave,
  mdiRefresh,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiChartBar,
} from '@mdi/js';
import {
  fetchSettings,
  saveSettings as saveSettingsToStorage,
  STERILIZATION_AI_CONSTANTS,
  DEFAULT_SETTINGS,
} from './sterilizationAI';
import { Message } from '../../../types/sterilizationAISettingsTypes';
import { isValidApiKeyValue } from '../utils/sterilizationAISettingsUtils';
import MasterAIToggle from './sterilization/MasterAIToggle';
import CycleConfiguration from './sterilization/CycleConfiguration';
import AIConfigurationPerformance from './components/AIConfigurationPerformance';
import ApiKeysServices from './components/ApiKeysServices';
import PrivacyDataSecurity from './components/PrivacyDataSecurity';

const SterilizationAISettings: React.FC = () => {
  const { currentUser: user } = useUser();
  const [settings, setSettings] = useState<SterilizationAISettingsType>({
    facility_id: user?.id || '',
    ai_version: STERILIZATION_AI_CONSTANTS.DEFAULT_AI_VERSION,
    ...DEFAULT_SETTINGS,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const mappedSettings = await fetchSettings(user.id);
      if (mappedSettings) {
        setSettings((prev) => ({
          ...prev,
          ...mappedSettings,
        }));
      }
    } catch (error) {
      console.error('Failed to load sterilization AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      await saveSettingsToStorage(settings, user.id);

      setMessage({
        type: 'success',
        text: 'Sterilization AI settings saved successfully',
      });
      setTimeout(
        () => setMessage(null),
        STERILIZATION_AI_CONSTANTS.SUCCESS_MESSAGE_TIMEOUT
      );
    } catch (error) {
      console.error('Failed to save sterilization AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof SterilizationAISettingsType,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleApiKeyChange = (
    field:
      | 'openai_api_key_encrypted'
      | 'google_vision_api_key_encrypted'
      | 'azure_computer_vision_key_encrypted',
    value: string
  ) => {
    if (isValidApiKeyValue(value)) {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">
          Loading sterilization AI settings...
        </span>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Sterilization AI Settings</h4>
      <p className="text-sm text-gray-600 mb-6">
        Configure AI-powered sterilization features and machine learning
        capabilities
      </p>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg border mb-6 ${
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
              className="text-current"
            />
            {message.text}
          </div>
        </div>
      )}

      {/* Master AI Toggle */}
      <MasterAIToggle
        aiEnabled={settings.ai_enabled}
        onToggle={(enabled) => handleInputChange('ai_enabled', enabled)}
      />

      {/* Feature Categories */}
      <div className="space-y-6">
        {/* Computer Vision Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Icon path={mdiChartBar} size={1.2} className="text-blue-600" />
            Computer Vision & Image Recognition
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="computerVisionEnabled"
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.computer_vision_enabled}
                  onChange={(e) =>
                    handleInputChange(
                      'computer_vision_enabled',
                      e.target.checked
                    )
                  }
                  disabled={!settings.ai_enabled}
                />
                <div
                  className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.computer_vision_enabled ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'} ${!settings.ai_enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                ></div>
                <span className="sr-only">
                  Enable Computer Vision - Master toggle for all vision features
                </span>
              </label>
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Enable Computer Vision
                </span>
                <p className="text-xs text-gray-500">
                  Master toggle for all vision features
                </p>
              </div>
            </div>

            <label
              htmlFor="toolConditionAssessment"
              className="flex items-center gap-3"
            >
              <input
                id="toolConditionAssessment"
                type="checkbox"
                checked={settings.tool_condition_assessment}
                onChange={(e) =>
                  handleInputChange(
                    'tool_condition_assessment',
                    e.target.checked
                  )
                }
                disabled={
                  !settings.ai_enabled || !settings.computer_vision_enabled
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Tool Condition Assessment
                </span>
                <p className="text-xs text-gray-500">
                  AI-powered tool wear and damage detection
                </p>
              </div>
              <span className="sr-only">
                Tool Condition Assessment - AI-powered tool wear and damage
                detection
              </span>
            </label>

            <label
              htmlFor="barcodeQualityDetection"
              className="flex items-center gap-3"
            >
              <input
                id="barcodeQualityDetection"
                type="checkbox"
                checked={settings.barcode_quality_detection}
                onChange={(e) =>
                  handleInputChange(
                    'barcode_quality_detection',
                    e.target.checked
                  )
                }
                disabled={
                  !settings.ai_enabled || !settings.computer_vision_enabled
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Barcode Quality Detection
                </span>
                <p className="text-xs text-gray-500">
                  Automatic barcode readability assessment
                </p>
              </div>
              <span className="sr-only">
                Barcode Quality Detection - Automatic barcode readability
                assessment
              </span>
            </label>

            <label
              htmlFor="toolTypeRecognition"
              className="flex items-center gap-3"
            >
              <input
                id="toolTypeRecognition"
                type="checkbox"
                checked={settings.tool_type_recognition}
                onChange={(e) =>
                  handleInputChange('tool_type_recognition', e.target.checked)
                }
                disabled={
                  !settings.ai_enabled || !settings.computer_vision_enabled
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Tool Type Recognition
                </span>
                <p className="text-xs text-gray-500">
                  Automatic tool identification from images
                </p>
              </div>
              <span className="sr-only">
                Tool Type Recognition - Automatic tool identification from
                images
              </span>
            </label>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Icon path={mdiChartBar} size={1.2} className="text-green-600" />
            Predictive Analytics & Optimization
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              htmlFor="predictiveAnalyticsEnabled"
              className="flex items-center gap-3"
            >
              <input
                id="predictiveAnalyticsEnabled"
                type="checkbox"
                checked={settings.predictive_analytics_enabled}
                onChange={(e) =>
                  handleInputChange(
                    'predictive_analytics_enabled',
                    e.target.checked
                  )
                }
                disabled={!settings.ai_enabled}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Enable Predictive Analytics
                </span>
                <p className="text-xs text-gray-500">
                  Master toggle for all predictive features
                </p>
              </div>
              <span className="sr-only">
                Enable Predictive Analytics - Master toggle for all predictive
                features
              </span>
            </label>

            <label
              htmlFor="failurePrediction"
              className="flex items-center gap-3"
            >
              <input
                id="failurePrediction"
                type="checkbox"
                checked={settings.failure_prediction}
                onChange={(e) =>
                  handleInputChange('failure_prediction', e.target.checked)
                }
                disabled={
                  !settings.ai_enabled || !settings.predictive_analytics_enabled
                }
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Failure Prediction
                </span>
                <p className="text-xs text-gray-500">
                  Predict equipment failures before they happen
                </p>
              </div>
              <span className="sr-only">
                Failure Prediction - Predict equipment failures before they
                happen
              </span>
            </label>
          </div>
        </div>

        {/* Smart Workflow Automation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Icon path={mdiCog} size={1.2} className="text-orange-600" />
            Smart Workflow Automation
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              htmlFor="smartWorkflowEnabled"
              className="flex items-center gap-3"
            >
              <input
                id="smartWorkflowEnabled"
                type="checkbox"
                checked={settings.smart_workflow_enabled}
                onChange={(e) =>
                  handleInputChange('smart_workflow_enabled', e.target.checked)
                }
                disabled={!settings.ai_enabled}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Enable Smart Workflows
                </span>
                <p className="text-xs text-gray-500">
                  Master toggle for all workflow automation
                </p>
              </div>
              <span className="sr-only">
                Enable Smart Workflows - Master toggle for all workflow
                automation
              </span>
            </label>

            <label
              htmlFor="intelligentWorkflowSelection"
              className="flex items-center gap-3"
            >
              <input
                id="intelligentWorkflowSelection"
                type="checkbox"
                checked={settings.intelligent_workflow_selection}
                onChange={(e) =>
                  handleInputChange(
                    'intelligent_workflow_selection',
                    e.target.checked
                  )
                }
                disabled={
                  !settings.ai_enabled || !settings.smart_workflow_enabled
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Intelligent Workflow Selection
                </span>
                <p className="text-xs text-gray-500">
                  AI suggests optimal workflow based on tool condition
                </p>
              </div>
              <span className="sr-only">
                Intelligent Workflow Selection - AI suggests optimal workflow
                based on tool condition
              </span>
            </label>

            <label
              htmlFor="automatedProblemDetection"
              className="flex items-center gap-3"
            >
              <input
                id="automatedProblemDetection"
                type="checkbox"
                checked={settings.automated_problem_detection}
                onChange={(e) =>
                  handleInputChange(
                    'automated_problem_detection',
                    e.target.checked
                  )
                }
                disabled={
                  !settings.ai_enabled || !settings.smart_workflow_enabled
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Automated Problem Detection
                </span>
                <p className="text-xs text-gray-500">
                  Automatically detect and flag potential issues
                </p>
              </div>
              <span className="sr-only">
                Automated Problem Detection - Automatically detect and flag
                potential issues
              </span>
            </label>
          </div>
        </div>

        {/* Cycle Configuration */}
        <CycleConfiguration
          settings={settings}
          onInputChange={handleInputChange}
        />

        {/* AI Configuration */}
        <AIConfigurationPerformance
          settings={settings}
          onInputChange={handleInputChange}
        />

        {/* API Keys & Services */}
        <ApiKeysServices
          settings={settings}
          onApiKeyChange={handleApiKeyChange}
        />

        {/* Privacy & Data */}
        <PrivacyDataSecurity
          settings={settings}
          onInputChange={handleInputChange}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={loadSettings}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <Icon path={mdiRefresh} size={1} className="inline mr-2" />
          Reset
        </button>

        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <Icon path={mdiContentSave} size={1} className="inline mr-2" />
          {isSaving ? 'Saving...' : 'Save AI Settings'}
        </button>
      </div>
    </div>
  );
};

export default SterilizationAISettings;
