// Configuration exports
export type { AdminTaskConfig } from '../aiDailyTaskConfig';
export {
  DEFAULT_ADMIN_TASK_CONFIG,
  PRIORITY_ORDER,
  ROLE_CATEGORY_MAPPING,
  validateAdminTaskConfig,
  getPriorityScore,
  isRoleCompatibleWithCategory,
  getDefaultConfig,
} from '../aiDailyTaskConfig';

// Progress exports
export type {
  OperationalGap,
  DailyTaskAssignment,
} from '../aiDailyTaskProgress';
export {
  generateGapId,
  generateTaskId,
  generateAITaskId,
  createDailyTasks,
  getUserDailyTasks,
  getFacilityDailyTasks,
  completeDailyTask,
} from '../aiDailyTaskProgress';

// Executor exports
export {
  scanOperationalGaps,
  getFacilityUsers,
  getAdminTaskConfig,
  assignTasksWithAI,
} from '../aiDailyTaskExecutor';
