import React from 'react';
import { ExportTemplate } from '../../services/inventoryExportTemplateService';

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

interface ScheduleFormProps {
  templates: ExportTemplate[];
  formData: ScheduleFormData;
  onFormChange: (data: ScheduleFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  templates,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}) => {
  const updateFormData = (updates: Partial<ScheduleFormData>) => {
    onFormChange({ ...formData, ...updates });
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    updateFormData({ recipients: newRecipients });
  };

  const removeRecipient = (index: number) => {
    const newRecipients = formData.recipients.filter((_, i) => i !== index);
    updateFormData({ recipients: newRecipients });
  };

  const addRecipient = () => {
    updateFormData({ recipients: [...formData.recipients, ''] });
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-4">Create New Schedule</h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="schedule-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="schedule-name"
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Daily Inventory Report"
          />
        </div>

        <div>
          <label
            htmlFor="schedule-template"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Template
          </label>
          <select
            id="schedule-template"
            value={formData.templateId}
            onChange={(e) => updateFormData({ templateId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select Template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label
            htmlFor="schedule-type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Schedule
          </label>
          <select
            id="schedule-type"
            value={formData.schedule}
            onChange={(e) =>
              updateFormData({
                schedule: e.target.value as
                  | 'daily'
                  | 'weekly'
                  | 'monthly'
                  | 'custom',
              })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="schedule-time"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time
          </label>
          <input
            id="schedule-time"
            type="time"
            value={formData.time}
            onChange={(e) => updateFormData({ time: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {formData.schedule === 'weekly' && (
          <div>
            <label
              htmlFor="schedule-day-of-week"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Day of Week
            </label>
            <select
              id="schedule-day-of-week"
              value={formData.dayOfWeek}
              onChange={(e) =>
                updateFormData({ dayOfWeek: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        )}

        {formData.schedule === 'monthly' && (
          <div>
            <label
              htmlFor="schedule-day-of-month"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Day of Month
            </label>
            <input
              id="schedule-day-of-month"
              type="number"
              min="1"
              max="31"
              value={formData.dayOfMonth}
              onChange={(e) =>
                updateFormData({ dayOfMonth: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="schedule-recipients"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Recipients
        </label>
        {formData.recipients.map((email, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              id={`schedule-recipient-${index}`}
              type="email"
              value={email}
              onChange={(e) => updateRecipient(index, e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              placeholder="email@example.com"
            />
            <button
              onClick={() => removeRecipient(index)}
              className="px-3 py-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addRecipient}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Recipient
        </button>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Schedule
        </button>
      </div>
    </div>
  );
};
