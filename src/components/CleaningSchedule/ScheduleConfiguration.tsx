import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { mdiCog, mdiContentSave } from '@mdi/js';
import Icon from '@mdi/react';
import {
  CleaningScheduleConfig,
  CleaningType,
  CleaningFrequency,
} from '../../types/cleaningSchedule';

interface ScheduleConfigurationProps {
  className?: string;
}

const ScheduleConfiguration: React.FC<ScheduleConfigurationProps> = ({
  className = '',
}) => {
  const [configs, setConfigs] = useState<CleaningScheduleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleaningTypes = useMemo<
    { value: CleaningType; label: string; description: string }[]
  >(
    () => [
      {
        value: 'setup_take_down',
        label: 'Setup/Take Down',
        description: 'Daily clinic setup and closing procedures',
      },
      {
        value: 'per_patient',
        label: 'Per Patient',
        description: 'Cleaning required after each patient visit',
      },
      {
        value: 'weekly',
        label: 'Weekly',
        description: 'Weekly deep cleaning and maintenance',
      },
      {
        value: 'public_spaces',
        label: 'Public Spaces',
        description: 'Cleaning of waiting areas and common spaces',
      },
      {
        value: 'deep_clean',
        label: 'Deep Clean',
        description: 'Monthly intensive cleaning procedures',
      },
    ],
    []
  );

  const frequencies: { value: CleaningFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'per_patient', label: 'Per Patient' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'custom', label: 'Custom' },
  ];

  const loadConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll create default configs since the database tables might not exist yet
      const defaultConfigs = cleaningTypes.map((type) => ({
        id: `config-${type.value}`,
        type: type.value,
        frequency: getDefaultFrequency(type.value),
        autoGenerate: true,
        enabled: true,
        defaultPoints: getDefaultPoints(type.value),
        defaultDuration: getDefaultDuration(type.value),
        defaultPriority: getDefaultPriority(type.value),
        triggerConditions: getDefaultTriggerConditions(type.value),
        assignedRoles: ['cleaning_staff', 'maintenance'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setConfigs(defaultConfigs);
    } catch (err) {
      console.error('Failed to load configurations:', err);
      setError('Failed to load schedule configurations');
    } finally {
      setLoading(false);
    }
  }, [cleaningTypes]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  const getDefaultFrequency = (type: CleaningType): CleaningFrequency => {
    switch (type) {
      case 'setup_take_down':
        return 'daily';
      case 'per_patient':
        return 'per_patient';
      case 'weekly':
        return 'weekly';
      case 'public_spaces':
        return 'weekly';
      case 'deep_clean':
        return 'monthly';
      default:
        return 'weekly';
    }
  };

  const getDefaultPoints = (type: CleaningType): number => {
    switch (type) {
      case 'setup_take_down':
        return 50;
      case 'per_patient':
        return 75;
      case 'weekly':
        return 100;
      case 'public_spaces':
        return 60;
      case 'deep_clean':
        return 150;
      default:
        return 50;
    }
  };

  const getDefaultDuration = (type: CleaningType): number => {
    switch (type) {
      case 'setup_take_down':
        return 30;
      case 'per_patient':
        return 45;
      case 'weekly':
        return 120;
      case 'public_spaces':
        return 60;
      case 'deep_clean':
        return 240;
      default:
        return 60;
    }
  };

  const getDefaultPriority = (
    type: CleaningType
  ): 'low' | 'medium' | 'high' | 'urgent' => {
    switch (type) {
      case 'setup_take_down':
        return 'medium';
      case 'per_patient':
        return 'high';
      case 'weekly':
        return 'medium';
      case 'public_spaces':
        return 'low';
      case 'deep_clean':
        return 'high';
      default:
        return 'medium';
    }
  };

  const getDefaultTriggerConditions = (type: CleaningType) => {
    switch (type) {
      case 'setup_take_down':
        return [
          {
            id: 'setup-time',
            type: 'time_based' as const,
            condition: 'daily_at',
            value: { time: '09:00' },
            enabled: true,
          },
        ];
      case 'per_patient':
        return [
          {
            id: 'patient-room-dirty',
            type: 'room_status' as const,
            condition: 'room_status_changed',
            value: { status: 'dirty' },
            enabled: true,
          },
        ];
      case 'weekly':
        return [
          {
            id: 'weekly-friday',
            type: 'time_based' as const,
            condition: 'weekly_on',
            value: { day: 'friday', time: '14:00' },
            enabled: true,
          },
        ];
      case 'public_spaces':
        return [
          {
            id: 'public-wednesday',
            type: 'admin_decision' as const,
            condition: 'weekly_on',
            value: { day: 'wednesday', time: '10:00' },
            enabled: true,
          },
        ];
      case 'deep_clean':
        return [
          {
            id: 'deep-clean-saturday',
            type: 'admin_decision' as const,
            condition: 'monthly_on',
            value: { day: 'saturday', time: '08:00' },
            enabled: true,
          },
        ];
      default:
        return [];
    }
  };

  const updateConfig = (
    configId: string,
    updates: Partial<CleaningScheduleConfig>
  ) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === configId
          ? { ...config, ...updates, updatedAt: new Date().toISOString() }
          : config
      )
    );
  };

  const updateTriggerCondition = (
    configId: string,
    conditionId: string,
    updates: Partial<{
      enabled: boolean;
      condition: string;
      value: Record<string, unknown>;
    }>
  ) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === configId
          ? {
              ...config,
              triggerConditions: config.triggerConditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition
              ),
              updatedAt: new Date().toISOString(),
            }
          : config
      )
    );
  };

  const saveConfigurations = async () => {
    try {
      setSaving(true);
      setError(null);

      // In a real implementation, this would save to the database
      console.log('Saving configurations:', configs);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      alert('Schedule configurations saved successfully!');
    } catch (err) {
      console.error('Failed to save configurations:', err);
      setError('Failed to save configurations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon path={mdiCog} size={1.5} color="#4ECDC4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Cleaning Schedule Configuration
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveConfigurations}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Icon path={mdiContentSave} size={1} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {configs.map((config) => {
          const typeInfo = cleaningTypes.find((t) => t.value === config.type);

          return (
            <div
              key={config.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {typeInfo?.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {typeInfo?.description}
                  </p>
                </div>
                <label
                  htmlFor={`enabled-${config.id}`}
                  className="flex items-center"
                >
                  <input
                    id={`enabled-${config.id}`}
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) =>
                      updateConfig(config.id, { enabled: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Frequency */}
                <div>
                  <label
                    htmlFor={`frequency-${config.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Frequency
                  </label>
                  <select
                    id={`frequency-${config.id}`}
                    value={config.frequency}
                    onChange={(e) =>
                      updateConfig(config.id, {
                        frequency: e.target.value as CleaningFrequency,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Points */}
                <div>
                  <label
                    htmlFor={`points-${config.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Points
                  </label>
                  <input
                    id={`points-${config.id}`}
                    type="number"
                    value={config.defaultPoints}
                    onChange={(e) =>
                      updateConfig(config.id, {
                        defaultPoints: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor={`duration-${config.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duration (min)
                  </label>
                  <input
                    id={`duration-${config.id}`}
                    type="number"
                    value={config.defaultDuration}
                    onChange={(e) =>
                      updateConfig(config.id, {
                        defaultDuration: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor={`priority-${config.id}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id={`priority-${config.id}`}
                    value={config.defaultPriority}
                    onChange={(e) =>
                      updateConfig(config.id, {
                        defaultPriority: e.target.value as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'urgent',
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Trigger Conditions */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Trigger Conditions
                </h4>
                <div className="space-y-2">
                  {config.triggerConditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={condition.enabled}
                        onChange={(e) =>
                          updateTriggerCondition(config.id, condition.id, {
                            enabled: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">
                        {condition.type === 'time_based' && 'Time-based'}
                        {condition.type === 'room_status' && 'Room Status'}
                        {condition.type === 'admin_decision' &&
                          'Admin Decision'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {JSON.stringify(condition.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-generate */}
              <div className="mt-4">
                <label
                  htmlFor={`autogenerate-${config.id}`}
                  className="flex items-center"
                >
                  <input
                    id={`autogenerate-${config.id}`}
                    type="checkbox"
                    checked={config.autoGenerate}
                    onChange={(e) =>
                      updateConfig(config.id, {
                        autoGenerate: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Auto-generate schedules</span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleConfiguration;
