import { supabase } from '../../../../lib/supabase';
import { ContentItem, ContentCategory, ContentStatus } from '../../types';
import { ContentRecommendation, UserProfile, ContentItemRow } from './types';

/**
 * Content Recommendation Service
 *
 * Handles personalized content recommendations including:
 * - Recommendation generation
 * - Relevance scoring
 * - Personalized content filtering
 * - Recommendation reasoning
 */
export class ContentRecommendationService {
  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(
    userId?: string,
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Get user profile for personalization
      const profile = await this.getUserProfile(currentUserId);
      if (!profile) {
        return this.getDefaultRecommendations(limit);
      }

      // Get all available content
      const { data: contentRows, error } = await supabase
        .from('knowledge_hub_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !contentRows) {
        console.error('Error fetching content for recommendations:', error);
        return this.getDefaultRecommendations(limit);
      }

      // Transform to content items
      const contentItems = (contentRows as unknown as ContentItemRow[]).map(
        this.transformRowToContentItem
      );

      // Generate personalized recommendations
      const recommendations = this.generateRecommendations(
        contentItems,
        profile,
        limit
      );

      return recommendations;
    } catch (error) {
      console.error('Error in getPersonalizedRecommendations:', error);
      return this.getDefaultRecommendations(limit);
    }
  }

  /**
   * Generate recommendations based on user profile and content
   */
  private generateRecommendations(
    contentItems: ContentItem[],
    profile: UserProfile,
    limit: number
  ): ContentRecommendation[] {
    // Score each content item based on user profile
    const scoredContent = contentItems.map((content) => {
      const relevanceScore = this.calculateRelevanceScore(content, profile);
      const reason = this.generateRecommendationReason(content, profile);

      return {
        contentId: content.id,
        title: content.title,
        category: content.category,
        reason,
        relevanceScore,
        estimatedDuration: content.estimatedDuration || 30,
        difficulty: content.difficultyLevel || 'Beginner',
        tags: content.tags || [],
      };
    });

    // Sort by relevance score and take top recommendations
    return scoredContent
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Calculate relevance score for content based on user profile
   */
  private calculateRelevanceScore(
    content: ContentItem,
    profile: UserProfile
  ): number {
    let score = 0;

    // Base score for active content
    if (content.isActive) {
      score += 10;
    }

    // Department match
    if (
      content.department &&
      profile.department &&
      content.department.toLowerCase() === profile.department.toLowerCase()
    ) {
      score += 20;
    }

    // Role-based scoring
    if (profile.role) {
      const roleTags =
        content.tags?.filter((tag) =>
          tag.toLowerCase().includes(profile.role.toLowerCase())
        ) || [];
      score += roleTags.length * 15;
    }

    // Difficulty level match
    if (content.difficultyLevel === profile.skillLevel) {
      score += 15;
    } else if (
      content.difficultyLevel &&
      this.isAppropriateDifficulty(content.difficultyLevel, profile.skillLevel)
    ) {
      score += 10;
    }

    // Interest match
    const interestMatch = content.tags?.some((tag) =>
      profile.learningPreferences.interests.some((interest) =>
        tag.toLowerCase().includes(interest.toLowerCase())
      )
    );
    if (interestMatch) {
      score += 15;
    }

    // Learning goal match
    const goalMatch = content.tags?.some((tag) =>
      profile.learningPreferences.learningGoals.some((goal) =>
        tag.toLowerCase().includes(goal.toLowerCase())
      )
    );
    if (goalMatch) {
      score += 15;
    }

    // Time availability match
    const estimatedDuration = content.estimatedDuration || 30;
    if (estimatedDuration <= profile.learningPreferences.timeAvailability) {
      score += 10;
    }

    // Recency bonus
    if (content.createdAt) {
      const daysSinceCreation = this.getDaysSinceCreation(content.createdAt);
      if (daysSinceCreation <= 30) {
        score += 5; // New content bonus
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Check if difficulty level is appropriate for user skill level
   */
  private isAppropriateDifficulty(
    contentDifficulty: string,
    userSkillLevel: string
  ): boolean {
    const difficultyOrder = ['Beginner', 'Intermediate', 'Advanced'];
    const contentIndex = difficultyOrder.indexOf(contentDifficulty);
    const userIndex = difficultyOrder.indexOf(userSkillLevel);

    // Allow same level or one level up
    return contentIndex <= userIndex + 1;
  }

  /**
   * Get days since content creation
   */
  private getDaysSinceCreation(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(
    content: ContentItem,
    profile: UserProfile
  ): string {
    const reasons: string[] = [];

    // Department match
    if (
      content.department &&
      profile.department &&
      content.department.toLowerCase() === profile.department.toLowerCase()
    ) {
      reasons.push(`Relevant to your department (${content.department})`);
    }

    // Role match
    if (
      profile.role &&
      content.tags?.some((tag) =>
        tag.toLowerCase().includes(profile.role.toLowerCase())
      )
    ) {
      reasons.push(`Tailored for ${profile.role}s`);
    }

    // Skill level match
    if (content.difficultyLevel === profile.skillLevel) {
      reasons.push(`Matches your skill level (${profile.skillLevel})`);
    }

    // Interest match
    const matchingInterests =
      content.tags?.filter((tag) =>
        profile.learningPreferences.interests.some((interest) =>
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      ) || [];
    if (matchingInterests.length > 0) {
      reasons.push(
        `Covers your interests: ${matchingInterests.slice(0, 2).join(', ')}`
      );
    }

    // Time availability
    const estimatedDuration = content.estimatedDuration || 30;
    if (estimatedDuration <= profile.learningPreferences.timeAvailability) {
      reasons.push(`Fits your available time (${estimatedDuration} minutes)`);
    }

    // Default reason if no specific matches
    if (reasons.length === 0) {
      reasons.push('Popular content in your field');
    }

    return reasons.slice(0, 2).join('. ');
  }

  /**
   * Get default recommendations
   */
  private getDefaultRecommendations(limit: number): ContentRecommendation[] {
    const defaultContent = [
      {
        contentId: 'default-1',
        title: 'Introduction to Medical Procedures',
        category: 'General Medicine',
        reason: 'Essential knowledge for healthcare professionals',
        relevanceScore: 80,
        estimatedDuration: 30,
        difficulty: 'Beginner',
        tags: ['medical', 'procedures', 'basics'],
      },
      {
        contentId: 'default-2',
        title: 'Patient Safety Protocols',
        category: 'Safety',
        reason: 'Critical safety information for all staff',
        relevanceScore: 75,
        estimatedDuration: 45,
        difficulty: 'Intermediate',
        tags: ['safety', 'protocols', 'patient-care'],
      },
    ];

    return defaultContent.slice(0, limit);
  }

  /**
   * Get user profile
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        return null;
      }

      return {
        id: userData.id as string,
        email: userData.email as string,
        role: (userData.role as string) || 'user',
        department: userData.department as string | undefined,
        title: userData.title as string | undefined,
        specialization: userData.specialization as string | undefined,
        yearsExperience: userData.years_experience as number | undefined,
        skillLevel:
          (userData.skill_level as 'Beginner' | 'Intermediate' | 'Advanced') ||
          'Beginner',
        learningPreferences: this.getDefaultLearningPreferences(),
        lastUpdated:
          (userData.updated_at as string) || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get default learning preferences
   */
  private getDefaultLearningPreferences() {
    return {
      interests: ['General Medicine'],
      learningGoals: ['Improve patient care'],
      timeAvailability: 30,
      difficultyPreference: 'Beginner' as const,
    };
  }

  /**
   * Transform database row to content item
   */
  private transformRowToContentItem(row: ContentItemRow): ContentItem {
    return {
      id: row.id,
      title: row.title,
      category: row.category as ContentCategory,
      status: row.status as ContentStatus,
      dueDate: row.due_date || new Date().toISOString(),
      progress: row.progress || 0,
      department: row.department,
      lastUpdated: row.updated_at,
      description: row.description,
      tags: row.tags || [],
      domain: row.domain,
      contentType: row.content_type,
      type: row.type,
      createdAt: row.created_at,
      isActive: row.is_active,
      estimatedDuration: row.estimated_duration,
      difficultyLevel: row.difficulty_level,
    };
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}
