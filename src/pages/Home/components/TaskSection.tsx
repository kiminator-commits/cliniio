import React from 'react';
import TaskSection from '../../../components/TaskSection';
import { Task } from '../../../store/homeStore';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useHomeTaskSection } from '../hooks/useHomeTaskSection';

export default function HomeTaskSection() {
  const {
    tasks,
    loading,
    taskError,
    selectedCategory,
    selectedType,
    storeAvailablePoints,
    storeShowFilters,
    handleCategoryChange,
    handleTypeChange,
    handleTaskCompleteWithErrorHandling,
    handleTaskUpdate,
    toggleFilters,
  } = useHomeTaskSection();

  return (
    <>
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="text-sm text-gray-500 mb-2"
        >
          Loading daily tasks...
        </div>
      )}
      {taskError && (
        <ErrorMessage message="Some tasks may not be available due to a loading error." />
      )}
      <TaskSection
        tasks={tasks as Task[]}
        onTaskComplete={handleTaskCompleteWithErrorHandling}
        onTaskUpdate={handleTaskUpdate}
        availablePoints={storeAvailablePoints}
        showFilters={storeShowFilters}
        onToggleFilters={toggleFilters}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        onCategoryChange={handleCategoryChange}
        onTypeChange={handleTypeChange}
      />
    </>
  );
}
