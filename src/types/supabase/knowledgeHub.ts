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

// Table types are imported from their respective modules above

// Knowledge Hub table definitions
export interface KnowledgeHubTables {
  knowledge_hub_courses: any;
  knowledge_hub_user_progress: any;
  knowledge_hub_assignments: any;
  knowledge_hub_achievements: any;
  knowledge_hub_user_achievements: any;
  knowledge_hub_learning_paths: any;
  knowledge_hub_certificates: any;
  knowledge_hub_content: any;
}

// Knowledge Hub views
