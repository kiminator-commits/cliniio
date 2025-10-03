import React from 'react';
import Icon from '@mdi/react';
import { mdiChartLine } from '@mdi/js';
import { UnifiedAISettings } from '../../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import FormGroup from './FormGroup';
import ToggleSwitch from './ToggleSwitch';
import ReportingExport from './ReportingExport';

interface AnalyticsConfigurationProps {
  settings: UnifiedAISettings;
  updateAnalytics: (
    key: keyof UnifiedAISettings['analytics'],
    value: boolean
  ) => void;
}

const AnalyticsConfiguration: React.FC<AnalyticsConfigurationProps> = ({
  settings,
  updateAnalytics,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiChartLine} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.ANALYTICS_CONFIGURATION}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.DATA_COLLECTION}>
          <ToggleSwitch
            id="dataCollection"
            checked={settings.analytics.dataCollection}
            onChange={(checked) =>
              updateAnalytics('dataCollection', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.DATA_COLLECTION}
            description={UI_TEXT.DESCRIPTIONS.DATA_COLLECTION}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="realTimeUpdates"
            checked={settings.analytics.realTimeUpdates}
            onChange={(checked) =>
              updateAnalytics('realTimeUpdates', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.REAL_TIME_UPDATES}
            description={UI_TEXT.DESCRIPTIONS.REAL_TIME_UPDATES}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="historicalDataRetention"
            checked={settings.analytics.historicalDataRetention}
            onChange={(checked) =>
              updateAnalytics('historicalDataRetention', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.HISTORICAL_DATA_RETENTION}
            description={UI_TEXT.DESCRIPTIONS.HISTORICAL_DATA_RETENTION}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <ReportingExport
          settings={settings}
          updateAnalytics={updateAnalytics}
        />
      </div>
    </div>
  );
};

export default AnalyticsConfiguration;
