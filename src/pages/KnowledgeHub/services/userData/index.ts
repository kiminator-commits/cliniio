// Re-export all user data services
export { UserLearningProgressService } from './UserLearningProgressService';
export { UserPerformanceMetricsService } from './UserPerformanceMetricsService';
export { UserProfileService } from './UserProfileService';
export { ContentRecommendationService } from './ContentRecommendationService';

// Re-export all types
export * from './types';

// Import types for proper typing
import { UserProfile, LearningActivity } from './types';

// Import service classes for instantiation
import { UserLearningProgressService } from './UserLearningProgressService';
import { UserPerformanceMetricsService } from './UserPerformanceMetricsService';
import { UserProfileService } from './UserProfileService';
import { ContentRecommendationService } from './ContentRecommendationService';

// Main user data integration service that combines all functionality
// This maintains backward compatibility with the original monolithic service
export class UserDataIntegrationService {
  private learningProgressService = new UserLearningProgressService();
  private performanceMetricsService = new UserPerformanceMetricsService();
  private profileService = new UserProfileService();
  private recommendationService = new ContentRecommendationService();

  /**
   * Get user learning progress
   */
  async getUserLearningProgress(userId?: string) {
    return this.learningProgressService.getUserLearningProgress(userId);
  }

  /**
   * Get user performance metrics
   */
  async getUserPerformanceMetrics(userId?: string) {
    return this.performanceMetricsService.getUserPerformanceMetrics(userId);
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId?: string) {
    return this.profileService.getUserProfile(userId);
  }

  /**
   * Update learning preferences
   */
  async updateLearningPreferences(
    preferences: UserProfile['learningPreferences'],
    userId?: string
  ) {
    return this.profileService.updateLearningPreferences(preferences, userId);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    updates: {
      department?: string;
      title?: string;
      specialization?: string;
      yearsExperience?: number;
      skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
    },
    userId?: string
  ) {
    return this.profileService.updateUserProfile(updates, userId);
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(userId?: string, limit: number = 10) {
    return this.recommendationService.getPersonalizedRecommendations(
      userId,
      limit
    );
  }

  /**
   * Track learning activity
   */
  async trackLearningActivity(activity: LearningActivity, userId?: string) {
    return this.learningProgressService.trackLearningActivity(activity, userId);
  }

  /**
   * Get content by department
   */
  async getContentByDepartment(department: string) {
    return this.profileService.getContentByDepartment(department);
  }

  /**
   * Get content by role
   */
  async getContentByRole(role: string) {
    return this.profileService.getContentByRole(role);
  }
}
