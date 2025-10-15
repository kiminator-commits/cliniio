import React from 'react';
import Icon from '@mdi/react';
import { mdiContentSave, mdiRefresh } from '@mdi/js';
import MasterAIToggle from './sterilization/MasterAIToggle';
import CycleConfiguration from './sterilization/CycleConfiguration';
import AIConfigurationPerformance from './SterilizationAISettings/components/AIConfigurationPerformance';
import ApiKeysServices from './SterilizationAISettings/components/ApiKeysServices';
import PrivacyDataSecurity from './SterilizationAISettings/components/PrivacyDataSecurity';
import { MessageDisplay } from './SterilizationAISettings/MessageDisplay';
import { ComputerVisionSection } from './SterilizationAISettings/ComputerVisionSection';
import { PredictiveAnalyticsSection } from './SterilizationAISettings/PredictiveAnalyticsSection';
import { SmartWorkflowSection } from './SterilizationAISettings/SmartWorkflowSection';
import { useSterilizationAISettings } from './SterilizationAISettings/hooks';

const SterilizationAISettings: React.FC = () => {
  const {
    settings,
    isLoading,
    isSaving,
    message,
    loadSettings,
    saveSettings,
    handleInputChange,
    handleApiKeyChange,
  } = useSterilizationAISettings();

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
      <MessageDisplay message={message} />

      {/* Master AI Toggle */}
      <MasterAIToggle
        aiEnabled={settings.ai_enabled}
        onToggle={(enabled) => handleInputChange('ai_enabled', enabled)}
      />

      {/* Feature Categories */}
      <div className="space-y-6">
        {/* Computer Vision Features */}
        <ComputerVisionSection
          settings={settings}
          onSettingsChange={handleInputChange}
        />

        {/* Predictive Analytics */}
        <PredictiveAnalyticsSection
          settings={settings}
          onSettingsChange={handleInputChange}
        />

        {/* Smart Workflow Automation */}
        <SmartWorkflowSection
          settings={settings}
          onSettingsChange={handleInputChange}
        />

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
