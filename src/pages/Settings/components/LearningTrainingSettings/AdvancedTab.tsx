import React from 'react';
import Icon from '@mdi/react';
import { mdiTune } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { LearningAISettings } from './types';

interface AdvancedTabProps {
  aiSettings: LearningAISettings;
  onAiSettingsChange: (settings: LearningAISettings) => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({
  aiSettings,
  onAiSettingsChange,
}) => {
  const updateSetting = <K extends keyof LearningAISettings>(
    key: K,
    value: LearningAISettings[K]
  ) => {
    onAiSettingsChange({ ...aiSettings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiTune} size={1.5} className="text-gray-600" />
          <div>
            <h4 className="text-lg font-semibold text-gray-800">
              Advanced Configuration
            </h4>
            <p className="text-sm text-gray-700">
              Advanced settings for power users
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Data & Privacy">
            <ToggleSwitch
              id="data-sharing-enabled"
              checked={aiSettings.dataSharingEnabled}
              onChange={(checked) =>
                updateSetting('dataSharingEnabled', checked)
              }
              label="Enable Data Sharing for AI Training"
            />
            <ToggleSwitch
              id="local-ai-processing-enabled"
              checked={aiSettings.localAIProcessingEnabled}
              onChange={(checked) =>
                updateSetting('localAIProcessingEnabled', checked)
              }
              label="Local AI Processing"
            />
            <ToggleSwitch
              id="encrypted-data-transmission"
              checked={aiSettings.encryptedDataTransmission}
              onChange={(checked) =>
                updateSetting('encryptedDataTransmission', checked)
              }
              label="Encrypted Data Transmission"
            />
          </FormGroup>

          <FormGroup title="System Information">
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">AI Model Version:</span>{' '}
                {aiSettings.modelVersion}
              </div>
              <div>
                <span className="font-medium">Data Retention:</span>{' '}
                {aiSettings.dataRetentionDays} days
              </div>
              <div>
                <span className="font-medium">Confidence Threshold:</span>{' '}
                {Math.round(aiSettings.aiConfidenceThreshold * 100)}%
              </div>
              <div>
                <span className="font-medium">Recommendation Limit:</span>{' '}
                {aiSettings.recommendationLimit} items
              </div>
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTab;
