import { useState, useEffect, useCallback } from 'react';
import { cleaningScheduleService } from '../services/cleaningScheduleService';
import {
  CleaningSchedule,
  CleaningType,
  CleaningScheduleFilters,
} from '../types/cleaningSchedule';
import { useHomeStore } from '../store/homeStore';

interface UseCleaningScheduleOptions {
  autoGenerate?: boolean;
  includeInHomeTasks?: boolean;
  filters?: CleaningScheduleFilters;
}

export const useCleaningSchedule = (
  options: UseCleaningScheduleOptions = {}
) => {
  const {
    autoGenerate = true,
    includeInHomeTasks = true,
    filters = {},
  } = options;

  const [schedules, setSchedules] = useState<CleaningSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    completedToday: number;
    totalSchedules: number;
    pendingSchedules: number;
    overdueSchedules: number;
  } | null>(null);

  const setTasks = useHomeStore((state) => state.setTasks);
  const updateGamificationData = useHomeStore(
    (state) => state.updateGamificationData
  );

  // Integrate cleaning schedules with home tasks
  const integrateWithHomeTasks = useCallback(
    async (cleaningSchedules: CleaningSchedule[]) => {
      try {
        // Convert cleaning schedules to tasks
        const cleaningTasks = await Promise.all(
          cleaningSchedules.map((schedule) =>
            cleaningScheduleService.convertScheduleToTask(schedule)
          )
        );

        // Get existing tasks from home store
        const existingTasks = useHomeStore.getState().tasks;

        // Filter out existing cleaning tasks to avoid duplicates
        const nonCleaningTasks = existingTasks.filter(
          (task) => task.category !== 'Environmental Cleaning'
        );

        // Combine existing tasks with new cleaning tasks
        const allTasks = [...nonCleaningTasks, ...cleaningTasks];

        // Update home store
        setTasks(allTasks);

        // Update gamification data with cleaning stats
        if (stats) {
          const currentStats = useHomeStore.getState().gamificationData.stats;
          if (currentStats) {
            updateGamificationData({
              stats: {
                ...currentStats,
                cleaningTasksCompleted: stats.completedToday,
                totalCleaningTasks: stats.totalSchedules,
              },
            });
          }
        }
      } catch (err) {
        console.error(
          'Failed to integrate cleaning schedules with home tasks:',
          err
        );
      }
    },
    [setTasks, updateGamificationData, stats]
  );

  // Load cleaning schedules
  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate daily schedules if auto-generate is enabled
      if (autoGenerate) {
        await cleaningScheduleService.generateDailySchedules();
      }

      // Fetch schedules with filters
      const fetchedSchedules =
        await cleaningScheduleService.getSchedules(filters);
      setSchedules(fetchedSchedules);

      // Get statistics
      const cleaningStats = await cleaningScheduleService.getCleaningStats();
      setStats(cleaningStats);

      // Integrate with home tasks if enabled
      if (includeInHomeTasks) {
        await integrateWithHomeTasks(fetchedSchedules);
      }
    } catch (err) {
      console.error('Failed to load cleaning schedules:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load cleaning schedules'
      );
    } finally {
      setLoading(false);
    }
  }, [autoGenerate, includeInHomeTasks, filters, integrateWithHomeTasks]);

  // Complete a cleaning schedule
  const completeSchedule = useCallback(
    async (scheduleId: string, notes?: string) => {
      try {
        const updatedSchedule = await cleaningScheduleService.updateSchedule(
          scheduleId,
          {
            status: 'completed',
            completedDate: new Date().toISOString(),
            notes: notes || 'Completed via home dashboard',
          }
        );

        // Update local state
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === scheduleId ? updatedSchedule : schedule
          )
        );

        // Refresh home tasks
        if (includeInHomeTasks) {
          await loadSchedules();
        }

        return updatedSchedule;
      } catch (err) {
        console.error('Failed to complete schedule:', err);
        throw err;
      }
    },
    [includeInHomeTasks, loadSchedules]
  );

  // Create a new cleaning schedule
  const createSchedule = useCallback(
    async (
      scheduleData: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      try {
        const newSchedule =
          await cleaningScheduleService.createSchedule(scheduleData);

        setSchedules((prev) => [...prev, newSchedule]);

        // Refresh home tasks if integrated
        if (includeInHomeTasks) {
          await loadSchedules();
        }

        return newSchedule;
      } catch (err) {
        console.error('Failed to create schedule:', err);
        throw err;
      }
    },
    [includeInHomeTasks, loadSchedules]
  );

  // Update a cleaning schedule
  const updateSchedule = useCallback(
    async (scheduleId: string, updates: Partial<CleaningSchedule>) => {
      try {
        const updatedSchedule = await cleaningScheduleService.updateSchedule(
          scheduleId,
          updates
        );

        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === scheduleId ? updatedSchedule : schedule
          )
        );

        // Refresh home tasks if integrated
        if (includeInHomeTasks) {
          await loadSchedules();
        }

        return updatedSchedule;
      } catch (err) {
        console.error('Failed to update schedule:', err);
        throw err;
      }
    },
    [includeInHomeTasks, loadSchedules]
  );

  // Get schedules by type
  const getSchedulesByType = useCallback(
    (type: CleaningType) => {
      return schedules.filter((schedule) => schedule.type === type);
    },
    [schedules]
  );

  // Get today's schedules
  const getTodaysSchedules = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter((schedule) => schedule.dueDate.startsWith(today));
  }, [schedules]);

  // Get overdue schedules
  const getOverdueSchedules = useCallback(() => {
    const now = new Date();
    return schedules.filter(
      (schedule) =>
        schedule.status === 'pending' && new Date(schedule.dueDate) < now
    );
  }, [schedules]);

  // Get schedules by priority
  const getSchedulesByPriority = useCallback(
    (priority: string) => {
      return schedules.filter((schedule) => schedule.priority === priority);
    },
    [schedules]
  );

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!loading) {
          loadSchedules();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [loadSchedules, loading]);

  return {
    // State
    schedules,
    loading,
    error,
    stats,

    // Actions
    loadSchedules,
    completeSchedule,
    createSchedule,
    updateSchedule,

    // Filters
    getSchedulesByType,
    getTodaysSchedules,
    getOverdueSchedules,
    getSchedulesByPriority,

    // Utilities
    refresh: loadSchedules,
  };
};

// Specialized hook for home dashboard integration
export const useHomeCleaningSchedule = () => {
  return useCleaningSchedule({
    autoGenerate: true,
    includeInHomeTasks: true,
    filters: {
      status: 'pending',
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
  });
};

// Hook for environmental clean page
export const useEnvironmentalCleanSchedule = () => {
  return useCleaningSchedule({
    autoGenerate: false, // Don't auto-generate on this page
    includeInHomeTasks: false, // Don't integrate with home tasks
  });
};
