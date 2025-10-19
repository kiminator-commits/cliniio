import React from 'react';
import Icon from '@mdi/react';
import { mdiAlertCircle, mdiInformation } from '@mdi/js';

interface ApiKeysServicesProps {
  settings: Record<string, unknown>; // Keep for compatibility but won't use API key fields
  onApiKeyChange: () => void; // No-op function for compatibility
}

const ApiKeysServices: React.FC<ApiKeysServicesProps> = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h5 className="text-lg font-medium text-gray-800 mb-4">
        AI Service Configuration
      </h5>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex">
          <Icon path={mdiAlertCircle} size={1} className="text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h6 className="text-sm font-medium text-yellow-800 mb-2">
              API Key Configuration Moved to Server
            </h6>
            <p className="text-sm text-yellow-700 mb-3">
              For security reasons, API keys are now configured server-side and cannot be managed through this interface.
            </p>
            <div className="flex items-start">
              <Icon path={mdiInformation} size={0.8} className="text-yellow-600 mr-2 mt-0.5" />
              <div className="text-xs text-yellow-600">
                <p className="mb-1">• API keys are stored securely on the server</p>
                <p className="mb-1">• Keys are never exposed to the browser</p>
                <p>• Contact your administrator to configure API keys</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-md p-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">OpenAI Service</h6>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Configured Server-Side</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Text analysis and workflow suggestions
          </p>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Google Vision Service</h6>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Configured Server-Side</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Image analysis and barcode detection
          </p>
        </div>

        <div className="bg-gray-50 rounded-md p-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Azure Vision Service</h6>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Configured Server-Side</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Alternative vision service for tool analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysServices;
