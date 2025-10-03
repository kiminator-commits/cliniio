import { ContentItem, ContentStatus } from '../types';
import { supabase } from '../../../lib/supabase';

export interface ProgressData {
  userId: string;
  contentId: string;
  status: ContentStatus;
  progress: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  completedAt?: string;
  score?: number;
  notes?: string;
}

// Database row interface for progress data
interface ProgressDataRow {
  id: string;
  user_id: string;
  content_id: string;
  status: string;
  progress: number;
  time_spent: number;
  last_accessed: string;
  completed_at?: string;
  score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  notStartedItems: number;
  averageProgress: number;
  totalTimeSpent: number;
  completionRate: number;
}

export class ProgressTrackingService {
  private tableName = 'user_progress';

  /**
   * Update progress for a specific content item
   */
  async updateProgress(progressData: ProgressData): Promise<boolean> {
    try {
      const { error } = await supabase.from(this.tableName).upsert(
        {
          user_id: progressData.userId,
          content_id: progressData.contentId,
          status: progressData.status,
          progress: progressData.progress,
          time_spent: progressData.timeSpent,
          last_accessed: progressData.lastAccessed,
          completed_at: progressData.completedAt,
          score: progressData.score,
          notes: progressData.notes,
        },
        {
          onConflict: 'user_id,content_id',
        }
      );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  /**
   * Get progress for a specific content item
   */
  async getProgress(
    userId: string,
    contentId: string
  ): Promise<ProgressData | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error) throw error;

      return data
        ? {
            userId: data.user_id as string,
            contentId: data.content_id as string,
            status: data.status as ContentStatus,
            progress: data.progress as number,
            timeSpent: data.time_spent as number,
            lastAccessed: data.last_accessed as string,
            completedAt: data.completed_at as string | undefined,
            score: data.score as number | undefined,
            notes: data.notes as string | undefined,
          }
        : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  /**
   * Get progress summary for all user content
   */
  async getProgressSummary(userId: string): Promise<ProgressSummary> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const progressData = (data as unknown as ProgressDataRow[]) || [];
      const totalItems = progressData.length;
      const completedItems = progressData.filter(
        (p: ProgressDataRow) => p.status === 'Completed'
      ).length;
      const inProgressItems = progressData.filter(
        (p: ProgressDataRow) => p.status === 'In Progress'
      ).length;
      const notStartedItems = progressData.filter(
        (p: ProgressDataRow) => p.status === 'Not Started'
      ).length;
      const averageProgress =
        totalItems > 0
          ? progressData.reduce(
              (sum: number, p: ProgressDataRow) => sum + p.progress,
              0
            ) / totalItems
          : 0;
      const totalTimeSpent = progressData.reduce(
        (sum: number, p: ProgressDataRow) => sum + p.time_spent,
        0
      );
      const completionRate =
        totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      return {
        totalItems,
        completedItems,
        inProgressItems,
        notStartedItems,
        averageProgress,
        totalTimeSpent,
        completionRate,
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return {
        totalItems: 0,
        completedItems: 0,
        inProgressItems: 0,
        notStartedItems: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Sync progress between library and Knowledge Hub
   */
  async syncProgress(
    userId: string,
    contentItems: ContentItem[]
  ): Promise<ContentItem[]> {
    try {
      // Get all user progress data
      const { data: progressData, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const progressMap = new Map(
        ((progressData as unknown as ProgressDataRow[]) || []).map(
          (p: ProgressDataRow) => [p.content_id, p]
        )
      );

      // Update content items with progress data
      return contentItems.map((item) => {
        const progress = progressMap.get(item.id);
        if (progress) {
          return {
            ...item,
            status: progress.status as ContentStatus,
            progress: progress.progress as number,
            lastUpdated: progress.last_accessed as string,
          };
        }
        return item;
      });
    } catch (error) {
      console.error('Error syncing progress:', error);
      return contentItems;
    }
  }

  /**
   * Track time spent on content
   */
  async trackTimeSpent(
    userId: string,
    contentId: string,
    timeSpent: number,
    facilityId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          time_spent: supabase.rpc('increment', { amount: timeSpent }),
          last_accessed: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .eq('facility_id', facilityId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking time spent:', error);
      return false;
    }
  }
}

// Export singleton instance
export const progressTrackingService = new ProgressTrackingService();
