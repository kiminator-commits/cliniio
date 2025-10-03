import React from 'react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import TaskSection from '../../../components/TaskSection';
import TaskLoadingStates from './TaskLoadingStates';
import { Task } from '../../../store/homeStore';

interface HomeTasksSectionProps {
  tasks: Task[] | undefined;
  loading: boolean;
  taskError: string | null;
  storeAvailablePoints: number;
  storeShowFilters: boolean;
  setStoreShowFilters: (show: boolean) => void;
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onTaskToggle: (taskId: string, points?: number) => void;
  onTaskUpdate: (taskId: string, updatedTask: Task) => void;
}

const HomeTasksSection: React.FC<HomeTasksSectionProps> = React.memo(
  ({
    tasks,
    loading,
    taskError,
    storeAvailablePoints,
    storeShowFilters,
    setStoreShowFilters,
    selectedCategory,
    selectedType,
    onCategoryChange,
    onTypeChange,
    onTaskToggle,
    onTaskUpdate,
  }) => {
    return (
      <div className="h-full flex flex-col">
        <TaskLoadingStates
          loading={loading}
          tasks={tasks}
          taskError={taskError}
        />

        <ErrorBoundary>
          <div className="flex-1">
            <TaskSection
              tasks={tasks}
              onTaskComplete={onTaskToggle}
              onTaskUpdate={onTaskUpdate}
              availablePoints={storeAvailablePoints}
              showFilters={storeShowFilters}
              onToggleFilters={() => setStoreShowFilters(!storeShowFilters)}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              onCategoryChange={onCategoryChange}
              onTypeChange={onTypeChange}
            />
          </div>
        </ErrorBoundary>
      </div>
    );
  }
);

HomeTasksSection.displayName = 'HomeTasksSection';

export default HomeTasksSection;
