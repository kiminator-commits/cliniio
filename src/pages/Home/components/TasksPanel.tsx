import React from 'react';
import clsx from 'clsx';
import { mdiClipboardText, mdiFilter } from '@mdi/js';
import Icon from '@mdi/react';
import TasksList from '@/components/TasksList';
import { HOME_UI_CONSTANTS } from '../../../constants/homeUiConstants';
import { MIN_PANEL_WIDTH, MARGIN_TOP_12PX } from '../../../constants/layoutConstants';

interface TasksPanelProps {
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
  }[];
  storeAvailablePoints: number;
  storeShowFilters: boolean;
  setStoreShowFilters: (show: boolean) => void;
  handleTaskComplete: (taskId: string) => void;
  handleRefresh: () => void;
}

export function TasksPanel({
  tasks,
  storeAvailablePoints,
  storeShowFilters,
  setStoreShowFilters,
  handleTaskComplete,
  handleRefresh,
}: TasksPanelProps) {
  return (
    <div
      className={clsx(
        'bg-white flex flex-col',
        MIN_PANEL_WIDTH,
        `rounded-${HOME_UI_CONSTANTS.BORDER.RADIUS}`,
        `shadow-${HOME_UI_CONSTANTS.SHADOW}`,
        `p-${HOME_UI_CONSTANTS.SPACING.PADDING}`,
        `border-l-${HOME_UI_CONSTANTS.BORDER.LEFT_WIDTH}`,
        `border-[${HOME_UI_CONSTANTS.COLORS.PRIMARY}]`,
        `border-opacity-${HOME_UI_CONSTANTS.COLORS.BORDER_OPACITY}`
      )}
    >
      <div
        className="flex items-center justify-between mb-6"
        style={{ marginTop: MARGIN_TOP_12PX }}
      >
        <div className="flex items-center gap-2">
          <span className={`bg-${HOME_UI_CONSTANTS.COLORS.PRIMARY_BG} rounded-md p-1`}>
            <Icon path={mdiClipboardText} size={1} color={HOME_UI_CONSTANTS.COLORS.PRIMARY} />
          </span>
          <h2 className="text-lg font-semibold text-gray-600">Daily Operations Tasks</h2>
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
}
