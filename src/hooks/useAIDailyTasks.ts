import { useState, useEffect, useCallback } from 'react';
import { aiDailyTaskService } from '../services/aiDailyTaskService';
import { useHomeStore } from '../store/homeStore';
import { Task } from '../store/homeStore';

export const useAIDailyTasks = (userId: string) => {
  const [dailyTasks, setDailyTasks] = useState<
    Array<{ id: string; [key: string]: unknown }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setTasks, tasks: existingTasks } = useHomeStore();

  // Fetch user's daily tasks
  const fetchDailyTasks = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userTasks = await aiDailyTaskService.getUserDailyTasks(userId);
      setDailyTasks(userTasks);

      // Merge with existing tasks if needed
      if (userTasks.length > 0) {
        const mergedTasks = [...existingTasks, ...userTasks];
        setTasks(mergedTasks as Task[]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch daily tasks'
      );
      console.error('Error fetching daily tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, existingTasks, setTasks]);

  // Complete a daily task
  const completeDailyTask = useCallback(
    async (taskId: string) => {
      try {
        await aiDailyTaskService.completeDailyTask(taskId, userId);

        // Update local state
        setDailyTasks((prev) => prev.filter((task) => task.id !== taskId));

        // Update store
        const updatedTasks = existingTasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to complete task'
        );
        return false;
      }
    },
    [userId, existingTasks, setTasks]
  );

  // Refresh daily tasks
  const refreshDailyTasks = useCallback(() => {
    fetchDailyTasks();
  }, [fetchDailyTasks]);

  // Load daily tasks on mount
  useEffect(() => {
    fetchDailyTasks();
  }, [fetchDailyTasks]);

  return {
    dailyTasks,
    loading,
    error,
    completeDailyTask,
    refreshDailyTasks,
    hasDailyTasks: dailyTasks.length > 0,
  };
};
