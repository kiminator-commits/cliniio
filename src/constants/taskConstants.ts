export const TASK_POINTS = {
  MIN: 0,
  MAX: 100,
} as const;

export const TASK_DEFAULTS = {
  AVAILABLE_POINTS: 250,
  TASKS_PER_PAGE: 3,
  DEFAULT_RANK: 100,
  DEFAULT_LEVEL: 1,
  DEFAULT_STREAK: 0,
  DEFAULT_SCORE: 0,
} as const;

export const TASK_LEADERBOARD = {
  TEAM_MEMBER_1_SCORE: 850,
  TEAM_MEMBER_2_SCORE: 720,
} as const;

export const TASK_VALIDATION = {
  UUID_REGEX:
    /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

export const TASK_CATEGORIES = {
  GENERAL: 'General',
  TASK: 'Task',
} as const;

export const TASK_STATUS = {
  COMPLETED: 'completed',
} as const;
