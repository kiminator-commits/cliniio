import React from 'react';
import Icon from '@mdi/react';
import { mdiCalendar } from '@mdi/js';

interface SchedulingConfigProps {
  autoSchedule: boolean;
  scheduleFrequency:
    | 'daily'
    | 'per_patient'
    | 'weekly'
    | 'bi_weekly'
    | 'monthly'
    | 'quarterly'
    | 'custom';
  scheduleDay:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  scheduleTime: string;
  schedulePriority: 'low' | 'medium' | 'high' | 'urgent';
  schedulePoints: number;
  scheduleDuration: number;
  triggerRoomStatus: boolean;
  triggerStaffSchedule: boolean;
  triggerAdminDecision: boolean;
  onConfigChange: (config: {
    autoSchedule: boolean;
    scheduleFrequency:
      | 'daily'
      | 'per_patient'
      | 'weekly'
      | 'bi_weekly'
      | 'monthly'
      | 'quarterly'
      | 'custom';
    scheduleDay:
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';
    scheduleTime: string;
    schedulePriority: 'low' | 'medium' | 'high' | 'urgent';
    schedulePoints: number;
    scheduleDuration: number;
    triggerRoomStatus: boolean;
    triggerStaffSchedule: boolean;
    triggerAdminDecision: boolean;
  }) => void;
}

const SchedulingConfig: React.FC<SchedulingConfigProps> = ({
  autoSchedule,
  scheduleFrequency,
  scheduleDay,
  scheduleTime,
  schedulePriority,
  schedulePoints,
  scheduleDuration,
  triggerRoomStatus,
  triggerStaffSchedule,
  triggerAdminDecision,
  onConfigChange,
}) => {
  const handleConfigChange = (updates: Partial<SchedulingConfigProps>) => {
    onConfigChange({
      autoSchedule,
      scheduleFrequency,
      scheduleDay,
      scheduleTime,
      schedulePriority,
      schedulePoints,
      scheduleDuration,
      triggerRoomStatus,
      triggerStaffSchedule,
      triggerAdminDecision,
      ...updates,
    });
  };

  return (
    <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-blue-800 flex items-center">
          <Icon path={mdiCalendar} size={1} className="mr-2" />
          Scheduling Configuration
        </h4>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoSchedule}
            onChange={(e) =>
              handleConfigChange({ autoSchedule: e.target.checked })
            }
            className="mr-2"
          />
          <span className="text-sm text-blue-700">Enable Auto-Scheduling</span>
        </label>
      </div>

      {autoSchedule && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Frequency */}
          <div>
            <label
              htmlFor="schedule-frequency"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Frequency
            </label>
            <select
              id="schedule-frequency"
              value={scheduleFrequency}
              onChange={(e) =>
                handleConfigChange({
                  scheduleFrequency: e.target.value as
                    | 'daily'
                    | 'per_patient'
                    | 'weekly'
                    | 'bi_weekly'
                    | 'monthly'
                    | 'quarterly'
                    | 'custom',
                })
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="per_patient">Per Patient</option>
              <option value="weekly">Weekly</option>
              <option value="bi_weekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Schedule Day (for weekly/monthly) */}
          {(scheduleFrequency === 'weekly' ||
            scheduleFrequency === 'bi_weekly' ||
            scheduleFrequency === 'monthly') && (
            <div>
              <label
                htmlFor="schedule-day"
                className="block text-sm font-medium text-blue-700 mb-1"
              >
                Schedule Day
              </label>
              <select
                id="schedule-day"
                value={scheduleDay}
                onChange={(e) =>
                  handleConfigChange({
                    scheduleDay: e.target.value as
                      | 'monday'
                      | 'tuesday'
                      | 'wednesday'
                      | 'thursday'
                      | 'friday'
                      | 'saturday'
                      | 'sunday',
                  })
                }
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          )}

          {/* Schedule Time */}
          <div>
            <label
              htmlFor="schedule-time"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Schedule Time
            </label>
            <input
              id="schedule-time"
              type="time"
              value={scheduleTime}
              onChange={(e) =>
                handleConfigChange({ scheduleTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="schedule-priority"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Priority
            </label>
            <select
              id="schedule-priority"
              value={schedulePriority}
              onChange={(e) =>
                handleConfigChange({
                  schedulePriority: e.target.value as
                    | 'low'
                    | 'medium'
                    | 'high'
                    | 'urgent',
                })
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Points */}
          <div>
            <label
              htmlFor="schedule-points"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Points
            </label>
            <input
              id="schedule-points"
              type="number"
              value={schedulePoints}
              onChange={(e) =>
                handleConfigChange({ schedulePoints: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label
              htmlFor="schedule-duration"
              className="block text-sm font-medium text-blue-700 mb-1"
            >
              Duration (minutes)
            </label>
            <input
              id="schedule-duration"
              type="number"
              value={scheduleDuration}
              onChange={(e) =>
                handleConfigChange({
                  scheduleDuration: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        </div>
      )}

      {/* Trigger Conditions */}
      {autoSchedule && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-blue-700 mb-2">
            Trigger Conditions
          </h5>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={triggerRoomStatus}
                onChange={(e) =>
                  handleConfigChange({ triggerRoomStatus: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-blue-700">
                Trigger on room status change
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={triggerStaffSchedule}
                onChange={(e) =>
                  handleConfigChange({ triggerStaffSchedule: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-blue-700">
                Trigger based on staff availability
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={triggerAdminDecision}
                onChange={(e) =>
                  handleConfigChange({ triggerAdminDecision: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-blue-700">
                Require admin approval
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingConfig;
