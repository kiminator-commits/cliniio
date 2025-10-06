// Knowledge Hub Types
// This file provides comprehensive type definitions for the Knowledge Hub module

// Re-export all types from modules
export type {
  KnowledgeHubCourse,
  KnowledgeHubCourseInsert,
  KnowledgeHubCourseUpdate,
  KnowledgeHubCourseTable,
} from './knowledgeHub/courseTypes';

export type {
  KnowledgeHubUserProgress,
  KnowledgeHubUserProgressInsert,
  KnowledgeHubUserProgressUpdate,
  KnowledgeHubUserProgressTable,
  KnowledgeHubAssignment,
  KnowledgeHubAssignmentInsert,
  KnowledgeHubAssignmentUpdate,
  KnowledgeHubAssignmentsTable,
} from './knowledgeHub/progressTypes';

export type {
  KnowledgeHubAchievement,
  KnowledgeHubAchievementInsert,
  KnowledgeHubAchievementUpdate,
  KnowledgeHubAchievementsTable,
  KnowledgeHubUserAchievement,
  KnowledgeHubUserAchievementInsert,
  KnowledgeHubUserAchievementUpdate,
  KnowledgeHubUserAchievementsTable,
} from './knowledgeHub/achievementTypes';

export type {
  KnowledgeHubLearningPath,
  KnowledgeHubLearningPathInsert,
  KnowledgeHubLearningPathUpdate,
  KnowledgeHubLearningPathsTable,
  KnowledgeHubCertificate,
  KnowledgeHubCertificateInsert,
  KnowledgeHubCertificateUpdate,
  KnowledgeHubCertificatesTable,
} from './knowledgeHub/learningTypes';

export type {
  KnowledgeHubContent,
  KnowledgeHubContentInsert,
  KnowledgeHubContentUpdate,
  KnowledgeHubContentTable,
} from './knowledgeHub/contentTypes';

export type {
  KnowledgeHubViews,
  KnowledgeHubFunctions,
} from './knowledgeHub/viewsAndFunctions';

// Knowledge Hub table definitions
export interface KnowledgeHubTables {
  knowledge_hub_courses: KnowledgeHubCourseTable;
  knowledge_hub_user_progress: KnowledgeHubUserProgressTable;
  knowledge_hub_assignments: KnowledgeHubAssignmentsTable;
  knowledge_hub_achievements: KnowledgeHubAchievementsTable;
  knowledge_hub_user_achievements: KnowledgeHubUserAchievementsTable;
  knowledge_hub_learning_paths: KnowledgeHubLearningPathsTable;
  knowledge_hub_certificates: KnowledgeHubCertificatesTable;
  knowledge_hub_content: KnowledgeHubContentTable;
}

// Knowledge Hub views
