import React, { memo, useMemo } from 'react';
import { mdiClipboardText, mdiFilter } from '@mdi/js';
import Icon from '@mdi/react';
import { HOME_SECTION_TITLES } from '../pages/Home/constants/homeConstants';
import { HOME_UI_CONSTANTS } from '../constants/homeUiConstants';
import { getTaskCardClass } from '../utils/homeUtils';
import { TasksList } from './TasksList';
import VirtualizedTasksList from './VirtualizedTasksList';
import FilterSection from '@/components/FilterSection';
import { Task } from '../store/homeStore';
import { filterTasksByCategoryAndType } from '../utils/homeContentUtils';

interface TaskSectionProps {
  tasks: Task[] | undefined;
  onTaskComplete: (taskId: string, points?: number) => void;
  onTaskUpdate?: (taskId: string, updatedTask: Task) => void;
  availablePoints: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  isLoading?: boolean;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  tasks,
  onTaskComplete,
  onTaskUpdate,
  availablePoints,
  showFilters,
  onToggleFilters,
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
  isLoading = false,
}) => {
  // Filter tasks based on selected category and type
  const filteredTasks = useMemo(() => {
    if (!tasks) return undefined;
    return filterTasksByCategoryAndType(tasks, selectedCategory, selectedType);
  }, [tasks, selectedCategory, selectedType]);

  // Determine if we should use virtualization based on task count
  const shouldUseVirtualization = useMemo(() => {
    return filteredTasks && filteredTasks.length > 50; // Use virtualization for 50+ tasks
  }, [filteredTasks]);

  if (isLoading) {
    return (
      <div className={`${getTaskCardClass()} h-full`} data-testid="tasks-list">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tasks) {
    return (
      <div className={`${getTaskCardClass()} h-full`} data-testid="tasks-list">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-center">
            <div className="text-lg font-medium mb-2">No tasks available</div>
            <div className="text-sm">
              Tasks will appear here when they become available.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getTaskCardClass()} h-full`} data-testid="tasks-list">
      <div
        className="flex items-center justify-between mb-6"
        style={{ marginTop: '-8px' }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`bg-${HOME_UI_CONSTANTS.COLORS.PRIMARY_BG} rounded-md p-1`}
          >
            <Icon
              path={mdiClipboardText}
              size={1}
              color={HOME_UI_CONSTANTS.COLORS.PRIMARY}
            />
          </span>
          <h2 className="text-lg font-semibold text-gray-600">
            {HOME_SECTION_TITLES.TASKS}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-2 text-sm font-semibold bg-[#4ECDC4] bg-opacity-10 text-[#4ECDC4] border border-[#4ECDC4] border-opacity-30 rounded-lg`}
          >
            📊 Total Available: {availablePoints} Points
          </span>
          <button
            onClick={onToggleFilters}
            className="p-2 bg-[#4ECDC4] hover:bg-[#38b2ac] rounded-lg text-white flex items-center transition-colors duration-200"
          >
            <Icon path={mdiFilter} size={0.8} />
            <span className="ml-1 text-sm hidden sm:inline-block">Filter</span>
          </button>
        </div>
      </div>
      {showFilters && (
        <FilterSection
          selectedCategory={selectedCategory}
          selectedType={selectedType}
          onCategoryChange={onCategoryChange}
          onTypeChange={onTypeChange}
        />
      )}
      <div className="flex-1 min-h-0 overflow-y-auto h-full">
        {shouldUseVirtualization ? (
          <VirtualizedTasksList
            tasks={filteredTasks}
            onTaskComplete={onTaskComplete}
            onTaskUpdate={onTaskUpdate}
            itemHeight={120}
            containerHeight={600}
          />
        ) : (
          <TasksList
            tasks={filteredTasks}
            onTaskComplete={onTaskComplete}
            onTaskUpdate={onTaskUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default memo(TaskSection);
