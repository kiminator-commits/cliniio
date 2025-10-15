import React from 'react';
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import { SectionProps } from './types';

export const SmartWorkflowSection: React.FC<SectionProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiCog} size={1.2} className="text-orange-600" />
        Smart Workflow Automation
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          htmlFor="smartWorkflowEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="smartWorkflowEnabled"
            type="checkbox"
            checked={settings.smart_workflow_enabled}
            onChange={(e) =>
              onSettingsChange('smart_workflow_enabled', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Enable Smart Workflows
            </span>
            <p className="text-xs text-gray-500">
              Master toggle for all workflow automation
            </p>
          </div>
          <span className="sr-only">
            Enable Smart Workflows - Master toggle for all workflow automation
          </span>
        </label>

        <label
          htmlFor="intelligentWorkflowSelection"
          className="flex items-center gap-3"
        >
          <input
            id="intelligentWorkflowSelection"
            type="checkbox"
            checked={settings.intelligent_workflow_selection}
            onChange={(e) =>
              onSettingsChange(
                'intelligent_workflow_selection',
                e.target.checked
              )
            }
            disabled={!settings.ai_enabled || !settings.smart_workflow_enabled}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Intelligent Workflow Selection
            </span>
            <p className="text-xs text-gray-500">
              AI suggests optimal workflow based on tool condition
            </p>
          </div>
          <span className="sr-only">
            Intelligent Workflow Selection - AI suggests optimal workflow based
            on tool condition
          </span>
        </label>

        <label
          htmlFor="automatedProblemDetection"
          className="flex items-center gap-3"
        >
          <input
            id="automatedProblemDetection"
            type="checkbox"
            checked={settings.automated_problem_detection}
            onChange={(e) =>
              onSettingsChange('automated_problem_detection', e.target.checked)
            }
            disabled={!settings.ai_enabled || !settings.smart_workflow_enabled}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Automated Problem Detection
            </span>
            <p className="text-xs text-gray-500">
              Automatically detect and flag potential issues
            </p>
          </div>
          <span className="sr-only">
            Automated Problem Detection - Automatically detect and flag
            potential issues
          </span>
        </label>
      </div>
    </div>
  );
};
