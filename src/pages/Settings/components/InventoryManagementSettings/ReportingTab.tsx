import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { InventorySettings } from './types';

interface ReportingTabProps {
  settings: InventorySettings;
  onSettingsChange: (settings: InventorySettings) => void;
}

const ReportingTab: React.FC<ReportingTabProps> = ({
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
          <Icon path={mdiChartBar} size={1} className="text-gray-600" />
          Reporting & Analytics
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup title="Report Generation">
            <ToggleSwitch
              id="autoGenerateReports"
              checked={settings.autoGenerateReports}
              onChange={(checked) =>
                updateSetting('autoGenerateReports', checked)
              }
              label="Auto-generate reports"
            />
            <ToggleSwitch
              id="includeSensitiveData"
              checked={settings.includeSensitiveData}
              onChange={(checked) =>
                updateSetting('includeSensitiveData', checked)
              }
              label="Include sensitive data"
            />
          </FormGroup>

          <FormGroup title="Report Configuration">
            <div>
              <label
                htmlFor="reportRetentionDays"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Report retention (days)
              </label>
              <input
                id="reportRetentionDays"
                type="number"
                value={settings.reportRetentionDays}
                onChange={(e) =>
                  updateSetting('reportRetentionDays', parseInt(e.target.value))
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="30"
                max="1095"
              />
            </div>
            <div>
              <label
                htmlFor="reportFormat"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Report format
              </label>
              <select
                id="reportFormat"
                value={settings.reportFormat}
                onChange={(e) => updateSetting('reportFormat', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default ReportingTab;
