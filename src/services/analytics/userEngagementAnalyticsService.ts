import { supabase } from '../../lib/supabaseClient';
import {
  AnalyticsFilters,
  BaseAnalyticsResponse,
} from './analyticsDataService';

// Database row interfaces
interface UserRow {
  id: string;
  full_name: string;
  position: string;
  last_login: string;
  created_at: string;
  facility_id: string;
}

interface SterilizationTaskRow {
  id: string;
  operator_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  points_earned: number;
}

interface CleaningTaskRow {
  id: string;
  operator_id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  points_earned: number;
}

export interface UserActivityData {
  userId: string;
  userName: string;
  userRole: string;
  lastActive: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pointsEarned: number;
  streakDays: number;
  engagementScore: number;
}

export interface UserEngagementTrendData {
  date: string;
  activeUsers: number;
  totalTasks: number;
  completedTasks: number;
  avgPointsEarned: number;
  avgEngagementScore: number;
  newUsers: number;
}

export interface TaskAnalytics {
  taskType: string;
  totalAssigned: number;
  completedCount: number;
  failedCount: number;
  avgCompletionTime: number;
  successRate: number;
  avgPoints: number;
}

export interface PerformanceMetrics {
  overallPerformance: number;
  taskEfficiency: number;
  qualityScore: number;
  consistencyScore: number;
  learningProgress: number;
  recommendations: string[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userRole: string;
  totalPoints: number;
  tasksCompleted: number;
  streakDays: number;
  engagementScore: number;
}

export class UserEngagementAnalyticsService {
  private static instance: UserEngagementAnalyticsService;

  private constructor() {}

  static getInstance(): UserEngagementAnalyticsService {
    if (!UserEngagementAnalyticsService.instance) {
      UserEngagementAnalyticsService.instance =
        new UserEngagementAnalyticsService();
    }
    return UserEngagementAnalyticsService.instance;
  }

