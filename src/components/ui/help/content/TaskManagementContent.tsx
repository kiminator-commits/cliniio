import React from 'react';

interface TaskManagementContentProps {
  onBack: () => void;
}

export const TaskManagementContent: React.FC<TaskManagementContentProps> = ({
  onBack,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">Task Management</h3>
            <p className="text-xs text-gray-500">
              Managing daily tasks and workflows
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 text-lg">
            Daily Task Management
          </h4>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="font-medium text-blue-800 mb-2">Task Categories</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sterilization: Autoclave cycles and BI tests</li>
              <li>• Inventory: Stock checks and ordering</li>
              <li>• Environmental: Cleaning schedules and compliance</li>
              <li>• Quality: Documentation and audits</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="font-medium text-green-800 mb-2">Task Completion</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Click checkboxes to mark tasks complete</li>
              <li>• Earn points for each completed task</li>
              <li>• Track progress throughout the day</li>
              <li>• Maintain streaks for consistency</li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-2">Workflow Tips</h5>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Use filters to focus on specific task types</li>
              <li>• Prioritize high-impact tasks first</li>
              <li>• Set reminders for time-sensitive items</li>
              <li>• Review completed tasks for quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
