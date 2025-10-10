import { supabase } from '../../../../lib/supabase';
import { ApiError, ErrorType, ErrorSeverity } from '../../types/errors';
import { KHDataTransformationProvider } from './KHDataTransformationProvider';

export interface UserProgress {
  id?: string;
  user_id: string;
  content_id: string;
  progress_percentage: number;
  completed_at?: string;
  started_at: string;
  last_accessed_at: string;
  time_spent_minutes: number;
  notes?: string;
  bookmarked: boolean;
  rating?: number;
  feedback?: string;
}

export interface ProgressStatistics {
  totalContent: number;
  completedContent: number;
  inProgressContent: number;
  bookmarkedContent: number;
  totalTimeSpent: number;
  averageRating: number;
  completionRate: number;
}

export class KHProgressProvider {
  private tableName = 'knowledge_hub_user_progress';

  /**
   * Get user progress for specific content
   */
  async getUserProgress(
    userId: string,
    contentId: string
  ): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  /**
   * Update user progress
   */
  async updateUserProgress(
    userId: string,
    contentId: string,
    progress: Partial<UserProgress>
  ): Promise<UserProgress> {
    try {
      const upsertData = KHDataTransformationProvider.transformProgressData(
        userId,
        contentId,
        progress
      );

      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(upsertData)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from progress update');
      }

      return data as UserProgress;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to update progress', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Mark content as completed
   */
  async markContentCompleted(
    userId: string,
    contentId: string,
    timeSpentMinutes?: number
  ): Promise<UserProgress> {
    try {
      const progressData: Partial<UserProgress> = {
        progress_percentage: 100,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      };

      if (timeSpentMinutes !== undefined) {
        progressData.time_spent_minutes = timeSpentMinutes;
      }

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error marking content as completed:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to mark content as completed',
        {
          severity: ErrorSeverity.MEDIUM,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Start content (mark as in progress)
   */
  async startContent(userId: string, contentId: string): Promise<UserProgress> {
    try {
      const progressData: Partial<UserProgress> = {
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        time_spent_minutes: 0,
      };

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error starting content:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to start content', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Update progress percentage
   */
  async updateProgressPercentage(
    userId: string,
    contentId: string,
    percentage: number
  ): Promise<UserProgress> {
    try {
      if (percentage < 0 || percentage > 100) {
        throw new ApiError(
          ErrorType.VALIDATION_ERROR,
          'Progress percentage must be between 0 and 100',
          {
            severity: ErrorSeverity.LOW,
          }
        );
      }

      const progressData: Partial<UserProgress> = {
        progress_percentage: percentage,
        last_accessed_at: new Date().toISOString(),
      };

      // If progress reaches 100%, mark as completed
      if (percentage === 100) {
        progressData.completed_at = new Date().toISOString();
      }

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error updating progress percentage:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to update progress percentage',
        {
          severity: ErrorSeverity.MEDIUM,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Add time spent to content
   */
  async addTimeSpent(
    userId: string,
    contentId: string,
    additionalMinutes: number
  ): Promise<UserProgress> {
    try {
      const currentProgress = await this.getUserProgress(userId, contentId);
      const currentTimeSpent = currentProgress?.time_spent_minutes || 0;

      const progressData: Partial<UserProgress> = {
        time_spent_minutes: currentTimeSpent + additionalMinutes,
        last_accessed_at: new Date().toISOString(),
      };

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error adding time spent:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to add time spent', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Bookmark/unbookmark content
   */
  async toggleBookmark(
    userId: string,
    contentId: string
  ): Promise<UserProgress> {
    try {
      const currentProgress = await this.getUserProgress(userId, contentId);
      const isBookmarked = currentProgress?.bookmarked || false;

      const progressData: Partial<UserProgress> = {
        bookmarked: !isBookmarked,
        last_accessed_at: new Date().toISOString(),
      };

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to toggle bookmark', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Rate content
   */
  async rateContent(
    userId: string,
    contentId: string,
    rating: number,
    feedback?: string
  ): Promise<UserProgress> {
    try {
      if (rating < 1 || rating > 5) {
        throw new ApiError(
          ErrorType.VALIDATION_ERROR,
          'Rating must be between 1 and 5',
          {
            severity: ErrorSeverity.LOW,
          }
        );
      }

      const progressData: Partial<UserProgress> = {
        rating,
        feedback,
        last_accessed_at: new Date().toISOString(),
      };

      return await this.updateUserProgress(userId, contentId, progressData);
    } catch (error) {
      console.error('Error rating content:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to rate content', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Get all user progress
   */
  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching all user progress:', error);
      return [];
    }
  }

  /**
   * Get user progress statistics
   */
  async getUserProgressStatistics(userId: string): Promise<ProgressStatistics> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const progressData = data || [];
      const totalContent = progressData.length;
      const completedContent = progressData.filter(
        (p) => p.progress_percentage === 100
      ).length;
      const inProgressContent = progressData.filter(
        (p) => p.progress_percentage > 0 && p.progress_percentage < 100
      ).length;
      const bookmarkedContent = progressData.filter((p) => p.bookmarked).length;
      const totalTimeSpent = progressData.reduce(
        (sum, p) => sum + (p.time_spent_minutes || 0),
        0
      );
      const ratings = progressData.filter((p) => p.rating).map((p) => p.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;
      const completionRate =
        totalContent > 0 ? (completedContent / totalContent) * 100 : 0;

      return {
        totalContent,
        completedContent,
        inProgressContent,
        bookmarkedContent,
        totalTimeSpent,
        averageRating,
        completionRate,
      };
    } catch (error) {
      console.error('Error fetching user progress statistics:', error);
      return {
        totalContent: 0,
        completedContent: 0,
        inProgressContent: 0,
        bookmarkedContent: 0,
        totalTimeSpent: 0,
        averageRating: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Get recently accessed content
   */
  async getRecentlyAccessedContent(
    userId: string,
    limit: number = 10
  ): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching recently accessed content:', error);
      return [];
    }
  }

  /**
   * Get bookmarked content
   */
  async getBookmarkedContent(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('bookmarked', true)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching bookmarked content:', error);
      return [];
    }
  }

  /**
   * Delete user progress
   */
  async deleteUserProgress(userId: string, contentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('content_id', contentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user progress:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to delete user progress',
        {
          severity: ErrorSeverity.MEDIUM,
          context: { originalError: error },
        }
      );
    }
  }
}
