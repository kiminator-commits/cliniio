import React from 'react';
import { UnifiedAISettings } from '../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from './FormGroup';
import ToggleSwitch from './ToggleSwitch';

interface InterfaceHelpProps {
  settings: UnifiedAISettings;
  updateUserExperience: (
    key: keyof UnifiedAISettings['userExperience'],
    value: boolean
  ) => void;
}

const InterfaceHelp: React.FC<InterfaceHelpProps> = ({
  settings,
  updateUserExperience,
}) => {
  return (
    <FormGroup title={UI_TEXT.FORM_GROUPS.INTERFACE_HELP}>
      <ToggleSwitch
        id="accessibility"
        checked={settings.userExperience.accessibility}
        onChange={(checked) =>
          updateUserExperience('accessibility', checked)
        }
        label={UI_TEXT.TOGGLE_LABELS.ACCESSIBILITY_FEATURES}
        description={UI_TEXT.DESCRIPTIONS.ACCESSIBILITY_FEATURES}
        disabled={!settings.aiEnabled}
      />
      <ToggleSwitch
        id="helpSystem"
        checked={settings.userExperience.helpSystem}
        onChange={(checked) =>
          updateUserExperience('helpSystem', checked)
        }
        label={UI_TEXT.TOGGLE_LABELS.SMART_HELP_SYSTEM}
        description={UI_TEXT.DESCRIPTIONS.SMART_HELP_SYSTEM}
        disabled={!settings.aiEnabled}
      />
    </FormGroup>
  );
};

export default InterfaceHelp;
