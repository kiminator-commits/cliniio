import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { LearningAISettings } from './types';

interface AITabProps {
  settings: LearningAISettings;
  onSettingsChange: (settings: LearningAISettings) => void;
}

const AITab: React.FC<AITabProps> = ({ settings, onSettingsChange }) => {
  const updateSetting = <K extends keyof LearningAISettings>(
    key: K,
    value: LearningAISettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiBrain} size={1.5} className="text-purple-600" />
          <div>
            <h4 className="text-lg font-semibold text-purple-800">
              AI Learning Features
            </h4>
            <p className="text-sm text-purple-700">
              Configure AI-powered learning capabilities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="AI Learning Features">
            <ToggleSwitch
              id="personalized-recommendations"
              checked={settings.personalizedRecommendations}
              onChange={(checked) =>
                updateSetting('personalizedRecommendations', checked)
              }
              label="Personalized Recommendations"
            />
            <ToggleSwitch
              id="skill-gap-analysis"
              checked={settings.skillGapAnalysis}
              onChange={(checked) => updateSetting('skillGapAnalysis', checked)}
              label="Skill Gap Analysis"
            />
            <ToggleSwitch
              id="learning-path-optimization"
              checked={settings.learningPathOptimization}
              onChange={(checked) =>
                updateSetting('learningPathOptimization', checked)
              }
              label="Learning Path Optimization"
            />
            <ToggleSwitch
              id="adaptive-difficulty"
              checked={settings.adaptiveDifficulty}
              onChange={(checked) =>
                updateSetting('adaptiveDifficulty', checked)
              }
              label="Adaptive Difficulty"
            />
          </FormGroup>

          <FormGroup title="AI Configuration">
            <div>
              <label
                htmlFor="ai-confidence-threshold"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                AI Confidence Threshold
              </label>
              <input
                id="ai-confidence-threshold"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.aiConfidenceThreshold}
                onChange={(e) =>
                  updateSetting(
                    'aiConfidenceThreshold',
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <span className="text-sm text-gray-600">
                {Math.round(settings.aiConfidenceThreshold * 100)}%
              </span>
            </div>
            <div>
              <label
                htmlFor="recommendation-limit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recommendation Limit
              </label>
              <input
                id="recommendation-limit"
                type="number"
                min="1"
                max="20"
                value={settings.recommendationLimit}
                onChange={(e) =>
                  updateSetting('recommendationLimit', parseInt(e.target.value))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label
                htmlFor="data-retention-days"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Retention (Days)
              </label>
              <input
                id="data-retention-days"
                type="number"
                min="30"
                max="1095"
                value={settings.dataRetentionDays}
                onChange={(e) =>
                  updateSetting('dataRetentionDays', parseInt(e.target.value))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default AITab;
