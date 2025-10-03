import React from 'react';
import Icon from '@mdi/react';
import { mdiLock } from '@mdi/js';
import { UnifiedAISettings } from '../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';

interface SecurityPrivacyProps {
  settings: UnifiedAISettings;
  updatePrivacy: (key: keyof UnifiedAISettings['privacy'], value: boolean) => void;
}

const SecurityPrivacy: React.FC<SecurityPrivacyProps> = ({
  settings,
  updatePrivacy,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiLock} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.DATA_PRIVACY_SECURITY}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.PRIVACY_CONTROLS}>
          <ToggleSwitch
            id="dataAnonymization"
            checked={settings.privacy.dataAnonymization}
            onChange={(checked) =>
              updatePrivacy('dataAnonymization', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.DATA_ANONYMIZATION}
            description={UI_TEXT.DESCRIPTIONS.DATA_ANONYMIZATION}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="thirdPartyPermissions"
            checked={settings.privacy.thirdPartyPermissions}
            onChange={(checked) =>
              updatePrivacy('thirdPartyPermissions', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.THIRD_PARTY_PERMISSIONS}
            description={UI_TEXT.DESCRIPTIONS.THIRD_PARTY_PERMISSIONS}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="complianceMonitoring"
            checked={settings.privacy.complianceMonitoring}
            onChange={(checked) =>
              updatePrivacy('complianceMonitoring', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.COMPLIANCE_MONITORING}
            description={UI_TEXT.DESCRIPTIONS.COMPLIANCE_MONITORING}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <FormGroup title={UI_TEXT.FORM_GROUPS.SECURITY_FEATURES}>
          <ToggleSwitch
            id="encryption"
            checked={settings.privacy.encryption}
            onChange={(checked) => updatePrivacy('encryption', checked)}
            label={UI_TEXT.TOGGLE_LABELS.ENCRYPTION}
            description={UI_TEXT.DESCRIPTIONS.ENCRYPTION}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="accessControl"
            checked={settings.privacy.accessControl}
            onChange={(checked) => updatePrivacy('accessControl', checked)}
            label={UI_TEXT.TOGGLE_LABELS.ACCESS_CONTROL}
            description={UI_TEXT.DESCRIPTIONS.ACCESS_CONTROL}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default SecurityPrivacy;
