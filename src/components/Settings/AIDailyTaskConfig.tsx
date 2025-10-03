import React, { useState } from 'react';
import { scanOperationalGaps } from '../../services/aiDailyTask';
import { aiDailyTaskService } from '../../services/aiDailyTaskService';

interface AIDailyTaskConfigProps {
  facilityId: string;
}

export const AIDailyTaskConfig: React.FC<AIDailyTaskConfigProps> = ({
  facilityId,
}) => {
  const [config, setConfig] = useState({
    maxTasksPerUser: 3,
    enabledCategories: ['equipment', 'compliance', 'operational', 'safety'],
    autoAssignment: true,
    aiSensitivity: 'medium' as const,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfigChange = (
    key: string,
    value: string | number | boolean | string[]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateDailyTasks = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      await aiDailyTaskService.generateDailyTasks(facilityId);
      setMessage('Daily tasks generated successfully!');
    } catch (error) {
      setMessage(
        `Error generating tasks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestGeneration = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      // Test with a smaller scope
      const testGaps = await scanOperationalGaps(facilityId);
      setMessage(
        `Found ${testGaps.length} operational gaps. Ready to generate tasks.`
      );
    } catch (error) {
      setMessage(
        `Error scanning gaps: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        AI Daily Task Configuration
      </h3>

      <div className="space-y-4">
        {/* Max Tasks Per User */}
        <div>
          <label
            htmlFor="maxTasksPerUser"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Max Tasks Per User
          </label>
          <input
            id="maxTasksPerUser"
            type="number"
            min="1"
            max="10"
            value={config.maxTasksPerUser}
            onChange={(e) =>
              handleConfigChange('maxTasksPerUser', parseInt(e.target.value))
            }
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Enabled Categories */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Enabled Task Categories
          </legend>
          <div className="space-y-2">
            {['equipment', 'compliance', 'operational', 'safety'].map(
              (category) => (
                <label key={category} className="flex items-center">
                  <input
                    id={`category-${category}`}
                    type="checkbox"
                    checked={config.enabledCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleConfigChange('enabledCategories', [
                          ...config.enabledCategories,
                          category,
                        ]);
                      } else {
                        handleConfigChange(
                          'enabledCategories',
                          config.enabledCategories.filter((c) => c !== category)
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{category}</span>
                </label>
              )
            )}
          </div>
        </fieldset>

        {/* Auto Assignment */}
        <div>
          <label htmlFor="autoAssignment" className="flex items-center">
            <input
              id="autoAssignment"
              type="checkbox"
              checked={config.autoAssignment}
              onChange={(e) =>
                handleConfigChange('autoAssignment', e.target.checked)
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Automatic Task Assignment
            </span>
          </label>
        </div>

        {/* AI Sensitivity */}
        <div>
          <label
            htmlFor="aiSensitivity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            AI Sensitivity Level
          </label>
          <select
            id="aiSensitivity"
            value={config.aiSensitivity}
            onChange={(e) =>
              handleConfigChange('aiSensitivity', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low - Conservative task generation</option>
            <option value="medium">Medium - Balanced approach</option>
            <option value="high">High - Aggressive task generation</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleTestGeneration}
            disabled={isGenerating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {isGenerating ? 'Testing...' : 'Test Configuration'}
          </button>

          <button
            onClick={handleGenerateDailyTasks}
            disabled={isGenerating || !config.autoAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Daily Tasks'}
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-md ${
              message.includes('Error')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">How It Works</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• AI scans your facility for operational gaps daily</li>
          <li>• Tasks are automatically assigned based on user roles</li>
          <li>• Maximum {config.maxTasksPerUser} tasks per user</li>
          <li>• Tasks appear in the home dashboard</li>
          <li>• Points and completion tracking included</li>
        </ul>
      </div>
    </div>
  );
};
