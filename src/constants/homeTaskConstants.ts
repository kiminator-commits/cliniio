export const TASK_STATUSES = {
  COMPLETE: 'Complete',
  IN_PROGRESS: 'In Progress',
  NOT_STARTED: 'Not Started',
} as const;

export const TASK_POINT_TIERS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
} as const;

export const ESTIMATED_TIME = {
  SHORT: '5-15 min',
  MEDIUM: '15-30 min',
  LONG: '30-60 min',
} as const;
