import { create } from 'zustand';
import { CleaningMetrics, ScheduleSummary, TaskSummary } from '../types/EnvironmentalCleaningTypes';

type EnvironmentalCleaningState = {
  metrics: CleaningMetrics;
  schedule: ScheduleSummary;
  tasks: TaskSummary;
  setMetrics: (metrics: CleaningMetrics) => void;
  setSchedule: (schedule: ScheduleSummary) => void;
  setTasks: (tasks: TaskSummary) => void;
};

export const useEnvironmentalCleaningStore = create<EnvironmentalCleaningState>(set => ({
  metrics: { totalRooms: 0, roomsCleaned: 0, roomsPending: 0 },
  schedule: { totalScheduled: 0, completed: 0, remaining: 0 },
  tasks: { totalTasks: 0, completedTasks: 0, pendingTasks: 0 },
  setMetrics: metrics => set({ metrics }),
  setSchedule: schedule => set({ schedule }),
  setTasks: tasks => set({ tasks }),
}));
