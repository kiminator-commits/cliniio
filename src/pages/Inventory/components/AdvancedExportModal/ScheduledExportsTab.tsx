import React from 'react';
import {
  ExportTemplate,
  ExportSchedule,
} from '../../services/inventoryExportTemplateService';
import { ScheduleForm } from './ScheduleForm';

interface ScheduleFormData {
  name: string;
  templateId: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
  cronExpression: string;
  recipients: string[];
  enabled: boolean;
}

interface ScheduledExportsTabProps {
  templates: ExportTemplate[];
  schedules: ExportSchedule[];
  showScheduleForm: boolean;
  scheduleForm: ScheduleFormData;
  onShowScheduleForm: (show: boolean) => void;
  onScheduleFormChange: (data: ScheduleFormData) => void;
  onCreateSchedule: () => void;
  onToggleSchedule: (scheduleId: string, enabled: boolean) => void;
  onTriggerExport: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const ScheduledExportsTab: React.FC<ScheduledExportsTabProps> = ({
  templates,
  schedules,
  showScheduleForm,
  scheduleForm,
  onShowScheduleForm,
  onScheduleFormChange,
  onCreateSchedule,
  onToggleSchedule,
  onTriggerExport,
  onDeleteSchedule,
}) => {
  const getDayName = (dayOfWeek: number) => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayOfWeek];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Scheduled Exports</h3>
        <button
          onClick={() => onShowScheduleForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Schedule
        </button>
      </div>

      {showScheduleForm && (
        <ScheduleForm
          templates={templates}
          formData={scheduleForm}
          onFormChange={onScheduleFormChange}
          onSubmit={onCreateSchedule}
          onCancel={() => onShowScheduleForm(false)}
        />
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{schedule.name}</h4>
                <p className="text-sm text-gray-600">
                  {schedule.schedule} at {schedule.time}
                  {schedule.schedule === 'weekly' &&
                    schedule.dayOfWeek !== undefined && (
                      <span> on {getDayName(schedule.dayOfWeek)}</span>
                    )}
                  {schedule.schedule === 'monthly' && schedule.dayOfMonth && (
                    <span> on day {schedule.dayOfMonth}</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Recipients: {schedule.recipients.join(', ')}
                </p>
                {schedule.lastRun && (
                  <p className="text-sm text-gray-600">
                    Last run: {schedule.lastRun.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    onToggleSchedule(schedule.id, !schedule.enabled)
                  }
                  className={`px-3 py-1 text-sm rounded ${
                    schedule.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => onTriggerExport(schedule.id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  Run Now
                </button>
                <button
                  onClick={() => onDeleteSchedule(schedule.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {schedules.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No scheduled exports found
          </p>
        )}
      </div>
    </div>
  );
};
