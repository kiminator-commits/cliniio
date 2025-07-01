import React from 'react';
import clsx from 'clsx';
import Icon from '@mdi/react';
import { mdiClipboardText, mdiFilter } from '@mdi/js';
import { TasksList } from '@/components/TasksList';
import { HOME_UI_CONSTANTS } from '@/constants/homeUiConstants';

interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  completed: boolean;
}

type Props = {
  tasks: Task[];
  storeAvailablePoints: number;
  storeShowFilters: boolean;
  setStoreShowFilters: (val: boolean) => void;
  handleTaskComplete: (id: string) => void;
  handleRefresh: () => void;
};

export const OperationsTasksContainer = ({
  tasks,
  storeAvailablePoints,
  storeShowFilters,
  setStoreShowFilters,
  handleTaskComplete,
  handleRefresh,
}: Props) => {
  return (
    <div
      className={clsx(
        'bg-white min-w-[400px] flex flex-col',
        `rounded-${HOME_UI_CONSTANTS.BORDER.RADIUS}`,
        `shadow-${HOME_UI_CONSTANTS.SHADOW}`,
        `p-${HOME_UI_CONSTANTS.SPACING.PADDING}`,
        `border-l-${HOME_UI_CONSTANTS.BORDER.LEFT_WIDTH}`,
        `border-[${HOME_UI_CONSTANTS.COLORS.PRIMARY}]`,
        `border-opacity-${HOME_UI_CONSTANTS.COLORS.BORDER_OPACITY}`
      )}
    >
      <div className="flex items-center justify-between mb-6" style={{ marginTop: '12px' }}>
        <div className="flex items-center gap-2">
          <span className={`bg-${HOME_UI_CONSTANTS.COLORS.PRIMARY_BG} rounded-md p-1`}>
            <Icon path={mdiClipboardText} size={1} color={HOME_UI_CONSTANTS.COLORS.PRIMARY} />
          </span>
          <h2 className={`text-lg font-semibold text-[${HOME_UI_CONSTANTS.COLORS.TEXT_PRIMARY}]`}>
            Daily Operations Tasks
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-sm ${HOME_UI_CONSTANTS.COLORS.TEXT_SECONDARY} border border-gray-300 rounded-${HOME_UI_CONSTANTS.BORDER.RADIUS} hidden sm:inline-block`}
          >
            Available: {storeAvailablePoints} Points
          </span>
          <button
            onClick={() => setStoreShowFilters(!storeShowFilters)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center"
          >
            <Icon path={mdiFilter} size={0.8} />
            <span className="ml-1 text-sm hidden sm:inline-block">Filter</span>
          </button>
        </div>
      </div>
      {storeShowFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
              <option value="">Category</option>
              <option value="operations">Operations</option>
              <option value="maintenance">Maintenance</option>
              <option value="safety">Safety</option>
            </select>
            <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
              <option value="">Type</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
              <option value="">Due Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this_week">This Week</option>
            </select>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <TasksList
          tasks={tasks}
          onTaskComplete={handleTaskComplete}
          onRefresh={handleRefresh}
          showFilters={storeShowFilters}
        />
      </div>
    </div>
  );
};
