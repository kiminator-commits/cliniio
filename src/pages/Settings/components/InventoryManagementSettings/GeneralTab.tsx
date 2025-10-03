import React from 'react';
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { InventorySettings } from './types';

interface GeneralTabProps {
  settings: InventorySettings;
  onSettingsChange: (settings: InventorySettings) => void;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onSettingsChange,
}) => {
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
          <Icon path={mdiCog} size={1} className="text-gray-600" />
          General Settings
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Core Features">
            <ToggleSwitch
              id="autoCalculateTotals"
              checked={settings.autoCalculateTotals}
              onChange={(checked) =>
                updateSetting('autoCalculateTotals', checked)
              }
              label="Auto-calculate totals"
            />
            <ToggleSwitch
              id="requireApprovalForAdjustments"
              checked={settings.requireApprovalForAdjustments}
              onChange={(checked) =>
                updateSetting('requireApprovalForAdjustments', checked)
              }
              label="Require approval for adjustments"
            />
            <ToggleSwitch
              id="allowNegativeQuantities"
              checked={settings.allowNegativeQuantities}
              onChange={(checked) =>
                updateSetting('allowNegativeQuantities', checked)
              }
              label="Allow negative quantities"
            />
          </FormGroup>

          <FormGroup title="System Features">
            <ToggleSwitch
              id="enableRealTimeUpdates"
              checked={settings.enableRealTimeUpdates}
              onChange={(checked) =>
                updateSetting('enableRealTimeUpdates', checked)
              }
              label="Enable real-time updates"
            />
            <ToggleSwitch
              id="enableAuditTrails"
              checked={settings.enableAuditTrails}
              onChange={(checked) =>
                updateSetting('enableAuditTrails', checked)
              }
              label="Enable audit trails"
            />
            <div>
              <label
                htmlFor="defaultTransactionType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Default transaction type
              </label>
              <select
                id="defaultTransactionType"
                value={settings.defaultTransactionType}
                onChange={(e) =>
                  updateSetting('defaultTransactionType', e.target.value)
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="in">In</option>
                <option value="out">Out</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
