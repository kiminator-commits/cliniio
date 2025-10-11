import React, { useState } from 'react';
import { useSterilizationStore } from '../../../../store/sterilizationStore';
import { useFacility } from '../../../../contexts/FacilityContext';
import { CYCLE_OPTIONS, CUSTOM_CYCLE_LIMITS } from './settings';
import { trackCycleSettingsChange } from './settings';
import { CycleSettings } from './settings/types';

export const CycleManagement: React.FC = () => {
  const {
    cycleSettings,
    defaultCycleType,
    allowCustomCycles,
    setDefaultCycleType,
    setAllowCustomCycles,
    updateCycleSettings,
    resetCycleSettings,
  } = useSterilizationStore();

  const [editingCycle, setEditingCycle] = useState<
    keyof typeof cycleSettings | null
  >(null);

  const { getCurrentFacilityId } = useFacility();

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">
        Autoclave Cycle Customization
      </h3>

      <div className="space-y-4">
        {/* Default Cycle Type */}
        <div>
          <label
            htmlFor="defaultCycle"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Default Cycle Type
          </label>
          <select
            id="defaultCycle"
            value={defaultCycleType}
            onChange={(e) => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackCycleSettingsChange(
                  'defaultCycleType',
                  { cycleType: e.target.value },
                  facilityId
                );
              }
              setDefaultCycleType(e.target.value as keyof typeof cycleSettings);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
          >
            {CYCLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            This cycle type will be selected by default for new sterilization
            runs
          </p>
        </div>

        {/* Allow Custom Cycles */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="allowCustomCycles" className="text-sm font-medium">
              Allow Custom Cycle Parameters
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Enable users to modify temperature, pressure, and timing for
              special cases
            </p>
          </div>
          <button
            id="allowCustomCycles"
            onClick={() => {
              const facilityId = getCurrentFacilityId();
              if (facilityId) {
                trackCycleSettingsChange(
                  'allowCustomCycles',
                  { enabled: !allowCustomCycles },
                  facilityId
                );
              }
              setAllowCustomCycles(!allowCustomCycles);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 ${
              allowCustomCycles ? 'bg-[#4ECDC4]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                allowCustomCycles ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Cycle Presets */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Cycle Presets
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(cycleSettings).map(([key, cycle]) => {
              const cycleData = cycle as CycleSettings;
              return (
                <div
                  key={key}
                  className="border border-gray-200 rounded-md p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">{cycleData.name}</h5>
                    {key === 'custom' && allowCustomCycles && (
                      <button
                        onClick={() =>
                          setEditingCycle(editingCycle === key ? null : key)
                        }
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {editingCycle === key ? 'Save' : 'Edit'}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Temperature: {cycleData.temperature}°C</p>
                    <p>Pressure: {cycleData.pressure} PSI</p>
                    <p>Sterilize Time: {cycleData.sterilizeTime} min</p>
                    <p>Dry Time: {cycleData.dryTime} min</p>
                    <p>Total Time: {cycleData.totalTime} min</p>
                  </div>

                  {/* Custom Cycle Editor */}
                  {key === 'custom' &&
                    allowCustomCycles &&
                    editingCycle === key && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label
                              htmlFor="customTemperature"
                              className="text-xs text-gray-500"
                            >
                              Temperature (°C)
                            </label>
                            <input
                              id="customTemperature"
                              type="number"
                              value={cycleData.temperature}
                              onChange={(e) => {
                                const facilityId = getCurrentFacilityId();
                                if (facilityId) {
                                  trackCycleSettingsChange(
                                    'custom',
                                    { temperature: Number(e.target.value) },
                                    facilityId
                                  );
                                }
                                updateCycleSettings('custom', {
                                  temperature: Number(e.target.value),
                                });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              min={CUSTOM_CYCLE_LIMITS.TEMPERATURE.min}
                              max={CUSTOM_CYCLE_LIMITS.TEMPERATURE.max}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="customPressure"
                              className="text-xs text-gray-500"
                            >
                              Pressure (PSI)
                            </label>
                            <input
                              id="customPressure"
                              type="number"
                              value={cycleData.pressure}
                              onChange={(e) => {
                                const facilityId = getCurrentFacilityId();
                                if (facilityId) {
                                  trackCycleSettingsChange(
                                    'custom',
                                    { pressure: Number(e.target.value) },
                                    facilityId
                                  );
                                }
                                updateCycleSettings('custom', {
                                  pressure: Number(e.target.value),
                                });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              min={CUSTOM_CYCLE_LIMITS.PRESSURE.min}
                              max={CUSTOM_CYCLE_LIMITS.PRESSURE.max}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label
                              htmlFor="customSterilizeTime"
                              className="text-xs text-gray-500"
                            >
                              Sterilize (min)
                            </label>
                            <input
                              id="customSterilizeTime"
                              type="number"
                              value={cycleData.sterilizeTime}
                              onChange={(e) => {
                                const facilityId = getCurrentFacilityId();
                                if (facilityId) {
                                  trackCycleSettingsChange(
                                    'custom',
                                    { sterilizeTime: Number(e.target.value) },
                                    facilityId
                                  );
                                }
                                updateCycleSettings('custom', {
                                  sterilizeTime: Number(e.target.value),
                                });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              min={CUSTOM_CYCLE_LIMITS.STERILIZE_TIME.min}
                              max={CUSTOM_CYCLE_LIMITS.STERILIZE_TIME.max}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="customDryTime"
                              className="text-xs text-gray-500"
                            >
                              Dry (min)
                            </label>
                            <input
                              id="customDryTime"
                              type="number"
                              value={cycleData.dryTime}
                              onChange={(e) => {
                                const facilityId = getCurrentFacilityId();
                                if (facilityId) {
                                  trackCycleSettingsChange(
                                    'custom',
                                    { dryTime: Number(e.target.value) },
                                    facilityId
                                  );
                                }
                                updateCycleSettings('custom', {
                                  dryTime: Number(e.target.value),
                                });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              min={CUSTOM_CYCLE_LIMITS.DRY_TIME.min}
                              max={CUSTOM_CYCLE_LIMITS.DRY_TIME.max}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <button
            onClick={resetCycleSettings}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycleManagement;
