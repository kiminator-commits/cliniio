import React from 'react';
import Icon from '@mdi/react';
import { mdiPackageVariant } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { InventorySettings } from './types';

interface StockTabProps {
  settings: InventorySettings;
  onSettingsChange: (settings: InventorySettings) => void;
}

const StockTab: React.FC<StockTabProps> = ({ settings, onSettingsChange }) => {
  const updateSetting = <K extends keyof InventorySettings>(
    key: K,
    value: InventorySettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Icon path={mdiPackageVariant} size={1} className="text-gray-600" />
          Stock Management
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Stock Thresholds">
            <div>
              <label
                htmlFor="lowStockThreshold"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Low stock threshold
              </label>
              <input
                id="lowStockThreshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  updateSetting('lowStockThreshold', parseInt(e.target.value))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="criticalStockThreshold"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Critical stock threshold
              </label>
              <input
                id="criticalStockThreshold"
                type="number"
                value={settings.criticalStockThreshold}
                onChange={(e) =>
                  updateSetting(
                    'criticalStockThreshold',
                    parseInt(e.target.value)
                  )
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
              />
            </div>
          </FormGroup>

          <FormGroup title="Reorder Settings">
            <ToggleSwitch
              id="autoReorderEnabled"
              checked={settings.autoReorderEnabled}
              onChange={(checked) =>
                updateSetting('autoReorderEnabled', checked)
              }
              label="Enable automatic reordering"
            />
            <div>
              <label
                htmlFor="reorderBufferDays"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reorder buffer (days)
              </label>
              <input
                id="reorderBufferDays"
                type="number"
                value={settings.reorderBufferDays}
                onChange={(e) =>
                  updateSetting('reorderBufferDays', parseInt(e.target.value))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="30"
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default StockTab;
