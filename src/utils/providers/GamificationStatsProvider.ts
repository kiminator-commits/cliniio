import { supabase } from '../../lib/supabaseClient';
import { UserGamificationStatsRow } from './GamificationTypes';

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  totalTasks: number;
  completedTasks: number;
}

export interface GamificationMetrics {
  totalUsers: number;
  averagePoints: number;
  averageLevel: number;
  totalTasksCompleted: number;
  averageStreak: number;
  topPerformer: {
    userId: string;
    userName: string;
    points: number;
  };
  activityTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export class GamificationStatsProvider {
  /**
   * Get user cumulative stats
   */
  async getUserCumulativeStats(facilityId: string): Promise<UserStats> {
    try {
      const { data } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (!data) {
        return {
          totalPoints: 0,
          currentStreak: 0,
          totalTasks: 0,
          completedTasks: 0,
        };
      }

      const statsData = data as UserGamificationStatsRow;
      return {
        totalPoints: statsData.total_points || 0,
        currentStreak: statsData.current_streak || 0,
        totalTasks: statsData.total_tasks || 0,
        completedTasks: statsData.completed_tasks || 0,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalPoints: 0,
        currentStreak: 0,
        totalTasks: 0,
        completedTasks: 0,
      };
    }
  }

  /**
   * Update user stats
   */
  async updateUserStats(
    facilityId: string,
    updates: Partial<UserStats>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_gamification_stats')
        .upsert({
          facility_id: facilityId,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user stats:', error);
      return false;
    }
  }

  /**
   * Add points to user
   */
  async addPoints(
    facilityId: string,
    points: number,
    reason?: string
  ): Promise<boolean> {
    try {
      const currentStats = await this.getUserCumulativeStats(facilityId);
      const newTotalPoints = currentStats.totalPoints + points;

      const success = await this.updateUserStats(facilityId, {
        totalPoints: newTotalPoints,
      });

      if (success && reason) {
        // Log the points addition
        await this.logPointsActivity(facilityId, points, reason);
      }

      return success;
    } catch (error) {
      console.error('Error adding points:', error);
      return false;
    }
  }

  /**
   * Update streak
   */
  async updateStreak(
    facilityId: string,
    increment: boolean = true
  ): Promise<boolean> {
    try {
      const currentStats = await this.getUserCumulativeStats(facilityId);
      const newStreak = increment 
        ? currentStats.currentStreak + 1 
        : 0; // Reset to 0 if broken

      return await this.updateUserStats(facilityId, {
        currentStreak: newStreak,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
      return false;
    }
  }

  /**
   * Complete task
   */
  async completeTask(
    facilityId: string,
    points: number = 10
  ): Promise<boolean> {
    try {
      const currentStats = await this.getUserCumulativeStats(facilityId);
      
      const updates: Partial<UserStats> = {
        completedTasks: currentStats.completedTasks + 1,
        totalPoints: currentStats.totalPoints + points,
      };

      return await this.updateUserStats(facilityId, updates);
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }

  /**
   * Get facility gamification metrics
   */
  async getFacilityMetrics(facilityId: string): Promise<GamificationMetrics> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, total_points')
        .eq('facility_id', facilityId)
        .not('total_points', 'is', null);

      if (!users || users.length === 0) {
        return {
          totalUsers: 0,
          averagePoints: 0,
          averageLevel: 0,
          totalTasksCompleted: 0,
          averageStreak: 0,
          topPerformer: {
            userId: '',
            userName: '',
            points: 0,
          },
          activityTrends: {
            daily: [],
            weekly: [],
            monthly: [],
          },
        };
      }

      const totalUsers = users.length;
      const totalPoints = users.reduce((sum, user) => sum + (user.total_points || 0), 0);
      const averagePoints = totalPoints / totalUsers;
      const averageLevel = this.calculateAverageLevel(users.map(u => u.total_points || 0));
      
      const topUser = users.reduce((top, user) => 
        (user.total_points || 0) > (top.total_points || 0) ? user : top
      );

      // Get activity trends (mock data for now)
      const activityTrends = await this.getActivityTrends(facilityId);

      return {
        totalUsers,
        averagePoints,
        averageLevel,
        totalTasksCompleted: totalPoints / 10, // Assuming 10 points per task
        averageStreak: 0, // Would need to calculate from actual data
        topPerformer: {
          userId: topUser.id,
          userName: topUser.full_name || 'Unknown',
          points: topUser.total_points || 0,
        },
        activityTrends,
      };
    } catch (error) {
      console.error('Error getting facility metrics:', error);
      return {
        totalUsers: 0,
        averagePoints: 0,
        averageLevel: 0,
        totalTasksCompleted: 0,
        averageStreak: 0,
        topPerformer: {
          userId: '',
          userName: '',
          points: 0,
        },
        activityTrends: {
          daily: [],
          weekly: [],
          monthly: [],
        },
      };
    }
  }

  /**
   * Get user performance comparison
   */
  async getUserPerformanceComparison(
    userId: string,
    facilityId: string
  ): Promise<{
    userStats: UserStats;
    facilityAverage: UserStats;
    percentile: number;
    rank: number;
    totalUsers: number;
  }> {
    try {
      const userStats = await this.getUserCumulativeStats(facilityId);
      const facilityMetrics = await this.getFacilityMetrics(facilityId);

      const facilityAverage: UserStats = {
        totalPoints: facilityMetrics.averagePoints,
        currentStreak: facilityMetrics.averageStreak,
        totalTasks: facilityMetrics.totalTasksCompleted,
        completedTasks: facilityMetrics.totalTasksCompleted,
      };

      // Calculate percentile
      const { data: users } = await supabase
        .from('users')
        .select('id, total_points')
        .eq('facility_id', facilityId)
        .not('total_points', 'is', null);

      if (!users || users.length === 0) {
        return {
          userStats,
          facilityAverage,
          percentile: 100,
          rank: 1,
          totalUsers: 0,
        };
      }

      const sortedUsers = users.sort(
        (a, b) => (b.total_points || 0) - (a.total_points || 0)
      );
      const userIndex = sortedUsers.findIndex(u => u.id === userId);
      const rank = userIndex + 1;
      const percentile = ((users.length - rank + 1) / users.length) * 100;

      return {
        userStats,
        facilityAverage,
        percentile,
        rank,
        totalUsers: users.length,
      };
    } catch (error) {
      console.error('Error getting user performance comparison:', error);
      return {
        userStats: { totalPoints: 0, currentStreak: 0, totalTasks: 0, completedTasks: 0 },
        facilityAverage: { totalPoints: 0, currentStreak: 0, totalTasks: 0, completedTasks: 0 },
        percentile: 50,
        rank: 1,
        totalUsers: 0,
      };
    }
  }

  /**
   * Get activity trends
   */
  private async getActivityTrends(_facilityId: string): Promise<{
    daily: number[];
    weekly: number[];
    monthly: number[];
  }> {
    // Mock data for now - would query actual activity data
    return {
      daily: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5),
      weekly: Array.from({ length: 4 }, () => Math.floor(Math.random() * 100) + 50),
      monthly: Array.from({ length: 12 }, () => Math.floor(Math.random() * 500) + 200),
    };
  }

  /**
   * Log points activity
   */
  private async logPointsActivity(
    facilityId: string,
    points: number,
    reason: string
  ): Promise<void> {
    try {
      // No-op since gamification_activity_log table doesn't exist
      console.log(`Points activity logged: ${points} points for ${reason} (facility: ${facilityId})`);
    } catch (error) {
      console.error('Error logging points activity:', error);
    }
  }

  /**
   * Calculate average level from points
   */
  private calculateAverageLevel(points: number[]): number {
    const levels = points.map(p => Math.max(1, Math.floor(Math.sqrt(p / 500))));
    return levels.reduce((sum, level) => sum + level, 0) / levels.length;
  }

  /**
   * Get stats summary
   */
  getStatsSummary(stats: UserStats): {
    completionRate: number;
    averagePointsPerTask: number;
    streakStatus: 'active' | 'broken' | 'new';
    performanceLevel: 'excellent' | 'good' | 'average' | 'needs_improvement';
  } {
    const completionRate = stats.totalTasks > 0 
      ? (stats.completedTasks / stats.totalTasks) * 100 
      : 0;

    const averagePointsPerTask = stats.completedTasks > 0 
      ? stats.totalPoints / stats.completedTasks 
      : 0;

    let streakStatus: 'active' | 'broken' | 'new' = 'new';
    if (stats.currentStreak > 0) {
      streakStatus = 'active';
    } else if (stats.totalTasks > 0) {
      streakStatus = 'broken';
    }

    let performanceLevel: 'excellent' | 'good' | 'average' | 'needs_improvement' = 'needs_improvement';
    if (completionRate >= 90) {
      performanceLevel = 'excellent';
    } else if (completionRate >= 75) {
      performanceLevel = 'good';
    } else if (completionRate >= 50) {
      performanceLevel = 'average';
    }

    return {
      completionRate,
      averagePointsPerTask,
      streakStatus,
      performanceLevel,
    };
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(stats: UserStats): Array<{
    category: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations: Array<{
      category: string;
      recommendation: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    const completionRate = stats.totalTasks > 0 
      ? (stats.completedTasks / stats.totalTasks) * 100 
      : 0;

    if (completionRate < 50) {
      recommendations.push({
        category: 'Task Completion',
        recommendation: 'Focus on completing more tasks to improve your completion rate',
        priority: 'high',
      });
    }

    if (stats.currentStreak < 3) {
      recommendations.push({
        category: 'Consistency',
        recommendation: 'Try to maintain a daily streak to build momentum',
        priority: 'medium',
      });
    }

    if (stats.totalPoints < 100) {
      recommendations.push({
        category: 'Engagement',
        recommendation: 'Complete more tasks to earn points and level up',
        priority: 'medium',
      });
    }

    if (stats.totalTasks === 0) {
      recommendations.push({
        category: 'Getting Started',
        recommendation: 'Start completing tasks to begin your gamification journey',
        priority: 'high',
      });
    }

    return recommendations;
  }

  /**
   * Validate stats data
   */
  validateStatsData(stats: Partial<UserStats>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (stats.totalPoints !== undefined && stats.totalPoints < 0) {
      errors.push('Total points cannot be negative');
    }

    if (stats.currentStreak !== undefined && stats.currentStreak < 0) {
      errors.push('Current streak cannot be negative');
    }

    if (stats.totalTasks !== undefined && stats.totalTasks < 0) {
      errors.push('Total tasks cannot be negative');
    }

    if (stats.completedTasks !== undefined && stats.completedTasks < 0) {
      errors.push('Completed tasks cannot be negative');
    }

    if (
      stats.totalTasks !== undefined &&
      stats.completedTasks !== undefined &&
      stats.completedTasks > stats.totalTasks
    ) {
      errors.push('Completed tasks cannot exceed total tasks');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export stats data
   */
  exportStatsData(stats: UserStats): string {
    return JSON.stringify(stats, null, 2);
  }

  /**
   * Import stats data
   */
  importStatsData(jsonData: string): {
    success: boolean;
    stats: UserStats | null;
    errors: string[];
  } {
    try {
      const stats = JSON.parse(jsonData) as UserStats;
      const validation = this.validateStatsData(stats);

      return {
        success: validation.isValid,
        stats: validation.isValid ? stats : null,
        errors: validation.errors,
      };
    } catch {
      return {
        success: false,
        stats: null,
        errors: ['Invalid JSON format'],
      };
    }
  }
}
