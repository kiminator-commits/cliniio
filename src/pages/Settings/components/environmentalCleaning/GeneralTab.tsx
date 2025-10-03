import React from 'react';
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import { CleaningProtocolSettings, FORM_LIMITS } from './constants';

interface GeneralTabProps {
  protocolSettings: CleaningProtocolSettings;
  onProtocolSettingChange: (
    field: keyof CleaningProtocolSettings,
    value: boolean | number | string | string[]
  ) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  protocolSettings,
  onProtocolSettingChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiCog} size={1.5} className="text-blue-600" />
          <div>
            <h4 className="text-lg font-semibold text-blue-800">
              General Settings
            </h4>
            <p className="text-sm text-blue-700">
              Basic configuration for environmental cleaning
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="defaultCleaningDuration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Default Cleaning Duration (minutes)
            </label>
            <input
              id="defaultCleaningDuration"
              type="number"
              value={protocolSettings.defaultCleaningDuration}
              onChange={(e) =>
                onProtocolSettingChange(
                  'defaultCleaningDuration',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={FORM_LIMITS.defaultCleaningDuration.min}
              max={FORM_LIMITS.defaultCleaningDuration.max}
            />
          </div>

          <div>
            <label
              htmlFor="qualityScoreThreshold"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quality Score Threshold
            </label>
            <input
              id="qualityScoreThreshold"
              type="number"
              value={protocolSettings.qualityScoreThreshold}
              onChange={(e) =>
                onProtocolSettingChange(
                  'qualityScoreThreshold',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={FORM_LIMITS.qualityScoreThreshold.min}
              max={FORM_LIMITS.qualityScoreThreshold.max}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
