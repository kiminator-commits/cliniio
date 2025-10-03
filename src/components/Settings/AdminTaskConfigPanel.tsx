import React, { useState, useEffect, useCallback } from 'react';
import { AdminTaskConfig } from '../../services/aiDailyTaskConfig';
import { AdminTaskConfigService } from '../../services/adminTaskConfigService';
import { useUser } from '../../contexts/UserContext';
import { logger } from '../../utils/_core/logger';

interface AdminTaskConfigPanelProps {
  facilityId?: string;
  onConfigUpdate?: (config: AdminTaskConfig) => void;
}

export const AdminTaskConfigPanel: React.FC<AdminTaskConfigPanelProps> = ({
  facilityId,
  onConfigUpdate,
}) => {
  const { currentUser } = useUser();
  const [config, setConfig] = useState<AdminTaskConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get facility ID from user context if not provided
  const effectiveFacilityId =
    facilityId || currentUser?.facility_id || 'default-facility-id';

  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedConfig =
        await AdminTaskConfigService.getConfig(effectiveFacilityId);
      setConfig(loadedConfig);

      logger.info('Admin task config loaded successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load configuration';
      setError(errorMessage);
      logger.error('Error loading admin task config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveFacilityId]);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = useCallback(async () => {
    if (!config) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updatedConfig = await AdminTaskConfigService.upsertConfig(
        effectiveFacilityId,
        config
      );
      setConfig(updatedConfig);

      setSuccess('Configuration saved successfully!');
      onConfigUpdate?.(updatedConfig);

      logger.info('Admin task config saved successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save configuration';
      setError(errorMessage);
      logger.error('Error saving admin task config:', error);
    } finally {
      setIsSaving(false);
    }
  }, [config, effectiveFacilityId, onConfigUpdate]);

  const handleReset = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const defaultConfig =
        await AdminTaskConfigService.createDefaultConfig(effectiveFacilityId);
      setConfig(defaultConfig);

      setSuccess('Configuration reset to defaults!');
      onConfigUpdate?.(defaultConfig);

      logger.info('Admin task config reset to defaults');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to reset configuration';
      setError(errorMessage);
      logger.error('Error resetting admin task config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveFacilityId, onConfigUpdate]);

  const updateConfig = useCallback(
    (updates: Partial<AdminTaskConfig>) => {
      if (config) {
        setConfig({ ...config, ...updates });
      }
    },
    [config]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>Failed to load configuration</p>
          <button
            onClick={loadConfig}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Task Assignment Configuration
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="text-green-800">{success}</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Settings */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Basic Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="maxTasksPerUser"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Max Tasks Per User
              </label>
              <input
                id="maxTasksPerUser"
                type="number"
                min="1"
                max="20"
                value={config.maxTasksPerUser}
                onChange={(e) =>
                  updateConfig({
                    maxTasksPerUser: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="aiSensitivity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                AI Sensitivity
              </label>
              <select
                id="aiSensitivity"
                value={config.aiSensitivity}
                onChange={(e) =>
                  updateConfig({
                    aiSensitivity: e.target.value as 'low' | 'medium' | 'high',
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Categories */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Enabled Task Categories
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['equipment', 'compliance', 'operational', 'safety'].map(
              (category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabledCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateConfig({
                          enabledCategories: [
                            ...config.enabledCategories,
                            category,
                          ],
                        });
                      } else {
                        updateConfig({
                          enabledCategories: config.enabledCategories.filter(
                            (c) => c !== category
                          ),
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {category}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Priority Thresholds */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Priority Thresholds
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
              <div key={priority}>
                <label
                  htmlFor={`priority-${priority}`}
                  className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                  {priority}
                </label>
                <input
                  id={`priority-${priority}`}
                  type="number"
                  min="1"
                  max="10"
                  value={config.priorityThresholds[priority]}
                  onChange={(e) =>
                    updateConfig({
                      priorityThresholds: {
                        ...config.priorityThresholds,
                        [priority]: parseInt(e.target.value) || 1,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Behavior */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            AI Behavior
          </h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoAssignment}
                onChange={(e) =>
                  updateConfig({ autoAssignment: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Enable automatic AI task assignment
              </span>
            </label>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Configuration Information
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Facility ID: {effectiveFacilityId}</p>
            <p>Last Updated: {new Date().toLocaleDateString()}</p>
            <p>Categories Enabled: {config.enabledCategories.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
