import React from 'react';
import { SterilizationAISettings as SterilizationAISettingsType } from '../../../../../services/ai/sterilizationAIService';

interface PrivacyDataSecurityProps {
  settings: SterilizationAISettingsType;
  onInputChange: (
    field: keyof SterilizationAISettingsType,
    value: string | number | boolean
  ) => void;
}

const PrivacyDataSecurity: React.FC<PrivacyDataSecurityProps> = ({
  settings,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4">
        Privacy & Data Security
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          htmlFor="encryptedDataTransmission"
          className="flex items-center gap-3"
        >
          <input
            id="encryptedDataTransmission"
            type="checkbox"
            checked={settings.encrypted_data_transmission}
            onChange={(e) =>
              onInputChange(
                'encrypted_data_transmission',
                e.target.checked
              )
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Encrypted Data Transmission
          </span>
        </label>

        <label
          htmlFor="localAIProcessingEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="localAIProcessingEnabled"
            type="checkbox"
            checked={settings.local_ai_processing_enabled}
            onChange={(e) =>
              onInputChange(
                'local_ai_processing_enabled',
                e.target.checked
              )
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Local AI Processing (Offline)
          </span>
        </label>

        <label
          htmlFor="dataSharingEnabled"
          className="flex items-center gap-3"
        >
          <input
            id="dataSharingEnabled"
            type="checkbox"
            checked={settings.data_sharing_enabled}
            onChange={(e) =>
              onInputChange('data_sharing_enabled', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Share Data for AI Model Improvement
          </span>
        </label>

        <label
          htmlFor="aiModelTraining"
          className="flex items-center gap-3"
        >
          <input
            id="aiModelTraining"
            type="checkbox"
            checked={settings.ai_model_training}
            onChange={(e) =>
              onInputChange('ai_model_training', e.target.checked)
            }
            disabled={!settings.ai_enabled}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-700">
            Participate in AI Model Training
          </span>
        </label>
      </div>
    </div>
  );
};

export default PrivacyDataSecurity;
