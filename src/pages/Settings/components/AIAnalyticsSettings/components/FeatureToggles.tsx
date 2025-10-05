import React from 'react';
import Icon from '@mdi/react';
import { mdiLightbulbOn } from '@mdi/js';
import { UnifiedAISettings } from '../../../../services/ai/aiSettingsService';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';

interface FeatureTogglesProps {
  settings: UnifiedAISettings;
  updateMasterAI: (value: boolean) => void;
  updateComputerVision: (
    key: keyof UnifiedAISettings['computerVision'],
    value: boolean
  ) => void;
  updatePredictiveAnalytics: (
    key: keyof UnifiedAISettings['predictiveAnalytics'],
    value: boolean
  ) => void;
  updateSmartWorkflow: (
    key: keyof UnifiedAISettings['smartWorkflow'],
    value: boolean
  ) => void;
}

const FeatureToggles: React.FC<FeatureTogglesProps> = ({
  settings,
  updateMasterAI,
  updateComputerVision,
  updatePredictiveAnalytics,
  updateSmartWorkflow,
}) => {
  return (
    <>
      {/* Master AI Toggle */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {UI_TEXT.SECTIONS.ENABLE_AI_FEATURES}
            </h4>
            <p className="text-sm text-gray-500">
              {UI_TEXT.DESCRIPTIONS.MASTER_AI_TOGGLE}
            </p>
          </div>
          <ToggleSwitch
            id="aiEnabled"
            checked={settings.aiEnabled}
            onChange={updateMasterAI}
            label=""
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Feature Flags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon path={mdiLightbulbOn} size={1} className="text-[#4ECDC4]" />
            <h5 className="text-lg font-medium text-gray-800">
              {UI_TEXT.SECTIONS.AI_FEATURES}
            </h5>
          </div>

          <div className="space-y-6">
            <FormGroup title={UI_TEXT.FORM_GROUPS.COMPUTER_VISION}>
              <ToggleSwitch
                id="toolConditionAssessment"
                checked={settings.computerVision.toolConditionAssessment}
                onChange={(checked) =>
                  updateComputerVision('toolConditionAssessment', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.TOOL_CONDITION_ASSESSMENT}
                description={UI_TEXT.DESCRIPTIONS.TOOL_CONDITION_ASSESSMENT}
                disabled={!settings.aiEnabled}
              />
              <ToggleSwitch
                id="barcodeQualityDetection"
                checked={settings.computerVision.barcodeQualityDetection}
                onChange={(checked) =>
                  updateComputerVision('barcodeQualityDetection', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.BARCODE_QUALITY_DETECTION}
                description={UI_TEXT.DESCRIPTIONS.BARCODE_QUALITY_DETECTION}
                disabled={!settings.aiEnabled}
              />
              <ToggleSwitch
                id="damageDetection"
                checked={settings.computerVision.damageDetection}
                onChange={(checked) =>
                  updateComputerVision('damageDetection', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.DAMAGE_DETECTION}
                description={UI_TEXT.DESCRIPTIONS.DAMAGE_DETECTION}
                disabled={!settings.aiEnabled}
              />
            </FormGroup>

            <FormGroup title={UI_TEXT.FORM_GROUPS.PREDICTIVE_ANALYTICS}>
              <ToggleSwitch
                id="cycleOptimization"
                checked={settings.predictiveAnalytics.cycleOptimization}
                onChange={(checked) =>
                  updatePredictiveAnalytics('cycleOptimization', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.CYCLE_OPTIMIZATION}
                description={UI_TEXT.DESCRIPTIONS.CYCLE_OPTIMIZATION}
                disabled={!settings.aiEnabled}
              />
              <ToggleSwitch
                id="failurePrediction"
                checked={settings.predictiveAnalytics.failurePrediction}
                onChange={(checked) =>
                  updatePredictiveAnalytics('failurePrediction', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.FAILURE_PREDICTION}
                description={UI_TEXT.DESCRIPTIONS.FAILURE_PREDICTION}
                disabled={!settings.aiEnabled}
              />
              <ToggleSwitch
                id="efficiencyOptimization"
                checked={settings.predictiveAnalytics.efficiencyOptimization}
                onChange={(checked) =>
                  updatePredictiveAnalytics('efficiencyOptimization', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.EFFICIENCY_OPTIMIZATION}
                description={UI_TEXT.DESCRIPTIONS.EFFICIENCY_OPTIMIZATION}
                disabled={!settings.aiEnabled}
              />
            </FormGroup>

            <FormGroup title={UI_TEXT.FORM_GROUPS.SMART_WORKFLOW}>
              <ToggleSwitch
                id="intelligentWorkflowSelection"
                checked={settings.smartWorkflow.intelligentWorkflowSelection}
                onChange={(checked) =>
                  updateSmartWorkflow('intelligentWorkflowSelection', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.INTELLIGENT_WORKFLOW_SELECTION}
                description={
                  UI_TEXT.DESCRIPTIONS.INTELLIGENT_WORKFLOW_SELECTION
                }
                disabled={!settings.aiEnabled}
              />
              <ToggleSwitch
                id="automatedProblemDetection"
                checked={settings.smartWorkflow.automatedProblemDetection}
                onChange={(checked) =>
                  updateSmartWorkflow('automatedProblemDetection', checked)
                }
                label={UI_TEXT.TOGGLE_LABELS.AUTOMATED_PROBLEM_DETECTION}
                description={UI_TEXT.DESCRIPTIONS.AUTOMATED_PROBLEM_DETECTION}
                disabled={!settings.aiEnabled}
              />
            </FormGroup>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeatureToggles;
