import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain } from '@mdi/js';
import { UnifiedAISettings } from '../../../services/ai/aiSettingsService';
import { UI_TEXT } from './AIAnalyticsSettings.config';
import FormGroup from './AIAnalyticsSettings/components/FormGroup';
import ToggleSwitch from './AIAnalyticsSettings/components/ToggleSwitch';

interface PerformancePanelProps {
  settings: UnifiedAISettings;
  updateIntelligence: (
    key: keyof UnifiedAISettings['intelligence'],
    value: boolean
  ) => void;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({
  settings,
  updateIntelligence,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon path={mdiBrain} size={1} className="text-[#4ECDC4]" />
        <h5 className="text-lg font-medium text-gray-800">
          {UI_TEXT.SECTIONS.INTELLIGENCE_SETTINGS}
        </h5>
      </div>

      <div className="space-y-6">
        <FormGroup title={UI_TEXT.FORM_GROUPS.RISK_ALERTS}>
          <ToggleSwitch
            id="riskAssessment"
            checked={settings.intelligence.riskAssessment}
            onChange={(checked) =>
              updateIntelligence('riskAssessment', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.RISK_ASSESSMENT}
            description={UI_TEXT.DESCRIPTIONS.RISK_ASSESSMENT}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="alertSystem"
            checked={settings.intelligence.alertSystem}
            onChange={(checked) => updateIntelligence('alertSystem', checked)}
            label={UI_TEXT.TOGGLE_LABELS.ALERT_SYSTEM}
            description={UI_TEXT.DESCRIPTIONS.ALERT_SYSTEM}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="escalationRules"
            checked={settings.intelligence.escalationRules}
            onChange={(checked) =>
              updateIntelligence('escalationRules', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.ESCALATION_RULES}
            description={UI_TEXT.DESCRIPTIONS.ESCALATION_RULES}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>

        <FormGroup title={UI_TEXT.FORM_GROUPS.AI_INSIGHTS}>
          <ToggleSwitch
            id="aiRecommendations"
            checked={settings.intelligence.aiRecommendations}
            onChange={(checked) =>
              updateIntelligence('aiRecommendations', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.AI_RECOMMENDATIONS}
            description={UI_TEXT.DESCRIPTIONS.AI_RECOMMENDATIONS}
            disabled={!settings.aiEnabled}
          />
          <ToggleSwitch
            id="optimizationTips"
            checked={settings.intelligence.optimizationTips}
            onChange={(checked) =>
              updateIntelligence('optimizationTips', checked)
            }
            label={UI_TEXT.TOGGLE_LABELS.OPTIMIZATION_TIPS}
            description={UI_TEXT.DESCRIPTIONS.OPTIMIZATION_TIPS}
            disabled={!settings.aiEnabled}
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default PerformancePanel;
