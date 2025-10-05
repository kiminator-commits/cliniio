import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain } from '@mdi/js';
import { SterilizationAISettings as SterilizationAISettingsType } from '../../../../../services/ai/sterilizationAIService';
import { STERILIZATION_AI_CONSTANTS } from '../../sterilizationAI';

interface AIConfigurationPerformanceProps {
  settings: SterilizationAISettingsType;
  onInputChange: (
    field: keyof SterilizationAISettingsType,
    value: string | number | boolean
  ) => void;
}

const AIConfigurationPerformance: React.FC<AIConfigurationPerformanceProps> = ({
  settings,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiBrain} size={1.2} className="text-purple-600" />
        AI Configuration & Performance
      </h5>

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
            type="range"
            min={STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN}
            max={STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX}
            step={STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_STEP}
            value={settings.ai_confidence_threshold}
            onChange={(e) =>
              onInputChange(
                'ai_confidence_threshold',
                parseFloat(e.target.value)
              )
            }
            disabled={!settings.ai_enabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>
              {STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN * 100}%
            </span>
            <span>{Math.round(settings.ai_confidence_threshold * 100)}%</span>
            <span>
              {STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX * 100}%
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="aiDataRetentionDays"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            AI Data Retention (days)
          </label>
          <input
            id="aiDataRetentionDays"
            type="number"
            value={settings.ai_data_retention_days}
            onChange={(e) =>
              onInputChange('ai_data_retention_days', parseInt(e.target.value))
            }
            disabled={!settings.ai_enabled}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
            min={STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MIN}
            max={STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MAX}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <label
          htmlFor="realTimeProcessingEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="realTimeProcessingEnabled"
            type="checkbox"
            checked={settings.real_time_processing_enabled}
            onChange={(e) =>
              onInputChange('real_time_processing_enabled', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Real-time AI Processing
          </span>
          <span className="sr-only">Real-time AI Processing</span>
        </label>
      </div>
    </div>
  );
};

export default AIConfigurationPerformance;
