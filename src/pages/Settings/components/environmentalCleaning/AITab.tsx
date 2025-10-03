import React from 'react';
import Icon from '@mdi/react';
import { mdiChartLine, mdiShield } from '@mdi/js';
import {
  EnvironmentalCleaningAISettings,
  AI_FEATURE_CATEGORIES,
} from './constants';

interface AITabProps {
  aiSettings: EnvironmentalCleaningAISettings;
  onAISettingChange: (
    field: keyof EnvironmentalCleaningAISettings,
    value: boolean | number | string
  ) => void;
}

const AITab: React.FC<AITabProps> = ({ aiSettings, onAISettingChange }) => {
  return (
    <div className="space-y-6">
      {/* Master AI Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiChartLine} size={1.5} className="text-purple-600" />
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
              htmlFor="aiEnabled"
              className="text-sm font-medium text-purple-800"
            >
              Enable AI Features
            </label>
            <p className="text-xs text-purple-600 mt-1">
              Master switch for all environmental cleaning AI capabilities
            </p>
          </div>
          <button
            id="aiEnabled"
            onClick={() =>
              onAISettingChange('aiEnabled', !aiSettings.aiEnabled)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              aiSettings.aiEnabled ? 'bg-purple-600' : 'bg-gray-200'
            }`}
            aria-label="Enable AI Features"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiSettings.aiEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* AI Feature Categories */}
      <div className="space-y-6">
        {/* Predictive Cleaning */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiChartLine} size={1.2} className="text-green-600" />
            <h4 className="font-medium text-gray-800">Predictive Cleaning</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURE_CATEGORIES.predictiveCleaning.map(
              ({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label
                      htmlFor={key}
                      className="text-sm font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                  <button
                    id={key}
                    onClick={() =>
                      onAISettingChange(
                        key as keyof EnvironmentalCleaningAISettings,
                        !aiSettings[
                          key as keyof EnvironmentalCleaningAISettings
                        ]
                      )
                    }
                    disabled={!aiSettings.aiEnabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 ${
                      aiSettings[key as keyof EnvironmentalCleaningAISettings]
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    } ${!aiSettings.aiEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={label}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        aiSettings[key as keyof EnvironmentalCleaningAISettings]
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

        {/* Smart Room Management */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiShield} size={1.2} className="text-blue-600" />
            <h4 className="font-medium text-gray-800">Smart Room Management</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_FEATURE_CATEGORIES.smartRoomManagement.map(
              ({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      onAISettingChange(
                        key as keyof EnvironmentalCleaningAISettings,
                        !aiSettings[
                          key as keyof EnvironmentalCleaningAISettings
                        ]
                      )
                    }
                    disabled={!aiSettings.aiEnabled}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                      aiSettings[key as keyof EnvironmentalCleaningAISettings]
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } ${!aiSettings.aiEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        aiSettings[key as keyof EnvironmentalCleaningAISettings]
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
      </div>
    </div>
  );
};

export default AITab;
