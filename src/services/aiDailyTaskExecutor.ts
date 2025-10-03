import {
  OperationalGap,
  DailyTaskAssignment,
} from './aiDailyTaskProgress';
import {
  AdminTaskConfig,
} from './aiDailyTaskConfig';
import { AIGapScannerProvider } from './ai/providers/AIGapScannerProvider';
import { AITaskAssignmentProvider } from './ai/providers/AITaskAssignmentProvider';
import { AIUserManagementProvider, FacilityUser } from './ai/providers/AIUserManagementProvider';
import { AIConfigProvider } from './ai/providers/AIConfigProvider';

// Re-export interfaces for backward compatibility
export type { OperationalGap, DailyTaskAssignment, AdminTaskConfig };

// Provider instances
const gapScannerProvider = new AIGapScannerProvider();
const taskAssignmentProvider = new AITaskAssignmentProvider();
const userManagementProvider = new AIUserManagementProvider();
const configProvider = new AIConfigProvider();

/**
 * Scan the entire facility for operational gaps
 */
export async function scanOperationalGaps(
  facilityId: string
): Promise<OperationalGap[]> {
  return gapScannerProvider.scanOperationalGaps(facilityId);
}

/**
 * Get facility users and their roles
 */
export async function getFacilityUsers(
  facilityId: string
): Promise<FacilityUser[]> {
  return userManagementProvider.getFacilityUsers(facilityId);
}

/**
 * Get admin task configuration
 */
export async function getAdminTaskConfig(
  facilityId?: string
): Promise<AdminTaskConfig> {
  return configProvider.getAdminTaskConfig(facilityId);
}

/**
 * Use AI to prioritize and assign tasks
 */
export async function assignTasksWithAI(
  gaps: OperationalGap[],
  users: Array<{ id: string; role: string; [key: string]: unknown }>,
  config: AdminTaskConfig
): Promise<DailyTaskAssignment[]> {
  return taskAssignmentProvider.assignTasksWithAI(gaps, users, config);
}

