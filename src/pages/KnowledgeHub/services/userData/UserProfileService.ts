import { supabase } from '../../../../lib/supabase';
import { UserProfile, ContentItemRow } from './types';
import { ContentItem, ContentCategory, ContentStatus } from '../../types';

/**
 * User Profile Service
 *
 * Handles user profile operations including:
 * - Profile management
 * - Learning preferences
 * - Profile updates
 * - Department and role-based content
 */
export class UserProfileService {
  /**
   * Get user profile
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (error || !userData) {
        console.error('Error fetching user profile:', error);
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
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  /**
   * Update learning preferences
   */
  async updateLearningPreferences(
    preferences: UserProfile['learningPreferences'],
    userId?: string
  ): Promise<boolean> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({
          learning_preferences: preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId);

      if (error) {
        console.error('Error updating learning preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateLearningPreferences:', error);
      return false;
    }
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
  ): Promise<boolean> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  /**
   * Get content by department
   */
  async getContentByDepartment(department: string): Promise<ContentItem[]> {
    try {
      const { data: content, error } = await supabase
        .from('knowledge_hub_content')
        .select('*')
        .eq('department', department)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching department content:', error);
        return [];
      }

      return (
        (content as unknown as ContentItemRow[])?.map(
          this.transformRowToContentItem
        ) || []
      );
    } catch (error) {
      console.error('Error in getContentByDepartment:', error);
      return [];
    }
  }

  /**
   * Get content by role
   */
  async getContentByRole(role: string): Promise<ContentItem[]> {
    try {
      const { data: content, error } = await supabase
        .from('knowledge_hub_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching role content:', error);
        return [];
      }

      // Filter content based on role (simplified logic)
      const roleBasedContent =
        (
          content as Array<{
            data?: { tags?: string[] };
            difficulty_level?: string;
          }>
        )?.filter((item) => {
          const tags = Array.isArray(
            (item as { data?: { tags?: string[] } }).data?.tags
          )
            ? (item as { data: { tags: string[] } }).data.tags
            : [];
          return (
            tags.includes(role) ||
            item.difficulty_level === this.getRoleDifficultyLevel(role)
          );
        }) || [];

      return (roleBasedContent as unknown as ContentItemRow[]).map(
        this.transformRowToContentItem
      );
    } catch (error) {
      console.error('Error in getContentByRole:', error);
      return [];
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
   * Get role difficulty level
   */
  private getRoleDifficultyLevel(role: string): string {
    switch (role.toLowerCase()) {
      case 'doctor':
        return 'Advanced';
      case 'nurse':
        return 'Intermediate';
      case 'technician':
        return 'Intermediate';
      default:
        return 'Beginner';
    }
  }

  /**
   * Transform database row to content item
   */
  private transformRowToContentItem(row: ContentItemRow): ContentItem {
    return {
      id: row.id,
      title: row.title,
      category: this.validateContentCategory(row.category),
      status: this.validateContentStatus(row.status),
      description: row.description,
      tags: row.tags || [],
      createdAt: row.created_at,
      dueDate: row.due_date || new Date().toISOString().split('T')[0],
      progress: row.progress || 0,
    };
  }

  private validateContentCategory(category: string): ContentCategory {
    const validCategories: ContentCategory[] = [
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ];
    return validCategories.includes(category as ContentCategory)
      ? (category as ContentCategory)
      : 'Courses';
  }

  private validateContentStatus(status: string): ContentStatus {
    const validStatuses: ContentStatus[] = [
      'draft',
      'published',
      'archived',
      'review',
    ];
    return validStatuses.includes(status as ContentStatus)
      ? (status as ContentStatus)
      : 'draft';
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
