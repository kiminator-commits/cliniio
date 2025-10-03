import { supabase } from '../../../../lib/supabaseClient';
import { UserPerformanceMetrics, UserProfile } from './types';

interface ProgressDataItem {
  content_id: string;
  status: string;
  time_spent: number;
  progress: number;
  category: string;
  last_accessed: string;
}

/**
 * User Performance Metrics Service
 *
 * Handles user performance metrics operations including:
 * - Calculating performance metrics
 * - Analyzing skill gaps
 * - Generating recommendations
 */
export class UserPerformanceMetricsService {
  /**
   * Get user performance metrics
   */
  async getUserPerformanceMetrics(
    userId?: string
  ): Promise<UserPerformanceMetrics> {
    try {
      const currentUserId = userId || (await this.getCurrentUserId());
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      // Fetch user progress data
      const { data: progressData, error: progressError } = await supabase
        .from('knowledge_hub_user_progress')
        .select('*')
        .eq('user_id', currentUserId);

      if (progressError) {
        console.error('Error fetching user progress:', progressError);
        throw new Error('Failed to fetch user progress');
      }

      // Calculate metrics
      const metrics = this.calculatePerformanceMetrics(
        (progressData as unknown as ProgressDataItem[]) || [],
        currentUserId
      );

      // Get user profile for skill gap analysis
      const profile = await this.getUserProfile(currentUserId);
      if (profile) {
        metrics.skillGaps = this.analyzeSkillGaps(profile);
      }

      return metrics;
    } catch (error) {
      console.error('Error in getUserPerformanceMetrics:', error);
      return this.getDefaultPerformanceMetrics(userId || 'unknown');
    }
  }

  /**
   * Calculate performance metrics from progress data
   */
  private calculatePerformanceMetrics(
    progressData: ProgressDataItem[],
    userId: string
  ): UserPerformanceMetrics {
    const totalCourses = progressData.length;
    const completedCourses = progressData.filter(
      (p) => p.status === 'completed'
    ).length;
    const inProgressCourses = progressData.filter(
      (p) => p.status === 'in_progress'
    ).length;
    const notStartedCourses = progressData.filter(
      (p) => p.status === 'not_started'
    ).length;

    const totalTimeSpent = progressData.reduce(
      (sum, p) => sum + (p.time_spent || 0),
      0
    );
    const averageProgress =
      totalCourses > 0
        ? progressData.reduce((sum, p) => sum + (p.progress || 0), 0) /
          totalCourses
        : 0;

    const completionRate =
      totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

    // Calculate progress by category
    const progressByCategory: Record<string, number> = {};
    progressData.forEach((p) => {
      if (p.category) {
        if (!progressByCategory[p.category]) {
          progressByCategory[p.category] = 0;
        }
        progressByCategory[p.category] += p.progress || 0;
      }
    });

    // Get recent activity
    const recentActivity = progressData
      .sort(
        (a, b) =>
          new Date(b.last_accessed).getTime() -
          new Date(a.last_accessed).getTime()
      )
      .slice(0, 10)
      .map((p) => ({
        contentId: p.content_id,
        action: p.status,
        timestamp: p.last_accessed,
      }));

    return {
      userId,
      totalCourses,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      averageProgress,
      completionRate,
      timeSpent: totalTimeSpent,
      certificatesEarned: completedCourses, // Simplified - assume each completed course earns a certificate
      progressByCategory,
      recentActivity,
      skillGaps: [],
      recommendedContent: [],
    };
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
   * Analyze skill gaps based on user profile
   */
  private analyzeSkillGaps(profile: UserProfile): string[] {
    const skillGaps: string[] = [];

    // Basic skill gap analysis based on role and experience
    if (
      profile.role === 'nurse' &&
      profile.yearsExperience &&
      profile.yearsExperience < 2
    ) {
      skillGaps.push('Advanced patient care procedures');
      skillGaps.push('Emergency response protocols');
    }

    if (
      profile.role === 'doctor' &&
      profile.yearsExperience &&
      profile.yearsExperience < 5
    ) {
      skillGaps.push('Complex surgical procedures');
      skillGaps.push('Specialized diagnostic techniques');
    }

    if (profile.skillLevel === 'Beginner') {
      skillGaps.push('Basic medical terminology');
      skillGaps.push('Standard operating procedures');
    }

    return skillGaps;
  }

  /**
   * Get default performance metrics
   */
  private getDefaultPerformanceMetrics(userId: string): UserPerformanceMetrics {
    return {
      userId,
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      notStartedCourses: 0,
      averageProgress: 0,
      completionRate: 0,
      timeSpent: 0,
      certificatesEarned: 0,
      progressByCategory: {},
      recentActivity: [],
      skillGaps: [],
      recommendedContent: [],
    };
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
