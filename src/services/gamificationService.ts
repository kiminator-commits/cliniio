import type {
  GamificationStats,
  LeaderboardData,
  ChallengeData,
  MetricsData,
} from '../types/home';
import { supabase } from '../lib/supabaseClient';

// Database row interfaces
interface UserGamificationStatsRow {
  current_streak: number;
  total_points: number;
  total_tasks: number;
  completed_tasks: number;
  best_streak: number;
}

interface UserLeaderboardRow {
  user_id: string;
  total_points: number;
  current_streak: number;
}

interface UserRow {
  id: string;
  full_name: string | null;
}

interface ChallengeRow {
  title: string;
  description: string;
  points: number;
  difficulty: string;
}

interface MetricsRow {
  metric_name: string;
  metric_value: number;
}

export interface GamificationServiceResponse {
  gamificationData: GamificationStats;
  leaderboardData: LeaderboardData;
  challengeData: ChallengeData;
  metricsData: MetricsData;
}

export interface GamificationService {
  fetchGamificationData(): Promise<GamificationStats>;
  fetchLeaderboardData(): Promise<LeaderboardData>;
  fetchChallengeData(): Promise<ChallengeData>;
  fetchMetricsData(): Promise<MetricsData>;
  fetchAllData(): Promise<GamificationServiceResponse>;
}

/**
 * Gamification service for managing gamification data
 */
class GamificationServiceImpl implements GamificationService {
  private cachedData: Partial<GamificationServiceResponse> = {};

