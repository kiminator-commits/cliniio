import { useState, useCallback } from 'react';
import { useHomeStore, Task } from '../../../store/homeStore';
import { isValidTaskInput } from '../../../utils/validateTask';
import { handleTaskCompletion } from '../../../utils/handleTaskCompletion';
import { logger } from '../../../utils/logger';
import { TASK_POINTS, TASK_VALIDATION } from '../../../constants/taskConstants';

export const useHomeTaskSection = () => {
  const storeAvailablePoints = useHomeStore((state) => state.availablePoints);
  const storeShowFilters = useHomeStore((state) => state.showFilters);
  const setStoreShowFilters = useHomeStore((state) => state.setShowFilters);
  const updateGamificationData = useHomeStore(
    (state) => state.updateGamificationData
  );
  const tasks = useHomeStore((state) => state.tasks);
  const setTasks = useHomeStore((state) => state.setTasks);
  const loading = false; // Since we're not using the useTasks hook anymore

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
  }, []);

  // Validate task input
  const validateTaskInput = useCallback((taskId: string, points?: number) => {
    if (
      !taskId ||
      typeof taskId !== 'string' ||
      !TASK_VALIDATION.UUID_REGEX.test(taskId)
    ) {
      logger.warn('Invalid task ID:', taskId);
      return false;
    }

    if (!isValidTaskInput(taskId, points)) {
      logger.warn('Invalid task input provided to handleTaskComplete');
      return false;
    }

    return true;
  }, []);

  // Update task completion status
  const updateTaskCompletion = useCallback(
    (taskId: string, points?: number) => {
      // Update total score if points are provided
      if (
        typeof points === 'number' &&
        points > TASK_POINTS.MIN &&
        points <= TASK_POINTS.MAX
      ) {
        updateGamificationData({ totalScore: points });
      }
    },
    [updateGamificationData]
  );

  const handleTaskCompleteWithErrorHandling = useCallback(
    async (taskId: string, points?: number) => {
      handleTaskCompletion(taskId);

      if (!validateTaskInput(taskId, points)) {
        return;
      }

      try {
        updateTaskCompletion(taskId, points);
      } catch (err) {
        setTaskError('Failed to complete task. Please try again.');
        logger.error(err);
      }
    },
    [validateTaskInput, updateTaskCompletion, setTaskError]
  );

  const handleTaskUpdate = useCallback(
    async (taskId: string) => {
      try {
        // Update local state
        const updatedTasks = tasks.map((task: Task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
      } catch (err) {
        console.error(err);
        setTaskError('Failed to update task. Please try again.');
      }
    },
    [tasks, setTasks]
  );

  const toggleFilters = useCallback(() => {
    setStoreShowFilters(!storeShowFilters);
  }, [storeShowFilters, setStoreShowFilters]);

  return {
    // State
    tasks,
    loading,
    taskError,
    selectedCategory,
    selectedType,
    storeAvailablePoints,
    storeShowFilters,

    // Actions
    handleCategoryChange,
    handleTypeChange,
    handleTaskCompleteWithErrorHandling,
    handleTaskUpdate,
    toggleFilters,
  };
};
