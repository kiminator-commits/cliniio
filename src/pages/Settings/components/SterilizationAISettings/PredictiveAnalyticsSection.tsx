import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar } from '@mdi/js';
import { SectionProps } from './types';

export const PredictiveAnalyticsSection: React.FC<SectionProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiChartBar} size={1.2} className="text-green-600" />
        Predictive Analytics & Optimization
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          htmlFor="predictiveAnalyticsEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="predictiveAnalyticsEnabled"
            type="checkbox"
            checked={settings.predictive_analytics_enabled}
            onChange={(e) =>
              onSettingsChange('predictive_analytics_enabled', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Enable Predictive Analytics
            </span>
            <p className="text-xs text-gray-500">
              Master toggle for all predictive features
            </p>
          </div>
          <span className="sr-only">
            Enable Predictive Analytics - Master toggle for all predictive
            features
          </span>
        </label>

        <label htmlFor="failurePrediction" className="flex items-center gap-3">
          <input
            id="failurePrediction"
            type="checkbox"
            checked={settings.failure_prediction}
            onChange={(e) =>
              onSettingsChange('failure_prediction', e.target.checked)
            }
            disabled={
              !settings.ai_enabled || !settings.predictive_analytics_enabled
            }
            className="rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Failure Prediction
            </span>
            <p className="text-xs text-gray-500">
              Predict equipment failures before they happen
            </p>
          </div>
          <span className="sr-only">
            Failure Prediction - Predict equipment failures before they happen
          </span>
        </label>
      </div>
    </div>
  );
};
