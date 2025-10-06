export interface AdminTaskConfig {
  maxTasksPerUser: number;
  enabledCategories: string[];
  priorityThresholds: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  priorityWeights?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  rolePreferences?: Record<string, string[]>;
  timeConstraints?: {
    maxTaskDuration?: number;
    minTaskDuration?: number;
  };
  autoAssignment: boolean;
  aiSensitivity: 'low' | 'medium' | 'high';
  aiEnabled?: boolean;
}

export const DEFAULT_ADMIN_TASK_CONFIG: AdminTaskConfig = {
  maxTasksPerUser: 3,
  enabledCategories: ['equipment', 'compliance', 'operational', 'safety'],
  priorityThresholds: {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  },
  priorityWeights: {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  },
  rolePreferences: {
    technician: ['equipment', 'compliance'],
    operator: ['operational', 'compliance'],
    cleaning_staff: ['compliance'],
    inventory_manager: ['operational'],
    supervisor: ['safety', 'operational'],
  },
  timeConstraints: {
    maxTaskDuration: 120,
    minTaskDuration: 5,
  },
  autoAssignment: true,
  aiSensitivity: 'medium',
  aiEnabled: true,
};

export const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export const ROLE_CATEGORY_MAPPING = {
  equipment: ['technician', 'maintenance'],
  compliance: ['supervisor', 'manager', 'operator'],
  operational: ['operator', 'inventory_manager'],
  safety: ['supervisor', 'manager'],
} as const;

export function validateAdminTaskConfig(
  config: Partial<AdminTaskConfig>
): AdminTaskConfig {
  return {
    maxTasksPerUser:
      config.maxTasksPerUser ?? DEFAULT_ADMIN_TASK_CONFIG.maxTasksPerUser,
    enabledCategories:
      config.enabledCategories ?? DEFAULT_ADMIN_TASK_CONFIG.enabledCategories,
    priorityThresholds: {
      low:
        config.priorityThresholds?.low ??
        DEFAULT_ADMIN_TASK_CONFIG.priorityThresholds.low,
      medium:
        config.priorityThresholds?.medium ??
        DEFAULT_ADMIN_TASK_CONFIG.priorityThresholds.medium,
      high:
        config.priorityThresholds?.high ??
        DEFAULT_ADMIN_TASK_CONFIG.priorityThresholds.high,
      urgent:
        config.priorityThresholds?.urgent ??
        DEFAULT_ADMIN_TASK_CONFIG.priorityThresholds.urgent,
    },
    priorityWeights:
      config.priorityWeights ?? DEFAULT_ADMIN_TASK_CONFIG.priorityWeights,
    rolePreferences:
      config.rolePreferences ?? DEFAULT_ADMIN_TASK_CONFIG.rolePreferences,
    timeConstraints:
      config.timeConstraints ?? DEFAULT_ADMIN_TASK_CONFIG.timeConstraints,
    autoAssignment:
      config.autoAssignment ?? DEFAULT_ADMIN_TASK_CONFIG.autoAssignment,
    aiSensitivity:
      config.aiSensitivity ?? DEFAULT_ADMIN_TASK_CONFIG.aiSensitivity,
    aiEnabled: config.aiEnabled ?? DEFAULT_ADMIN_TASK_CONFIG.aiEnabled,
  };
}

export function getPriorityScore(
  priority: keyof typeof PRIORITY_ORDER
): number {
  return PRIORITY_ORDER[priority];
}

export function isRoleCompatibleWithCategory(
  userRole: string,
  taskCategory: string
): boolean {
  const compatibleRoles =
    ROLE_CATEGORY_MAPPING[taskCategory as keyof typeof ROLE_CATEGORY_MAPPING];
  return compatibleRoles
    ? (compatibleRoles as readonly string[]).includes(userRole)
    : true;
}

export function getDefaultConfig(): AdminTaskConfig {
  return { ...DEFAULT_ADMIN_TASK_CONFIG };
}
