import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar } from '@mdi/js';
import { SterilizationAISettings as SterilizationAISettingsType } from '../../../../../services/ai/sterilization/types';

interface CycleConfigurationProps {
  settings: SterilizationAISettingsType;
  onInputChange: (
    field: keyof SterilizationAISettingsType,
    value: string | number | boolean
  ) => void;
}

const CycleConfiguration: React.FC<CycleConfigurationProps> = ({
  settings,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiChartBar} size={1.2} className="text-green-600" />
        Cycle Configuration & Optimization
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label htmlFor="cycleOptimization" className="flex items-center gap-3">
          <input
            id="cycleOptimization"
            type="checkbox"
            checked={settings.cycle_optimization}
            onChange={(e) =>
              onInputChange('cycle_optimization', e.target.checked)
            }
            disabled={
              !settings.ai_enabled || !settings.predictive_analytics_enabled
            }
            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Cycle Optimization
            </span>
            <p className="text-xs text-gray-500">
              AI-powered sterilization cycle improvements
            </p>
          </div>
          <span className="sr-only">
            Cycle Optimization - AI-powered sterilization cycle improvements
          </span>
        </label>

        <label
          htmlFor="efficiencyOptimization"
          className="flex items-center gap-3"
        >
          <input
            id="efficiencyOptimization"
            type="checkbox"
            checked={settings.efficiency_optimization}
            onChange={(e) =>
              onInputChange('efficiency_optimization', e.target.checked)
            }
            disabled={
              !settings.ai_enabled || !settings.predictive_analytics_enabled
            }
            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Efficiency Optimization
            </span>
            <p className="text-xs text-gray-500">
              Optimize sterilization processes for maximum efficiency
            </p>
          </div>
          <span className="sr-only">
            Efficiency Optimization - Optimize sterilization processes for
            maximum efficiency
          </span>
        </label>

        <label htmlFor="batchOptimization" className="flex items-center gap-3">
          <input
            id="batchOptimization"
            type="checkbox"
            checked={settings.batch_optimization}
            onChange={(e) =>
              onInputChange('batch_optimization', e.target.checked)
            }
            disabled={!settings.ai_enabled || !settings.smart_workflow_enabled}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Batch Optimization
            </span>
            <p className="text-xs text-gray-500">
              Optimize tool grouping for sterilization batches
            </p>
          </div>
          <span className="sr-only">
            Batch Optimization - Optimize tool grouping for sterilization
            batches
          </span>
        </label>

        <label
          htmlFor="autoOptimizationEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="autoOptimizationEnabled"
            type="checkbox"
            checked={settings.auto_optimization_enabled}
            onChange={(e) =>
              onInputChange('auto_optimization_enabled', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Auto Optimization
            </span>
            <p className="text-xs text-gray-500">
              Automatically optimize cycles based on historical data
            </p>
          </div>
          <span className="sr-only">
            Auto Optimization - Automatically optimize cycles based on
            historical data
          </span>
        </label>
      </div>
    </div>
  );
};

export default CycleConfiguration;
