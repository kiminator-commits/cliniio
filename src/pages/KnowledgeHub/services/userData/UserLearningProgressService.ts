import { supabase } from '../../../../lib/supabaseClient';
import { UserLearningProgress, UserLearningProgressRow } from './types';
import { ContentStatus } from '../../types';

/**
 * User Learning Progress Service
 *
 * Handles user learning progress operations including:
 * - Fetching user learning progress
 * - Tracking learning activities
 * - Managing progress updates
 */
export class UserLearningProgressService {
  private contentTable = 'knowledge_hub_content';
  private usersTable = 'users';

  /**
   * Get user learning progress
   */
  async getUserLearningProgress(
    userId?: string
  ): Promise<UserLearningProgress[]> {
    try {
      // Get current user if not provided
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Fetch user learning progress from database
      const { data: progressRows, error } = await supabase
        .from('knowledge_hub_user_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .order('last_accessed', { ascending: false });

      if (error) {
        console.error('Error fetching user learning progress:', error);
        throw new Error('Failed to fetch learning progress');
      }

      // Transform database rows to domain objects
      return (
        (progressRows as unknown as UserLearningProgressRow[])?.map(
          this.transformRowToProgress
        ) || []
      );
    } catch (error) {
      console.error('Error in getUserLearningProgress:', error);
      return [];
    }
  }

  /**
   * Track learning activity
   */
  async trackLearningActivity(
    activity: {
      contentId: string;
      action: 'viewed' | 'started' | 'completed' | 'bookmarked';
      duration?: number;
      category?: string;
    },
    userId?: string
  ): Promise<boolean> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        console.warn('User not authenticated, skipping progress tracking');
        return false;
      }

      // Get current timestamp
      const now = new Date().toISOString();

      // Check if progress record exists
      const { data: existingProgress, error: selectError } = await supabase
        .from('knowledge_hub_user_progress')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('content_id', activity.contentId)
        .single();

      // Handle table not found error gracefully
      if (selectError && selectError.code === '42P01') {
        console.warn(
          'knowledge_hub_user_progress table not found, skipping progress tracking'
        );
        return false;
      }

      if (existingProgress) {
        // Update existing progress
        const updates: Partial<UserLearningProgressRow> = {
          last_accessed: now,
          time_spent:
            ((existingProgress.time_spent as number) || 0) +
            (activity.duration || 0),
        };

        // Update status based on action
        if (activity.action === 'completed') {
          updates.status = 'completed';
          updates.completed_at = now;
          updates.progress = 100;
        } else if (
          activity.action === 'started' &&
          existingProgress.status === 'not_started'
        ) {
          updates.status = 'in_progress';
          updates.progress = Math.max(
            (existingProgress.progress as number) || 0,
            10
          );
        }

        const { error } = await supabase
          .from('knowledge_hub_user_progress')
          .update(updates)
          .eq('user_id', currentUserId)
          .eq('content_id', activity.contentId);

        if (error) {
          // Handle table not found error gracefully
          if (error.code === '42P01') {
            console.warn(
              'knowledge_hub_user_progress table not found, skipping progress tracking'
            );
            return false;
          }
          console.error('Error updating learning progress:', error);
          return false;
        }
      } else {
        // Create new progress record
        const newProgress: Partial<UserLearningProgressRow> = {
          user_id: currentUserId,
          content_id: activity.contentId,
          status: activity.action === 'completed' ? 'completed' : 'in_progress',
          progress: activity.action === 'completed' ? 100 : 10,
          time_spent: activity.duration || 0,
          last_accessed: now,
          completed_at: activity.action === 'completed' ? now : undefined,
        };

        const { error } = await supabase
          .from('knowledge_hub_user_progress')
          .insert(newProgress);

        if (error) {
          // Handle table not found error gracefully
          if (error.code === '42P01') {
            console.warn(
              'knowledge_hub_user_progress table not found, skipping progress tracking'
            );
            return false;
          }
          console.error('Error creating learning progress:', error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error tracking learning activity:', error);
      return false;
    }
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.warn('Authentication error:', error);
        return null;
      }

      return user?.id || null;
    } catch (error) {
      console.warn('Error getting current user (non-critical):', error);
      return null;
    }
  }

  /**
   * Transform database row to domain object
   */
  private transformRowToProgress(
    row: UserLearningProgressRow
  ): UserLearningProgress {
    return {
      contentId: row.content_id,
      title: row.title,
      category: row.category,
      status: this.mapDatabaseStatusToContentStatus(row.status),
      progress: row.progress,
      completedAt: row.completed_at,
      timeSpent: row.time_spent,
      score: row.score,
      lastAccessed: row.last_accessed,
      department: row.department,
      assignedBy: row.assigned_by,
    };
  }

  /**
   * Map database status to ContentStatus
   */
  private mapDatabaseStatusToContentStatus(dbStatus: string): ContentStatus {
    switch (dbStatus) {
      case 'not_started':
        return 'draft';
      case 'in_progress':
        return 'review';
      case 'completed':
        return 'published';
      default:
        return 'draft';
    }
  }
}
