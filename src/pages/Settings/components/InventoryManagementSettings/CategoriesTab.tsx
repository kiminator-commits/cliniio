import React from 'react';
import Icon from '@mdi/react';
import { mdiTune } from '@mdi/js';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { InventorySettings } from './types';

interface CategoriesTabProps {
  settings: InventorySettings;
  onSettingsChange: (settings: InventorySettings) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
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
          <Icon path={mdiTune} size={1} className="text-gray-600" />
          Categories & Organization
        </h5>

        <div className="space-y-4">
          <FormGroup title="Organization Features">
            <ToggleSwitch
              id="enableSubcategories"
              checked={settings.enableSubcategories}
              onChange={(checked) =>
                updateSetting('enableSubcategories', checked)
              }
              label="Enable subcategories"
            />
            <ToggleSwitch
              id="enableCustomTags"
              checked={settings.enableCustomTags}
              onChange={(checked) => updateSetting('enableCustomTags', checked)}
              label="Enable custom tags"
            />
            <ToggleSwitch
              id="requireCategoryAssignment"
              checked={settings.requireCategoryAssignment}
              onChange={(checked) =>
                updateSetting('requireCategoryAssignment', checked)
              }
              label="Require category assignment"
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;
