import { create } from 'zustand';
import {
  CleaningMetrics,
  ScheduleSummary,
  TaskSummary,
} from '../pages/EnvironmentalClean/models';

type EnvironmentalCleanState = {
  metrics: CleaningMetrics;
  schedule: ScheduleSummary;
  tasks: TaskSummary;
  setMetrics: (metrics: CleaningMetrics) => void;
  setSchedule: (schedule: ScheduleSummary) => void;
  setTasks: (tasks: TaskSummary) => void;
};

export const useEnvironmentalCleanStore = create<EnvironmentalCleanState>(
  (set) => ({
    metrics: {
      totalRooms: 0,
      cleanRooms: 0,
      dirtyRooms: 0,
      inProgressRooms: 0,
      cleaningEfficiency: 0,
      averageCleaningTime: 0,
      lastUpdated: new Date().toISOString(),
    },
    schedule: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
    },
    tasks: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
    },
    setMetrics: (metrics) => set({ metrics }),
    setSchedule: (schedule) => set({ schedule }),
    setTasks: (tasks) => set({ tasks }),
  })
);
