import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiSpeedometer, mdiAlertCircle, mdiCheckCircle, mdiLock } from '@mdi/js';
import { useAISettingsPermissions } from '../../../../../hooks/useAISettingsPermissions';

interface ThrottlingSettings {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
  monthlyTokenLimit: number; // Changed from monthlyBudgetLimit
  warningThreshold: number; // percentage
  criticalThreshold: number; // percentage
}

interface ThrottlingControlsProps {
  settings: ThrottlingSettings;
  onUpdateSettings: (settings: ThrottlingSettings) => void;
  currentUsage: {
    requestsThisMinute: number;
    requestsThisHour: number;
    monthlyTokens: number; // Changed from monthlyCost
    monthlyTokenLimit: number; // Changed from monthlyBudget
  };
}

const ThrottlingControls: React.FC<ThrottlingControlsProps> = ({
  settings,
  onUpdateSettings,
  currentUsage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState<ThrottlingSettings>(settings);
  const { canManageThrottling, userRole } = useAISettingsPermissions();

  const handleSave = () => {
    onUpdateSettings(tempSettings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  const getStatusColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return mdiAlertCircle;
    if (percentage >= 75) return mdiAlertCircle;
    return mdiCheckCircle;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon path={mdiSpeedometer} size={1.2} className="text-[#4ECDC4]" />
          <h3 className="text-xl font-semibold text-gray-900">Throttling Controls</h3>
          {!canManageThrottling && (
            <Icon path={mdiLock} size={0.8} className="text-gray-400" title="Admin Only" />
          )}
          {/* Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            settings.enabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {canManageThrottling ? (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm font-medium text-[#4ECDC4] hover:text-[#3db8b0] transition-colors"
          >
            {isEditing ? 'Cancel' : 'Configure'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Admin access required
            </span>
            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Role: {userRole} | Admin: {canManageThrottling ? 'Yes' : 'No'}
            </div>
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requests/Minute</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentUsage.requestsThisMinute, settings.requestsPerMinute)}`}>
                {currentUsage.requestsThisMinute}
              </p>
              <p className="text-xs text-gray-500">of {settings.requestsPerMinute}</p>
            </div>
            <Icon 
              path={getStatusIcon(currentUsage.requestsThisMinute, settings.requestsPerMinute)} 
              size={1.5} 
              className={getStatusColor(currentUsage.requestsThisMinute, settings.requestsPerMinute)} 
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requests/Hour</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentUsage.requestsThisHour, settings.requestsPerHour)}`}>
                {currentUsage.requestsThisHour}
              </p>
              <p className="text-xs text-gray-500">of {settings.requestsPerHour}</p>
            </div>
            <Icon 
              path={getStatusIcon(currentUsage.requestsThisHour, settings.requestsPerHour)} 
              size={1.5} 
              className={getStatusColor(currentUsage.requestsThisHour, settings.requestsPerHour)} 
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Tokens</p>
              <p className={`text-2xl font-bold ${getStatusColor(currentUsage.monthlyTokens, currentUsage.monthlyTokenLimit)}`}>
                {currentUsage.monthlyTokens.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">of {currentUsage.monthlyTokenLimit.toLocaleString()}</p>
            </div>
            <Icon 
              path={getStatusIcon(currentUsage.monthlyTokens, currentUsage.monthlyTokenLimit)} 
              size={1.5} 
              className={getStatusColor(currentUsage.monthlyTokens, currentUsage.monthlyTokenLimit)} 
            />
          </div>
        </div>
      </div>

      {/* Configuration Panel - Admin Only */}
      {isEditing && canManageThrottling && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Throttling Configuration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests Per Minute
                </label>
                <input
                  type="number"
                  value={tempSettings.requestsPerMinute}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, requestsPerMinute: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requests Per Hour
                </label>
                <input
                  type="number"
                  value={tempSettings.requestsPerHour}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, requestsPerHour: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="1"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Burst Limit
                </label>
                <input
                  type="number"
                  value={tempSettings.burstLimit}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, burstLimit: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Token Limit
                </label>
                <input
                  type="number"
                  value={tempSettings.monthlyTokenLimit}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, monthlyTokenLimit: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="10000"
                  max="10000000"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 500,000 - 1,000,000 tokens/month</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Threshold (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.warningThreshold}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, warningThreshold: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="50"
                  max="95"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Threshold (%)
                </label>
                <input
                  type="number"
                  value={tempSettings.criticalThreshold}
                  onChange={(e) => setTempSettings(prev => ({ ...prev, criticalThreshold: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  min="75"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] hover:bg-[#3db8b0] rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Admin Toggle - Only show if user has admin access */}
      {canManageThrottling && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Enable/Disable Throttling
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => onUpdateSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ECDC4]"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThrottlingControls;