  private async getCurrentFacilityId(): Promise<string> {
    try {
      const { FacilityService } = await import('./facilityService');
      const { facilityId } = await FacilityService.getCurrentUserAndFacility();
      return facilityId;
    } catch (error) {
      console.error('Failed to get current facility ID:', error);
      throw error;
    }
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.error('Error getting user:', error);
        return null;
      }
      return data.user.id;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async fetchGamificationData(): Promise<GamificationStats> {
    if (this.cachedData.gamificationData) {
      return this.cachedData.gamificationData;
    }

    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return this.getDefaultGamificationData();
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          const { calculateEnhancedLevel } = await import(
            '../utils/enhancedGamification'
          );
          const facilityId = await this.getCurrentFacilityId();
          const enhancedData = await calculateEnhancedLevel(userId, facilityId);

          const gamificationData: GamificationStats = {
            streak: enhancedData.totalExperience > 0 ? 1 : 0,
            level: enhancedData.coreLevel,
            rank: enhancedData.rank,
            totalScore: enhancedData.totalExperience,
            stats: {
              toolsSterilized: 0,
              inventoryChecks: 0,
              perfectDays: 0,
              totalTasks: 0,
              completedTasks: 0,
              currentStreak: enhancedData.totalExperience > 0 ? 1 : 0,
              bestStreak: enhancedData.totalExperience > 0 ? 1 : 0,
            },
          };

          this.cachedData.gamificationData = gamificationData;
          return gamificationData;
        }
      } catch {
        // TODO: handle error
      }

      const facilityId = await this.getCurrentFacilityId();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .single();

      if (error || !data) {
        return this.getDefaultGamificationData();
      }

      const statsData = data as UserGamificationStatsRow;
      const gamificationData: GamificationStats = {
        streak: statsData.current_streak ?? 0,
        level: 1, // Calculate level based on total_points
        rank: 999, // This would need to be calculated separately
        totalScore: statsData.total_points ?? 0,
        stats: {
          toolsSterilized: 0, // Not available in this table
          inventoryChecks: 0, // Not available in this table
          perfectDays: 0, // Not available in this table
          totalTasks: statsData.total_tasks ?? 0,
          completedTasks: statsData.completed_tasks ?? 0,
          currentStreak: statsData.current_streak ?? 0,
          bestStreak: statsData.best_streak ?? 0,
        },
      };

      this.cachedData.gamificationData = gamificationData;
      return gamificationData;
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      return this.getDefaultGamificationData();
    }
  }

  private getDefaultGamificationData(): GamificationStats {
    return {
      streak: 0,
      level: 1,
      rank: 999,
      totalScore: 0,
      stats: {
        toolsSterilized: 0,
        inventoryChecks: 0,
        perfectDays: 0,
        totalTasks: 0,
        completedTasks: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
    };
  }

  async fetchLeaderboardData(): Promise<LeaderboardData> {
    if (this.cachedData.leaderboardData) {
      return this.cachedData.leaderboardData;
    }

    try {
      const facilityId = await this.getCurrentFacilityId();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('user_gamification_stats')
        .select('user_id, total_points')
        .eq('facility_id', facilityId)
        .order('total_points', { ascending: false })
        .limit(10);

      if (error || !data) {
        return this.getDefaultLeaderboardData();
      }

      const leaderboardData = data as UserLeaderboardRow[];
      const userIds = leaderboardData.map(
        (item: UserLeaderboardRow) => item.user_id
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users, error: usersError } = await (supabase as any)
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      if (usersError || !users) {
        return this.getDefaultLeaderboardData();
      }

      const userData = users as UserRow[];
      const userMap = new Map(
        userData.map((user: UserRow) => [user.id, user.full_name ?? ''])
      );

      const leaderboardDataResult: LeaderboardData = {
        rank: 999,
        topUsers: leaderboardData.map((item: UserLeaderboardRow) => ({
          name: userMap.get(item.user_id) || 'Unknown User',
          score: item.total_points ?? 0,
          avatar: (userMap.get(item.user_id) || 'UU')
            .substring(0, 2)
            .toUpperCase(),
        })),
      };

      this.cachedData.leaderboardData = leaderboardDataResult;
      return leaderboardDataResult;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return this.getDefaultLeaderboardData();
    }
  }

  private getDefaultLeaderboardData(): LeaderboardData {
    return { rank: 999, topUsers: [] };
  }

  async fetchChallengeData(): Promise<ChallengeData> {
    if (this.cachedData.challengeData) {
      return this.cachedData.challengeData;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('home_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !data) {
        return this.getDefaultChallengeData();
      }

      const challengeDataArray = data as ChallengeRow[];
      const challengeData: ChallengeData = {
        title: challengeDataArray[0]?.title ?? 'Default Challenge',
        description:
          challengeDataArray[0]?.description ?? 'Complete daily tasks',
        reward: challengeDataArray[0]?.points?.toString() ?? '10',
        difficulty: challengeDataArray[0]?.difficulty ?? 'easy',
      };

      this.cachedData.challengeData = challengeData;
      return challengeData;
    } catch (error) {
      console.error('Error fetching challenge data:', error);
      return this.getDefaultChallengeData();
    }
  }

  private getDefaultChallengeData(): ChallengeData {
    return {
      title: 'Default Challenge',
      description: 'Complete daily tasks',
      reward: '10',
      difficulty: 'easy',
    };
  }

  async fetchMetricsData(): Promise<MetricsData> {
    if (this.cachedData.metricsData) {
      return this.cachedData.metricsData;
    }

    try {
      const userId = await this.getCurrentUserId();
      const facilityId = await this.getCurrentFacilityId();
      if (!userId || !facilityId) {
        return this.getDefaultMetricsData();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('performance_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('facility_id', facilityId);

      if (error || !data) {
        return this.getDefaultMetricsData();
      }

      // Convert key-value pairs to structured data
      const metricsDataArray = data as MetricsRow[];
      const metricsMap = new Map(
        metricsDataArray.map((item: MetricsRow) => [
          item.metric_name,
          item.metric_value,
        ])
      );

      const metricsData: MetricsData = {
        timeSaved: {
          daily: metricsMap.get('time_saved_daily') ?? 0,
          monthly: metricsMap.get('time_saved_monthly') ?? 0,
        },
        costSavings: {
          monthly: metricsMap.get('cost_savings_monthly') ?? 0,
          annual: metricsMap.get('cost_savings_annual') ?? 0,
        },
        aiEfficiency: {
          timeSavings: metricsMap.get('ai_time_savings') ?? 0,
          proactiveMgmt: metricsMap.get('ai_proactive_mgmt') ?? 0,
        },
        teamPerformance: {
          skills: metricsMap.get('team_skills_score') ?? 0,
          inventory: metricsMap.get('team_inventory_score') ?? 0,
          sterilization: metricsMap.get('team_sterilization_score') ?? 0,
        },
      };

      this.cachedData.metricsData = metricsData;
      return metricsData;
    } catch (error) {
      console.error('Error fetching metrics data:', error);
      return this.getDefaultMetricsData();
    }
  }

  private getDefaultMetricsData(): MetricsData {
    return {
      timeSaved: { daily: 0, monthly: 0 },
      costSavings: { monthly: 0, annual: 0 },
      aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
      teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
    };
  }

  async fetchAllData(): Promise<GamificationServiceResponse> {
    const [gamificationData, leaderboardData, challengeData, metricsData] =
      await Promise.all([
        this.fetchGamificationData(),
        this.fetchLeaderboardData(),
        this.fetchChallengeData(),
        this.fetchMetricsData(),
      ]);
    return { gamificationData, leaderboardData, challengeData, metricsData };
  }

  clearCache(): void {
    this.cachedData = {};
  }
}

export const gamificationService = new GamificationServiceImpl();
export const createGamificationService = (): GamificationService =>
  new GamificationServiceImpl();
