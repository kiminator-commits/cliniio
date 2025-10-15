import React from 'react';
import Icon from '@mdi/react';
import { mdiChartBar } from '@mdi/js';
import { SectionProps } from './types';

export const ComputerVisionSection: React.FC<SectionProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
        <Icon path={mdiChartBar} size={1.2} className="text-blue-600" />
        Computer Vision & Image Recognition
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="computerVisionEnabled"
              type="checkbox"
              className="sr-only peer"
              checked={settings.computer_vision_enabled}
              onChange={(e) =>
                onSettingsChange('computer_vision_enabled', e.target.checked)
              }
              disabled={!settings.ai_enabled}
            />
            <div
              className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.computer_vision_enabled ? 'bg-[#4ECDC4] after:translate-x-full' : 'bg-gray-200'} ${!settings.ai_enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            ></div>
            <span className="sr-only">
              Enable Computer Vision - Master toggle for all vision features
            </span>
          </label>
          <div>
            <span className="text-sm font-medium text-gray-700">
              Enable Computer Vision
            </span>
            <p className="text-xs text-gray-500">
              Master toggle for all vision features
            </p>
          </div>
        </div>

        <label
          htmlFor="toolConditionAssessment"
          className="flex items-center gap-3"
        >
          <input
            id="toolConditionAssessment"
            type="checkbox"
            checked={settings.tool_condition_assessment}
            onChange={(e) =>
              onSettingsChange('tool_condition_assessment', e.target.checked)
            }
            disabled={!settings.ai_enabled || !settings.computer_vision_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Tool Condition Assessment
            </span>
            <p className="text-xs text-gray-500">
              AI-powered tool wear and damage detection
            </p>
          </div>
          <span className="sr-only">
            Tool Condition Assessment - AI-powered tool wear and damage
            detection
          </span>
        </label>

        <label
          htmlFor="barcodeQualityDetection"
          className="flex items-center gap-3"
        >
          <input
            id="barcodeQualityDetection"
            type="checkbox"
            checked={settings.barcode_quality_detection}
            onChange={(e) =>
              onSettingsChange('barcode_quality_detection', e.target.checked)
            }
            disabled={!settings.ai_enabled || !settings.computer_vision_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Barcode Quality Detection
            </span>
            <p className="text-xs text-gray-500">
              Automatic barcode readability assessment
            </p>
          </div>
          <span className="sr-only">
            Barcode Quality Detection - Automatic barcode readability assessment
          </span>
        </label>

        <label
          htmlFor="toolTypeRecognition"
          className="flex items-center gap-3"
        >
          <input
            id="toolTypeRecognition"
            type="checkbox"
            checked={settings.tool_type_recognition}
            onChange={(e) =>
              onSettingsChange('tool_type_recognition', e.target.checked)
            }
            disabled={!settings.ai_enabled || !settings.computer_vision_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <div>
            <span className="text-sm font-medium text-gray-700">
              Tool Type Recognition
            </span>
            <p className="text-xs text-gray-500">
              Automatic tool identification from images
            </p>
          </div>
          <span className="sr-only">
            Tool Type Recognition - Automatic tool identification from images
          </span>
        </label>
      </div>
    </div>
  );
};
