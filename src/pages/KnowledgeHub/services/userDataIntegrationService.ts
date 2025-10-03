// This file is now a re-export of the modular User Data Integration services
// The original 773-line file has been refactored into smaller, focused modules
// All existing imports will continue to work without any changes

// Re-export everything from the modular structure
export * from './userData';

// Maintain backward compatibility - this file can be imported exactly as before
// The modular structure is now:
// - src/pages/KnowledgeHub/services/userData/types.ts (shared types and interfaces)
// - src/pages/KnowledgeHub/services/userData/UserLearningProgressService.ts (learning progress operations)
// - src/pages/KnowledgeHub/services/userData/UserPerformanceMetricsService.ts (performance analytics)
// - src/pages/KnowledgeHub/services/userData/UserProfileService.ts (profile management)
// - src/pages/KnowledgeHub/services/userData/ContentRecommendationService.ts (recommendations)
// - src/pages/KnowledgeHub/services/userData/index.ts (main barrel export and compatibility layer)

// Benefits of this refactoring:
// 1. Better separation of concerns
// 2. Easier to maintain and test individual services
// 3. Improved code reusability
// 4. Better type safety and organization
// 5. Reduced cognitive load when working on specific features