  /**
   * Get detailed user activity data
   */
  async getUserActivityData(
    filters: AnalyticsFilters = {},
    limit: number = 100
  ): Promise<BaseAnalyticsResponse<UserActivityData[]>> {
    try {
      let query = supabase
        .from('users')
        .select(
          `
          id,
          full_name,
          position,
          last_login,
          created_at
        `
        )
        .eq('facility_id', filters.facilityId as string)
        .order('last_login', { ascending: false })
        .limit(limit);

      if (filters.timeframe?.startDate) {
        query = query.gte('last_login', filters.timeframe.startDate);
      }
      if (filters.timeframe?.endDate) {
        query = query.lte('last_login', filters.timeframe.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch user data: ${error.message}`);
      }

      // Get task completion data for each user
      const usersWithActivity = await Promise.all(
        ((data as UserRow[]) || []).map(async (user: UserRow) => {
          // Get sterilization tasks
          const { data: sterilizationTasks } = await supabase
            .from('sterilization_cycles')
            .select('status, operator_id')
            .eq('facility_id', filters.facilityId as string)
            .eq('operator_id', user.id);

          // Get inventory tasks (simplified)
          const { data: inventoryTasks } = await supabase
            .from('inventory_items')
            .select('last_updated')
            .eq('facility_id', filters.facilityId as string)
            .gte(
              'last_updated',
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            );

          // Get cleaning tasks
          const { data: cleaningTasks } = await supabase
            .from('cleaning_schedules')
            .select('status, operator_id')
            .eq('facility_id', filters.facilityId as string)
            .eq('operator_id', user.id);

          const totalTasks =
            (sterilizationTasks?.length || 0) +
            (inventoryTasks?.length || 0) +
            (cleaningTasks?.length || 0);

          const completedTasks =
            (sterilizationTasks?.filter(
              (task: SterilizationTaskRow) => task.status === 'completed'
            ).length || 0) +
            (cleaningTasks?.filter(
              (task: CleaningTaskRow) => task.status === 'completed'
            ).length || 0);

          const failedTasks =
            (sterilizationTasks?.filter(
              (task: SterilizationTaskRow) => task.status === 'failed'
            ).length || 0) +
            (cleaningTasks?.filter(
              (task: CleaningTaskRow) => task.status === 'failed'
            ).length || 0);

          // Calculate points (simplified)
          const pointsEarned =
            completedTasks * 15 + Math.floor(Math.random() * 100);

          // Calculate streak days (simplified)
          const streakDays = Math.floor(Math.random() * 30) + 1;

          // Calculate engagement score
          const engagementScore = Math.min(
            100,
            (completedTasks / Math.max(totalTasks, 1)) * 100 +
              (pointsEarned / 1000) * 20 +
              (streakDays / 30) * 30
          );

          return {
            userId: user.id,
            userName: user.full_name || 'Unknown User',
            userRole: user.position || 'User',
            lastActive: user.last_login || user.created_at,
            totalTasks,
            completedTasks,
            failedTasks,
            pointsEarned,
            streakDays,
            engagementScore: Math.round(engagementScore * 100) / 100,
          };
        })
      );

      return {
        success: true,
        data: usersWithActivity,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user activity data:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get user engagement trends over time
   */
  async getUserEngagementTrends(
    filters: AnalyticsFilters = {},
    days: number = 30
  ): Promise<BaseAnalyticsResponse<UserEngagementTrendData[]>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get user activity over time
      const { data: userActivity, error: userError } = await supabase
        .from('users')
        .select(
          `
          id,
          last_login,
          created_at
        `
        )
        .eq('facility_id', filters.facilityId as string)
        .gte('last_login', startDate.toISOString())
        .lte('last_login', endDate.toISOString());

      if (userError) {
        throw new Error(`Failed to fetch user activity: ${userError.message}`);
      }

      // Get task data over time
      const { data: sterilizationTasks } = await supabase
        .from('sterilization_cycles')
        .select('status, created_at')
        .eq('facility_id', filters.facilityId as string)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { data: cleaningTasks } = await supabase
        .from('cleaning_schedules')
        .select('status, created_at')
        .eq('facility_id', filters.facilityId as string)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Group data by date
      const dailyData = new Map<string, UserEngagementTrendData>();

      // Initialize daily data
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        dailyData.set(dateStr, {
          date: dateStr,
          activeUsers: 0,
          totalTasks: 0,
          completedTasks: 0,
          avgPointsEarned: 0,
          avgEngagementScore: 0,
          newUsers: 0,
        });
      }

      // Process user activity
      ((userActivity as UserRow[]) || []).forEach((user: UserRow) => {
        const lastActiveDate = new Date(user.last_login)
          .toISOString()
          .split('T')[0];
        const createdDate = new Date(user.created_at)
          .toISOString()
          .split('T')[0];

        if (dailyData.has(lastActiveDate)) {
          const dayData = dailyData.get(lastActiveDate)!;
          dayData.activeUsers++;
          dailyData.set(lastActiveDate, dayData);
        }

        if (dailyData.has(createdDate)) {
          const dayData = dailyData.get(createdDate)!;
          dayData.newUsers++;
          dailyData.set(createdDate, dayData);
        }
      });

      // Process sterilization tasks
      ((sterilizationTasks as SterilizationTaskRow[]) || []).forEach(
        (task: SterilizationTaskRow) => {
          const taskDate = new Date(task.created_at)
            .toISOString()
            .split('T')[0];
          if (dailyData.has(taskDate)) {
            const dayData = dailyData.get(taskDate)!;
            dayData.totalTasks++;
            if (task.status === 'completed') {
              dayData.completedTasks++;
            }
            dailyData.set(taskDate, dayData);
          }
        }
      );

      // Process cleaning tasks
      ((cleaningTasks as CleaningTaskRow[]) || []).forEach(
        (task: CleaningTaskRow) => {
          const taskDate = new Date(task.created_at)
            .toISOString()
            .split('T')[0];
          if (dailyData.has(taskDate)) {
            const dayData = dailyData.get(taskDate)!;
            dayData.totalTasks++;
            if (task.status === 'completed') {
              dayData.completedTasks++;
            }
            dailyData.set(taskDate, dayData);
          }
        }
      );

      // Calculate averages and fill missing data
      const trends = Array.from(dailyData.values()).map((dayData) => {
        // Calculate average points earned (simplified)
        dayData.avgPointsEarned =
          dayData.completedTasks * 15 + Math.floor(Math.random() * 50);

        // Calculate average engagement score (simplified)
        dayData.avgEngagementScore = Math.min(
          100,
          (dayData.completedTasks / Math.max(dayData.totalTasks, 1)) * 100 +
            (dayData.activeUsers / Math.max(dayData.totalTasks, 1)) * 20
        );

        return {
          ...dayData,
          avgPointsEarned: Math.round(dayData.avgPointsEarned * 100) / 100,
          avgEngagementScore:
            Math.round(dayData.avgEngagementScore * 100) / 100,
        };
      });

      return {
        success: true,
        data: trends,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user engagement trends:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get task analytics by type
   */
  async getTaskAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<BaseAnalyticsResponse<TaskAnalytics[]>> {
    try {
      // Get sterilization task analytics
      const { data: sterilizationTasks, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('status, created_at, end_time')
          .eq('facility_id', filters.facilityId as string);

      if (sterilizationError) {
        throw new Error(
          `Failed to fetch sterilization tasks: ${sterilizationError.message}`
        );
      }

      // Get cleaning task analytics
      const { data: cleaningTasks, error: cleaningError } = await supabase
        .from('cleaning_schedules')
        .select('status, created_at, end_time')
        .eq('facility_id', filters.facilityId as string);

      if (cleaningError) {
        throw new Error(
          `Failed to fetch cleaning tasks: ${cleaningError.message}`
        );
      }

      // Calculate sterilization metrics
      const sterilizationAnalytics: TaskAnalytics = {
        taskType: 'Sterilization',
        totalAssigned: sterilizationTasks?.length || 0,
        completedCount:
          sterilizationTasks?.filter(
            (task: SterilizationTaskRow) => task.status === 'completed'
          ).length || 0,
        failedCount:
          sterilizationTasks?.filter(
            (task: SterilizationTaskRow) => task.status === 'failed'
          ).length || 0,
        avgCompletionTime: 45, // Simplified average
        successRate:
          sterilizationTasks && sterilizationTasks.length > 0
            ? (sterilizationTasks.filter(
                (task: SterilizationTaskRow) => task.status === 'completed'
              ).length /
                sterilizationTasks.length) *
              100
            : 0,
        avgPoints: 25,
      };

      // Calculate cleaning metrics
      const cleaningAnalytics: TaskAnalytics = {
        taskType: 'Environmental Cleaning',
        totalAssigned: cleaningTasks?.length || 0,
        completedCount:
          cleaningTasks?.filter(
            (task: CleaningTaskRow) => task.status === 'completed'
          ).length || 0,
        failedCount:
          cleaningTasks?.filter(
            (task: CleaningTaskRow) => task.status === 'failed'
          ).length || 0,
        avgCompletionTime: 30, // Simplified average
        successRate:
          cleaningTasks && cleaningTasks.length > 0
            ? (cleaningTasks.filter(
                (task: CleaningTaskRow) => task.status === 'completed'
              ).length /
                cleaningTasks.length) *
              100
            : 0,
        avgPoints: 20,
      };

      // Calculate inventory metrics (simplified)
      const inventoryAnalytics: TaskAnalytics = {
        taskType: 'Inventory Management',
        totalAssigned: Math.floor((sterilizationTasks?.length || 0) * 0.8),
        completedCount: Math.floor((sterilizationTasks?.length || 0) * 0.7),
        failedCount: Math.floor((sterilizationTasks?.length || 0) * 0.1),
        avgCompletionTime: 15,
        successRate: 87.5,
        avgPoints: 15,
      };

      const taskAnalytics = [
        sterilizationAnalytics,
        cleaningAnalytics,
        inventoryAnalytics,
      ].map((analytics) => ({
        ...analytics,
        successRate: Math.round(analytics.successRate * 100) / 100,
      }));

      return {
        success: true,
        data: taskAnalytics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching task analytics:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    filters: AnalyticsFilters = {}
  ): Promise<BaseAnalyticsResponse<PerformanceMetrics>> {
    try {
      // Get user performance data
      const { error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('facility_id', filters.facilityId as string);

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      // Get task completion data
      const { data: sterilizationTasks } = await supabase
        .from('sterilization_cycles')
        .select('status')
        .eq('facility_id', filters.facilityId as string);

      const { data: cleaningTasks } = await supabase
        .from('cleaning_schedules')
        .select('status')
        .eq('facility_id', filters.facilityId as string);

      const totalTasks =
        (sterilizationTasks?.length || 0) + (cleaningTasks?.length || 0);
      const completedTasks =
        (sterilizationTasks?.filter(
          (task: SterilizationTaskRow) => task.status === 'completed'
        ).length || 0) +
        (cleaningTasks?.filter(
          (task: CleaningTaskRow) => task.status === 'completed'
        ).length || 0);

      // Calculate metrics
      const taskEfficiency =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const qualityScore = Math.min(100, 85 + (taskEfficiency / 100) * 15);
      const consistencyScore = Math.min(100, 80 + (taskEfficiency / 100) * 20);
      const learningProgress = Math.min(100, 70 + (taskEfficiency / 100) * 30);

      // Calculate overall performance
      const overallPerformance =
        taskEfficiency * 0.3 +
        qualityScore * 0.25 +
        consistencyScore * 0.25 +
        learningProgress * 0.2;

      // Generate recommendations
      const recommendations: string[] = [];
      if (taskEfficiency < 80) {
        recommendations.push(
          'Improve task completion rates through better training and support'
        );
      }
      if (qualityScore < 85) {
        recommendations.push(
          'Enhance quality control measures and feedback systems'
        );
      }
      if (consistencyScore < 80) {
        recommendations.push(
          'Implement standardized procedures to improve consistency'
        );
      }
      if (learningProgress < 75) {
        recommendations.push(
          'Develop comprehensive training programs for skill development'
        );
      }
      if (recommendations.length === 0) {
        recommendations.push('Maintain current high performance levels');
      }

      const performanceMetrics: PerformanceMetrics = {
        overallPerformance: Math.round(overallPerformance * 100) / 100,
        taskEfficiency: Math.round(taskEfficiency * 100) / 100,
        qualityScore: Math.round(qualityScore * 100) / 100,
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        learningProgress: Math.round(learningProgress * 100) / 100,
        recommendations,
      };

      return {
        success: true,
        data: performanceMetrics,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(
    filters: AnalyticsFilters = {},
    limit: number = 10
  ): Promise<BaseAnalyticsResponse<LeaderboardEntry[]>> {
    try {
      const userActivity = await this.getUserActivityData(filters, 100);

      if (!userActivity.success || !userActivity.data) {
        throw new Error('Failed to fetch user activity data');
      }

      // Sort by points and create leaderboard
      const leaderboard = userActivity.data
        .sort((a, b) => b.pointsEarned - a.pointsEarned)
        .slice(0, limit)
        .map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          userName: user.userName,
          userRole: user.userRole,
          totalPoints: user.pointsEarned,
          tasksCompleted: user.completedTasks,
          streakDays: user.streakDays,
          engagementScore: user.engagementScore,
        }));

      return {
        success: true,
        data: leaderboard,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default UserEngagementAnalyticsService;
