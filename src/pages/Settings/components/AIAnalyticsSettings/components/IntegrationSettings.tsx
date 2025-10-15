import React from 'react';
import Icon from '@mdi/react';
import { mdiLink } from '@mdi/js';
import { UnifiedAISettings } from '../../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from '../../shared/FormGroup';
import ToggleSwitch from '../../shared/ToggleSwitch';

interface IntegrationSettingsProps {
  settings: UnifiedAISettings;
  updateIntegration: (
    key: keyof UnifiedAISettings['integration'],
    value: boolean
  ) => void;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  settings,
  updateIntegration,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiLink} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.INTEGRATION_SETTINGS}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.EXTERNAL_SERVICES}>
          <ToggleSwitch
            id="externalServices"
            checked={settings.integration.externalServices}
            onChange={(checked) =>
              updateIntegration('externalServices', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.EXTERNAL_SERVICES}
            description={UI_TEXT.DESCRIPTIONS.EXTERNAL_SERVICES}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="apiRateLimiting"
            checked={settings.integration.apiRateLimiting}
            onChange={(checked) =>
              updateIntegration('apiRateLimiting', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.API_RATE_LIMITING}
            description={UI_TEXT.DESCRIPTIONS.API_RATE_LIMITING}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="webhookEndpoints"
            checked={settings.integration.webhookEndpoints}
            onChange={(checked) =>
              updateIntegration('webhookEndpoints', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.WEBHOOK_ENDPOINTS}
            description={UI_TEXT.DESCRIPTIONS.WEBHOOK_ENDPOINTS}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <FormGroup title={UI_TEXT.FORM_GROUPS.SYSTEM_HEALTH}>
          <ToggleSwitch
            id="healthMonitoring"
            checked={settings.integration.healthMonitoring}
            onChange={(checked) =>
              updateIntegration('healthMonitoring', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.HEALTH_MONITORING}
            description={UI_TEXT.DESCRIPTIONS.HEALTH_MONITORING}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="syncScheduling"
            checked={settings.integration.syncScheduling}
            onChange={(checked) => updateIntegration('syncScheduling', checked)}
            label={UI_TEXT.TOGGLE_LABELS.SYNC_SCHEDULING}
            description={UI_TEXT.DESCRIPTIONS.SYNC_SCHEDULING}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default IntegrationSettings;
