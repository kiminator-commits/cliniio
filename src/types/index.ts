// Centralized type exports
// This file provides a single entry point for all strengthened type declarations

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================
export * from './performanceTypes';

// ============================================================================
// ANALYTICS TYPES
// ============================================================================
export * from './analyticsTypes';

// ============================================================================
// SUPABASE TABLE TYPES
// ============================================================================
export * from './supabaseTableTypes';

// ============================================================================
// SUPABASE MOCK TYPES
// ============================================================================
export * from './supabaseMockTypes';

// ============================================================================
// EXISTING TYPES
// ============================================================================
export * from './inventory';
export * from './inventoryTypes';

// Explicit re-exports to resolve naming conflicts
export type {
  User as SupabaseUser,
  InventoryItem as SupabaseInventoryItem,
  EnvironmentalCleanInsert as SupabaseEnvironmentalCleanInsert,
  EnvironmentalCleanUpdate as SupabaseEnvironmentalCleanUpdate,
  InventoryItemInsert as SupabaseInventoryItemInsert,
  InventoryItemUpdate as SupabaseInventoryItemUpdate,
} from './supabase';

// Re-export remaining types from supabase without conflicts
export type {
  Json,
  Tables,
  AuditLog,
  UserInsert,
  AuditLogInsert,
  UserUpdate,
  AuditLogUpdate,
  SterilizationCycle,
  SterilizationCycleInsert,
  SterilizationCycleUpdate,
  EnvironmentalClean,
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
  Database,
} from './supabase';

// ============================================================================
// GLOBAL TYPES
// ============================================================================
export * from './global';
