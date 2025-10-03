import React from 'react';
import Icon from '@mdi/react';
import { mdiTune } from '@mdi/js';
import { EnvironmentalCleaningAISettings, FORM_LIMITS } from './constants';

interface AdvancedTabProps {
  aiSettings: EnvironmentalCleaningAISettings;
  onAISettingChange: (
    field: keyof EnvironmentalCleaningAISettings,
    value: boolean | number | string
  ) => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({
  aiSettings,
  onAISettingChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiTune} size={1.5} className="text-gray-600" />
          <div>
            <h4 className="text-lg font-semibold text-gray-800">
              Advanced Settings
            </h4>
            <p className="text-sm text-gray-700">
              Advanced configuration and system settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="aiConfidenceThreshold"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              AI Confidence Threshold
            </label>
            <input
              id="aiConfidenceThreshold"
              type="number"
              value={aiSettings.aiConfidenceThreshold}
              onChange={(e) =>
                onAISettingChange(
                  'aiConfidenceThreshold',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              min={FORM_LIMITS.aiConfidenceThreshold.min}
              max={FORM_LIMITS.aiConfidenceThreshold.max}
              step={FORM_LIMITS.aiConfidenceThreshold.step}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum confidence for AI predictions
            </p>
          </div>

          <div>
            <label
              htmlFor="aiDataRetentionDays"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Data Retention (days)
            </label>
            <input
              id="aiDataRetentionDays"
              type="number"
              value={aiSettings.aiDataRetentionDays}
              onChange={(e) =>
                onAISettingChange('aiDataRetentionDays', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500"
              min={FORM_LIMITS.aiDataRetentionDays.min}
              max={FORM_LIMITS.aiDataRetentionDays.max}
            />
            <p className="text-xs text-gray-500 mt-1">
              How long to keep AI training data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTab;
