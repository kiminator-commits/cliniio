import React from 'react';
import { UnifiedAISettings } from '../../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from './FormGroup';
import ToggleSwitch from './ToggleSwitch';

interface ReportingExportProps {
  settings: UnifiedAISettings;
  updateAnalytics: (
    key: keyof UnifiedAISettings['analytics'],
    value: boolean
  ) => void;
}

const ReportingExport: React.FC<ReportingExportProps> = ({
  settings,
  updateAnalytics,
}) => {
  return (
    <FormGroup title={UI_TEXT.FORM_GROUPS.REPORTING_EXPORT}>
      <ToggleSwitch
        id="exportCapabilities"
        checked={settings.analytics.exportCapabilities}
        onChange={(checked) => updateAnalytics('exportCapabilities', checked)}
        label={UI_TEXT.TOGGLE_LABELS.EXPORT_CAPABILITIES}
        description={UI_TEXT.DESCRIPTIONS.EXPORT_CAPABILITIES}
        disabled={!settings.aiEnabled}
      />
      <ToggleSwitch
        id="dashboardCustomization"
        checked={settings.analytics.dashboardCustomization}
        onChange={(checked) =>
          updateAnalytics('dashboardCustomization', checked)
        }
        label={UI_TEXT.TOGGLE_LABELS.DASHBOARD_CUSTOMIZATION}
        description={UI_TEXT.DESCRIPTIONS.DASHBOARD_CUSTOMIZATION}
        disabled={!settings.aiEnabled}
      />
    </FormGroup>
  );
};

export default ReportingExport;
