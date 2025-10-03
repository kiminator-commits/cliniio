import React from 'react';
import Icon from '@mdi/react';
import { mdiAccountCog } from '@mdi/js';
import { UnifiedAISettings } from '../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from './FormGroup';
import ToggleSwitch from './ToggleSwitch';
import InterfaceHelp from './InterfaceHelp';

interface UserExperienceProps {
  settings: UnifiedAISettings;
  updateUserExperience: (
    key: keyof UnifiedAISettings['userExperience'],
    value: boolean
  ) => void;
}

const UserExperience: React.FC<UserExperienceProps> = ({
  settings,
  updateUserExperience,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiAccountCog} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.USER_EXPERIENCE}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.AI_ASSISTANCE}>
          <ToggleSwitch
            id="aiSuggestions"
            checked={settings.userExperience.aiSuggestions}
            onChange={(checked) =>
              updateUserExperience('aiSuggestions', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.AI_SUGGESTIONS}
            description={UI_TEXT.DESCRIPTIONS.AI_SUGGESTIONS}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="learningPaths"
            checked={settings.userExperience.learningPaths}
            onChange={(checked) =>
              updateUserExperience('learningPaths', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.LEARNING_PATHS}
            description={UI_TEXT.DESCRIPTIONS.LEARNING_PATHS}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="personalization"
            checked={settings.userExperience.personalization}
            onChange={(checked) =>
              updateUserExperience('personalization', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.PERSONALIZATION}
            description={UI_TEXT.DESCRIPTIONS.PERSONALIZATION}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <InterfaceHelp
          settings={settings}
          updateUserExperience={updateUserExperience}
        />
      </div>
    </div>
  );
};

export default UserExperience;
