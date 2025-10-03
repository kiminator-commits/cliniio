import React, { useState } from 'react';
import Icon from '../Icon/Icon';
import { mdiPlay, mdiPause } from '@mdi/js';
import { useTrackedTools } from '../../hooks/inventory/useTrackedTools';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { trackedToolsService } from '../../services/trackedToolsService';
import { Tool } from '../../types/toolTypes';
import {
  TrackedToolPriority,
  TrackedToolNotification,
} from '../../services/trackedToolsService';

export const TrackedToolsDemo: React.FC = () => {
  const { trackedTools, trackingStats, pendingNotifications } =
    useTrackedTools();
  const { availableTools, updateToolStatus } = useSterilizationStore();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Demo function to simulate tool status changes
  const simulateToolStatusChange = (toolId: string, newStatus: string) => {
    if (updateToolStatus) {
      // Map demo statuses to actual workflow statuses
      const statusMap: Record<
        string,
        'bath1' | 'bath2' | 'airDry' | 'autoclave' | 'complete' | 'failed'
      > = {
        available: 'complete',
        dirty: 'bath1',
        sterilizing: 'autoclave',
        complete: 'complete',
      };
      const mappedStatus = statusMap[newStatus] || 'complete';
      updateToolStatus(toolId, mappedStatus);
    }
  };

  // Demo function to track a tool with different priorities
  const demoTrackTool = (
    toolId: string,
    priority: 'high' | 'medium' | 'low'
  ) => {
    trackedToolsService.trackTool(toolId, 'Demo Doctor', priority);
  };

  // Demo function to simulate tool becoming available
  const simulateToolBecomingAvailable = (toolId: string) => {
    const tool = availableTools.find((t: Tool) => t.id === toolId);
    if (tool) {
      // Simulate the tool completing sterilization
      simulateToolStatusChange(toolId, 'available');

      // This will trigger the notification system
      setTimeout(() => {
        trackedToolsService.monitorToolStatusChange(
          toolId,
          'dirty',
          'available'
        );
      }, 1000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Tracked Tools Demo
        </h3>
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isDemoMode
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <Icon
            path={isDemoMode ? mdiPause : mdiPlay}
            size={1}
            className="inline mr-1"
          />
          {isDemoMode ? 'Stop Demo' : 'Start Demo'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {trackingStats.totalTracked}
          </div>
          <div className="text-sm text-blue-700">Total Tracked</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {trackingStats.highPriority}
          </div>
          <div className="text-sm text-red-700">High Priority</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {trackingStats.mediumPriority}
          </div>
          <div className="text-sm text-yellow-700">Medium Priority</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {trackingStats.lowPriority}
          </div>
          <div className="text-sm text-blue-700">Low Priority</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {trackingStats.pendingNotifications}
          </div>
          <div className="text-sm text-green-700">Notifications</div>
        </div>
      </div>

      {/* Demo Controls */}
      {isDemoMode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Demo Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Track Tools with Priority
              </h5>
              <div className="space-y-2">
                {availableTools.slice(0, 3).map((tool: Tool) => (
                  <div key={tool.id} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-20 truncate">
                      {tool.name}
                    </span>
                    <div className="flex gap-1">
                      {(['high', 'medium', 'low'] as const).map(
                        (priority: 'high' | 'medium' | 'low') => (
                          <button
                            key={priority}
                            onClick={() => demoTrackTool(tool.id, priority)}
                            className={`px-2 py-1 text-xs rounded ${
                              priority === 'high'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {priority}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Simulate Tool Availability
              </h5>
              <div className="space-y-2">
                {availableTools.slice(0, 3).map((tool: Tool) => (
                  <button
                    key={tool.id}
                    onClick={() => simulateToolBecomingAvailable(tool.id)}
                    className="block w-full px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
                  >
                    Make {tool.name} Available
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracked Tools List */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-800 mb-3">
          Currently Tracked Tools
        </h4>
        {trackedTools.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No tools are currently being tracked.
          </p>
        ) : (
          <div className="space-y-2">
            {trackedTools.map((tracked: TrackedToolPriority) => {
              const tool = availableTools.find(
                (t: Tool) => t.id === tracked.toolId
              );
              return (
                <div
                  key={`${tracked.toolId}-${tracked.doctorName}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">
                      {tool?.name || tracked.toolId}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tracked.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : tracked.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {tracked.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      {tracked.doctorName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(tracked.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Notifications */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">
          Pending Notifications
        </h4>
        {pendingNotifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No pending notifications.</p>
        ) : (
          <div className="space-y-2">
            {pendingNotifications.map(
              (notification: TrackedToolNotification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {notification.toolName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {notification.doctorName}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      notification.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : notification.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {notification.priority}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackedToolsDemo;
