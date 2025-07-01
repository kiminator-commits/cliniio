export type CleaningMetrics = {
  totalRooms: number;
  roomsCleaned: number;
  roomsPending: number;
};

export type ScheduleSummary = {
  totalScheduled: number;
  completed: number;
  remaining: number;
};

export type TaskSummary = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
};
