import React from 'react';
import Icon from '@mdi/react';
import { mdiTarget } from '@mdi/js';
import { CleaningProtocolSettings, FORM_LIMITS } from './constants';

interface ProtocolsTabProps {
  protocolSettings: CleaningProtocolSettings;
  onProtocolSettingChange: (
    field: keyof CleaningProtocolSettings,
    value: boolean | number | string | string[]
  ) => void;
}

const ProtocolsTab: React.FC<ProtocolsTabProps> = ({
  protocolSettings,
  onProtocolSettingChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiTarget} size={1.5} className="text-green-600" />
          <div>
            <h4 className="text-lg font-semibold text-green-800">
              Cleaning Protocols
            </h4>
            <p className="text-sm text-green-700">
              Configure cleaning procedures and standards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="bufferTimeMinutes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Buffer Time (minutes)
            </label>
            <input
              id="bufferTimeMinutes"
              type="number"
              value={protocolSettings.bufferTimeMinutes}
              onChange={(e) =>
                onProtocolSettingChange(
                  'bufferTimeMinutes',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min={FORM_LIMITS.bufferTimeMinutes.min}
              max={FORM_LIMITS.bufferTimeMinutes.max}
            />
          </div>

          <div>
            <label
              htmlFor="maxConcurrentCleanings"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Max Concurrent Cleanings
            </label>
            <input
              id="maxConcurrentCleanings"
              type="number"
              value={protocolSettings.maxConcurrentCleanings}
              onChange={(e) =>
                onProtocolSettingChange(
                  'maxConcurrentCleanings',
                  Number(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min={FORM_LIMITS.maxConcurrentCleanings.min}
              max={FORM_LIMITS.maxConcurrentCleanings.max}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="autoSchedulingEnabled"
                className="text-sm font-medium text-gray-700"
              >
                Auto Scheduling
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Enable automatic cleaning schedule generation
              </p>
            </div>
            <button
              id="autoSchedulingEnabled"
              onClick={() =>
                onProtocolSettingChange(
                  'autoSchedulingEnabled',
                  !protocolSettings.autoSchedulingEnabled
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                protocolSettings.autoSchedulingEnabled
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
              aria-label="Auto Scheduling"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  protocolSettings.autoSchedulingEnabled
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="weekendCleaningEnabled"
                className="text-sm font-medium text-gray-700"
              >
                Weekend Cleaning
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Allow cleaning tasks on weekends
              </p>
            </div>
            <button
              id="weekendCleaningEnabled"
              onClick={() =>
                onProtocolSettingChange(
                  'weekendCleaningEnabled',
                  !protocolSettings.weekendCleaningEnabled
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                protocolSettings.weekendCleaningEnabled
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
              aria-label="Weekend Cleaning"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  protocolSettings.weekendCleaningEnabled
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolsTab;
