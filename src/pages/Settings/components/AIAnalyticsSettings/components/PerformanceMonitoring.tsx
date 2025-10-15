import React from 'react';
import Icon from '@mdi/react';
import { mdiSpeedometer } from '@mdi/js';
import { UnifiedAISettings } from '../../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from '../../shared/FormGroup';
import ToggleSwitch from '../../shared/ToggleSwitch';

interface PerformanceMonitoringProps {
  settings: UnifiedAISettings;
  updatePerformance: (
    key: keyof UnifiedAISettings['performance'],
    value: boolean
  ) => void;
}

const PerformanceMonitoring: React.FC<PerformanceMonitoringProps> = ({
  settings,
  updatePerformance,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiSpeedometer} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.PERFORMANCE_MONITORING}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.QUALITY_METRICS}>
          <ToggleSwitch
            id="accuracyTracking"
            checked={settings.performance.accuracyTracking}
            onChange={(checked) =>
              updatePerformance('accuracyTracking', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.ACCURACY_TRACKING}
            description={UI_TEXT.DESCRIPTIONS.ACCURACY_TRACKING}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="responseTimeMonitoring"
            checked={settings.performance.responseTimeMonitoring}
            onChange={(checked) =>
              updatePerformance('responseTimeMonitoring', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.RESPONSE_TIME_MONITORING}
            description={UI_TEXT.DESCRIPTIONS.RESPONSE_TIME_MONITORING}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="errorRateTracking"
            checked={settings.performance.errorRateTracking}
            onChange={(checked) =>
              updatePerformance('errorRateTracking', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.ERROR_RATE_TRACKING}
            description={UI_TEXT.DESCRIPTIONS.ERROR_RATE_TRACKING}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <FormGroup title={UI_TEXT.FORM_GROUPS.OPTIMIZATION}>
          <ToggleSwitch
            id="performanceAlerts"
            checked={settings.performance.performanceAlerts}
            onChange={(checked) =>
              updatePerformance('performanceAlerts', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.PERFORMANCE_ALERTS}
            description={UI_TEXT.DESCRIPTIONS.PERFORMANCE_ALERTS}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="modelHealthMonitoring"
            checked={settings.performance.modelHealthMonitoring}
            onChange={(checked) =>
              updatePerformance('modelHealthMonitoring', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.MODEL_HEALTH_MONITORING}
            description={UI_TEXT.DESCRIPTIONS.MODEL_HEALTH_MONITORING}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;
