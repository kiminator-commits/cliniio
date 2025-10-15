// Re-export common types and utilities
export type { Tables, Inserts, Updates } from './common';
export type {
  User,
  AuditLog,
  UserInsert,
  AuditLogInsert,
  UserUpdate,
  AuditLogUpdate,
} from './common';

// Re-export inventory types
export type {
  InventoryItem,
  InventoryItemInsert,
  InventoryItemUpdate,
} from './inventory';

// Re-export sterilization types
export type {
  SterilizationCycle,
  SterilizationCycleInsert,
  SterilizationCycleUpdate,
} from './sterilization';

// Re-export environmental clean types
export type {
  EnvironmentalClean,
  EnvironmentalCleanInsert,
  EnvironmentalCleanUpdate,
} from './environmentalClean';

// Re-export knowledge hub types
export type {
  KnowledgeHubCourse,
  KnowledgeHubUserProgress,
  KnowledgeHubAssignment,
  KnowledgeHubAchievement,
  KnowledgeHubUserAchievement,
  KnowledgeHubLearningPath,
  KnowledgeHubCertificate,
  KnowledgeHubContent,
  KnowledgeHubCourseInsert,
  KnowledgeHubUserProgressInsert,
  KnowledgeHubAssignmentInsert,
  KnowledgeHubAchievementInsert,
  KnowledgeHubUserAchievementInsert,
  KnowledgeHubLearningPathInsert,
  KnowledgeHubCertificateInsert,
  KnowledgeHubContentInsert,
  KnowledgeHubCourseUpdate,
  KnowledgeHubUserProgressUpdate,
  KnowledgeHubAssignmentUpdate,
  KnowledgeHubAchievementUpdate,
  KnowledgeHubUserAchievementUpdate,
  KnowledgeHubLearningPathUpdate,
  KnowledgeHubCertificateUpdate,
  KnowledgeHubContentUpdate,
} from './knowledgeHub';

// Import table definitions from each module
import { Database as _CommonDatabase } from './common';
import { InventoryTables as _InventoryTables } from './inventory';
import { SterilizationTables as _SterilizationTables } from './sterilization';
import { EnvironmentalCleanTables as _EnvironmentalCleanTables } from './environmentalClean';
import {
  KnowledgeHubTables as _KnowledgeHubTables,
  KnowledgeHubViews as _KnowledgeHubViews,
  KnowledgeHubFunctions as _KnowledgeHubFunctions,
} from './knowledgeHub';

// Re-export the proper generated Database type
export type { Database, Json } from './generated';
