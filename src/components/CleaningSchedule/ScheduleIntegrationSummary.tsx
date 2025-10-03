import React from 'react';
import {
  mdiCalendar,
  mdiCheckCircle,
  mdiRobot,
  mdiAccountGroup,
  mdiClock,
  mdiCog,
} from '@mdi/js';
import Icon from '@mdi/react';

const ScheduleIntegrationSummary: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon path={mdiCalendar} size={1.5} color="#4ECDC4" />
          <h2 className="text-xl font-semibold text-gray-900">
            Cleaning Schedule Integration
          </h2>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
          ✅ Integrated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Checklist Management Integration */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiCog} size={1} color="#4ECDC4" />
            <h3 className="font-medium text-gray-800">
              Checklist Settings Integration
            </h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Scheduling configuration in Checklist Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Auto-schedule toggle for each checklist</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Frequency, priority, and trigger settings</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Visual indicators for auto-scheduled checklists</span>
            </div>
          </div>
        </div>

        {/* AI Assignment System */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiRobot} size={1} color="#4ECDC4" />
            <h3 className="font-medium text-gray-800">AI-Powered Assignment</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Workload balance (30% weight)</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Performance history (25% weight)</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Skill matching (20% weight)</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Availability & preferences (25% weight)</span>
            </div>
          </div>
        </div>

        {/* Scheduling Types */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiClock} size={1} color="#4ECDC4" />
            <h3 className="font-medium text-gray-800">Scheduling Types</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>
                <strong>Setup/Take Down:</strong> Daily clinic operations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span>
                <strong>Per Patient:</strong> Room status triggered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>
                <strong>Weekly:</strong> Admin-configurable schedule
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>
                <strong>Public Spaces:</strong> Common area cleaning
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>
                <strong>Deep Clean:</strong> Monthly intensive procedures
              </span>
            </div>
          </div>
        </div>

        {/* Home Dashboard Integration */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon path={mdiAccountGroup} size={1} color="#4ECDC4" />
            <h3 className="font-medium text-gray-800">Staff Experience</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Cleaning tasks appear in home dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Priority indicators and overdue alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>One-click completion with points earned</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon path={mdiCheckCircle} size={0.8} color="#10b981" />
              <span>Real-time integration with existing task system</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-3">
          How to Enable Scheduling for Checklists
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="font-medium">1.</span>
            <span>
              Go to Settings → Environmental Cleaning → Checklist Management
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">2.</span>
            <span>
              Click "Add Checklist" or "Edit & Manage" on existing checklist
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">3.</span>
            <span>
              In the "Scheduling Configuration" section, check "Enable
              Auto-Scheduling"
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">4.</span>
            <span>
              Configure frequency, priority, points, and trigger conditions
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">5.</span>
            <span>
              Save and publish the checklist - it will now appear in staff
              schedules
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          ✅ Checklist Management Integration Complete
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          ✅ AI Assignment Algorithm Ready
        </span>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          ✅ Home Dashboard Integration Active
        </span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
          🔄 Staff Scheduling Integration (Future)
        </span>
      </div>
    </div>
  );
};

export default ScheduleIntegrationSummary;
