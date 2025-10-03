// Re-export common types and utilities
export type { Json, Tables, Inserts, Updates } from './common';
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
import { Database as CommonDatabase } from './common';
import { InventoryTables } from './inventory';
import { SterilizationTables } from './sterilization';
import { EnvironmentalCleanTables } from './environmentalClean';
import {
  KnowledgeHubTables,
  KnowledgeHubViews,
  KnowledgeHubFunctions,
} from './knowledgeHub';

// Combine all tables into the main Database interface
export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
    CompositeTypes: {
      [key: string]: Record<string, any>;
    };
  };
}
