import React, { useState } from 'react';
import {
  mdiCalendar,
  mdiClock,
  mdiAccount,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiProgressClock,
} from '@mdi/js';
import Icon from '@mdi/react';
import { CleaningSchedule, CleaningType } from '../../types/cleaningSchedule';
import { useHomeCleaningSchedule } from '../../hooks/useCleaningSchedule';

interface CleaningScheduleCardProps {
  className?: string;
  showCompleted?: boolean;
  maxItems?: number;
}

const CleaningScheduleCard: React.FC<CleaningScheduleCardProps> = ({
  className = '',
  showCompleted = false,
  maxItems = 5,
}) => {
  const { loading, completeSchedule, getTodaysSchedules, getOverdueSchedules } =
    useHomeCleaningSchedule();
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);

  const todaysSchedules = getTodaysSchedules();
  const overdueSchedules = getOverdueSchedules();

  // Combine and filter schedules
  const displaySchedules = [...overdueSchedules, ...todaysSchedules]
    .filter((schedule) => showCompleted || schedule.status !== 'completed')
    .slice(0, maxItems);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (schedule: CleaningSchedule) => {
    if (schedule.status === 'completed') {
      return {
        path: mdiCheckCircle,
        color: '#10b981',
        className: 'text-green-500',
      };
    } else if (
      schedule.status === 'overdue' ||
      new Date(schedule.dueDate) < new Date()
    ) {
      return {
        path: mdiAlertCircle,
        color: '#ef4444',
        className: 'text-red-500',
      };
    } else {
      return {
        path: mdiProgressClock,
        color: '#f59e0b',
        className: 'text-yellow-500',
      };
    }
  };

  const getTypeLabel = (type: CleaningType) => {
    switch (type) {
      case 'setup_take_down':
        return 'Setup/Take Down';
      case 'per_patient':
        return 'Per Patient';
      case 'weekly':
        return 'Weekly';
      case 'public_spaces':
        return 'Public Spaces';
      case 'deep_clean':
        return 'Deep Clean';
      default:
        return type;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleComplete = async (scheduleId: string) => {
    try {
      await completeSchedule(scheduleId);
    } catch (error) {
      console.error('Failed to complete schedule:', error);
    }
  };

  const toggleExpanded = (scheduleId: string) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Cleaning Tasks
          </h3>
          <Icon path={mdiCalendar} size={1.2} color="#4ECDC4" />
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (displaySchedules.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Cleaning Tasks
          </h3>
          <Icon path={mdiCalendar} size={1.2} color="#4ECDC4" />
        </div>
        <div className="text-center py-8">
          <Icon
            path={mdiCheckCircle}
            size={2}
            color="#10b981"
            className="mx-auto mb-2"
          />
          <p className="text-gray-500">
            All cleaning tasks completed for today!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Today's Cleaning Tasks
        </h3>
        <div className="flex items-center gap-2">
          <Icon path={mdiCalendar} size={1.2} color="#4ECDC4" />
          <span className="text-sm text-gray-500">
            {displaySchedules.length} task
            {displaySchedules.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {displaySchedules.map((schedule) => {
          const statusIcon = getStatusIcon(schedule);
          const isOverdue =
            schedule.status === 'overdue' ||
            new Date(schedule.dueDate) < new Date();
          const isExpanded = expandedSchedule === schedule.id;

          return (
            <div
              key={schedule.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isOverdue
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      path={statusIcon.path}
                      size={1}
                      color={statusIcon.color}
                      className={statusIcon.className}
                    />
                    <h4 className="font-medium text-gray-900 truncate">
                      {schedule.name}
                    </h4>
                    {isOverdue && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Icon path={mdiClock} size={0.8} />
                      <span>{formatTime(schedule.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon path={mdiAccount} size={0.8} />
                      <span>{schedule.assignedTo}</span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(schedule.priority)}`}
                    >
                      {schedule.priority}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {getTypeLabel(schedule.type)} • {schedule.estimatedDuration}{' '}
                    min • {schedule.points} pts
                  </div>

                  {isExpanded && schedule.description && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {schedule.description}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {schedule.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(schedule.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpanded(schedule.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Icon
                      path={isExpanded ? 'M7 14l5-5 5 5' : 'M7 10l5 5 5-5'}
                      size={1}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displaySchedules.length >= maxItems && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View all cleaning tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default CleaningScheduleCard;
