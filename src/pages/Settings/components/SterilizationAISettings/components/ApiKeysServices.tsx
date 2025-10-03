import React from 'react';
import { SterilizationAISettings as SterilizationAISettingsType } from '../../../../../services/ai/sterilizationAIService';

interface ApiKeysServicesProps {
  settings: SterilizationAISettingsType;
  onApiKeyChange: (
    field:
      | 'openai_api_key_encrypted'
      | 'google_vision_api_key_encrypted'
      | 'azure_computer_vision_key_encrypted',
    value: string
  ) => void;
}

const ApiKeysServices: React.FC<ApiKeysServicesProps> = ({
  settings,
  onApiKeyChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4">
        AI Service Configuration
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="openaiApiKey"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            OpenAI API Key
          </label>
          <input
            id="openaiApiKey"
            type="password"
            value={settings.openai_api_key_encrypted}
            onChange={(e) =>
              onApiKeyChange('openai_api_key_encrypted', e.target.value)
            }
            disabled={!settings.ai_enabled}
            placeholder="sk-..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for text analysis and workflow suggestions
          </p>
        </div>

        <div>
          <label
            htmlFor="googleVisionApiKey"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Google Vision API Key
          </label>
          <input
            id="googleVisionApiKey"
            type="password"
            value={settings.google_vision_api_key_encrypted}
            onChange={(e) =>
              onApiKeyChange(
                'google_vision_api_key_encrypted',
                e.target.value
              )
            }
            disabled={!settings.ai_enabled}
            placeholder="AIza..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for image analysis and barcode detection
          </p>
        </div>

        <div>
          <label
            htmlFor="azureComputerVisionKey"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Azure Computer Vision Key
          </label>
          <input
            id="azureComputerVisionKey"
            type="password"
            value={settings.azure_computer_vision_key_encrypted}
            onChange={(e) =>
              onApiKeyChange(
                'azure_computer_vision_key_encrypted',
                e.target.value
              )
            }
            disabled={!settings.ai_enabled}
            placeholder="Azure..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alternative vision service for tool analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysServices;
