import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import FormGroup from './FormGroup';
import { InventoryAISettings } from '../../../../services/ai/inventoryAIService';

interface AITabProps {
  aiSettings: InventoryAISettings | null;
  onAISettingChange: (
    key: keyof InventoryAISettings,
    value: string | number | boolean
  ) => void;
  onAISettingsSave: () => void;
  onAISettingsReset: () => void;
  isLoading: boolean;
  aiMessage: string;
}

const AITab: React.FC<AITabProps> = ({
  aiSettings,
  onAISettingChange,
  onAISettingsSave,
  onAISettingsReset,
  isLoading,
  aiMessage,
}) => {
  if (!aiSettings) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <span className="text-gray-600">Loading AI settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          AI-Powered Features
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={onAISettingsReset}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onAISettingsSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      </div>

      {aiMessage && (
        <div
          className={`p-3 rounded-md ${
            aiMessage.includes('Error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {aiMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Master AI Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Enable AI Features
              </h4>
              <p className="text-sm text-gray-500">
                Master toggle for all AI-powered inventory features
              </p>
            </div>
            <ToggleSwitch
              id="ai_enabled"
              checked={aiSettings.ai_enabled}
              onChange={(checked) => onAISettingChange('ai_enabled', checked)}
              label=""
            />
          </div>
        </div>

        {/* Computer Vision Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormGroup title="Computer Vision">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleSwitch
                id="barcode_scanning_enabled"
                checked={aiSettings.barcode_scanning_enabled}
                onChange={(checked) =>
                  onAISettingChange('barcode_scanning_enabled', checked)
                }
                label="Barcode Scanning AI"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="image_recognition_enabled"
                checked={aiSettings.image_recognition_enabled}
                onChange={(checked) =>
                  onAISettingChange('image_recognition_enabled', checked)
                }
                label="Image Recognition"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="quality_assessment_enabled"
                checked={aiSettings.quality_assessment_enabled}
                onChange={(checked) =>
                  onAISettingChange('quality_assessment_enabled', checked)
                }
                label="Quality Assessment"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="damage_detection_enabled"
                checked={aiSettings.damage_detection_enabled}
                onChange={(checked) =>
                  onAISettingChange('damage_detection_enabled', checked)
                }
                label="Damage Detection"
                disabled={!aiSettings.ai_enabled}
              />
            </div>
          </FormGroup>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormGroup title="Predictive Analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleSwitch
                id="demand_forecasting_enabled"
                checked={aiSettings.demand_forecasting_enabled}
                onChange={(checked) =>
                  onAISettingChange('demand_forecasting_enabled', checked)
                }
                label="Demand Forecasting"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="cost_optimization_enabled"
                checked={aiSettings.cost_optimization_enabled}
                onChange={(checked) =>
                  onAISettingChange('cost_optimization_enabled', checked)
                }
                label="Cost Optimization"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="seasonal_analysis_enabled"
                checked={aiSettings.seasonal_analysis_enabled}
                onChange={(checked) =>
                  onAISettingChange('seasonal_analysis_enabled', checked)
                }
                label="Seasonal Analysis"
                disabled={!aiSettings.ai_enabled}
              />
            </div>
          </FormGroup>
        </div>

        {/* Smart Categorization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormGroup title="Smart Categorization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleSwitch
                id="smart_categorization_enabled"
                checked={aiSettings.smart_categorization_enabled}
                onChange={(checked) =>
                  onAISettingChange('smart_categorization_enabled', checked)
                }
                label="Smart Categorization"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="auto_classification_enabled"
                checked={aiSettings.auto_classification_enabled}
                onChange={(checked) =>
                  onAISettingChange('auto_classification_enabled', checked)
                }
                label="Auto Classification"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="smart_form_filling_enabled"
                checked={aiSettings.smart_form_filling_enabled}
                onChange={(checked) =>
                  onAISettingChange('smart_form_filling_enabled', checked)
                }
                label="Smart Form Filling"
                disabled={!aiSettings.ai_enabled}
              />
            </div>
          </FormGroup>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormGroup title="AI Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ai_confidence_threshold"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confidence Threshold
                </label>
                <input
                  id="ai_confidence_threshold"
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={aiSettings.ai_confidence_threshold}
                  onChange={(e) =>
                    onAISettingChange(
                      'ai_confidence_threshold',
                      parseFloat(e.target.value)
                    )
                  }
                  disabled={!aiSettings.ai_enabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <span className="text-sm text-gray-500">
                  {(aiSettings.ai_confidence_threshold * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <label
                  htmlFor="ai_data_retention_days"
                  className="block text-sm font-medium text-gray-700"
                >
                  Data Retention (days)
                </label>
                <input
                  id="ai_data_retention_days"
                  type="number"
                  min="30"
                  max="365"
                  value={aiSettings.ai_data_retention_days}
                  onChange={(e) =>
                    onAISettingChange(
                      'ai_data_retention_days',
                      parseInt(e.target.value)
                    )
                  }
                  disabled={!aiSettings.ai_enabled}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                />
              </div>
            </div>
          </FormGroup>
        </div>

        {/* Privacy and Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormGroup title="Privacy & Performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleSwitch
                id="encrypted_data_transmission"
                checked={aiSettings.encrypted_data_transmission}
                onChange={(checked) =>
                  onAISettingChange('encrypted_data_transmission', checked)
                }
                label="Encrypted Data Transmission"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="local_ai_processing_enabled"
                checked={aiSettings.local_ai_processing_enabled}
                onChange={(checked) =>
                  onAISettingChange('local_ai_processing_enabled', checked)
                }
                label="Local AI Processing"
                disabled={!aiSettings.ai_enabled}
              />
              <ToggleSwitch
                id="performance_monitoring"
                checked={aiSettings.performance_monitoring}
                onChange={(checked) =>
                  onAISettingChange('performance_monitoring', checked)
                }
                label="Performance Monitoring"
                disabled={!aiSettings.ai_enabled}
              />
            </div>
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

export default AITab;
