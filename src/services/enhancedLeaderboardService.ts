import { supabase } from '../lib/supabaseClient';
import { calculateEnhancedLevel } from '../utils/enhancedGamification';

// Database row interfaces
interface UserRow {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  department: string | null;
  role: string | null;
  facility_id: string;
}

interface UserGamificationStatsRow {
  total_points: number;
  current_streak: number;
}

interface ActivityLogRow {
  id: string;
  user_id: string;
  completed_at: string;
  points_earned: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coreLevel: number;
  totalPoints: number;
  currentStreak: number;
  skillLevels: {
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
    overall: number;
  };
  achievements: number;
  rank: number;
  department?: string;
  role?: string;
}

export interface SkillLeaderboard {
  sterilization: LeaderboardUser[];
  inventory: LeaderboardUser[];
  environmental: LeaderboardUser[];
  knowledge: LeaderboardUser[];
  overall: LeaderboardUser[];
}

export class EnhancedLeaderboardService {
  /**
   * Get comprehensive leaderboard for a facility
   */
  async getFacilityLeaderboard(facilityId: string): Promise<LeaderboardUser[]> {
    try {
      // Get all users in the facility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: users, error } = await (supabase as any)
        .from('users')
        .select(
          `
          id,
          name,
          email,
          avatar,
          department,
          role,
          facility_id
        `
        )
        .eq('facility_id', facilityId);

      if (error || !users) {
        console.error('Error fetching facility users:', error);
        return [];
      }

      if (!users) return [];

      // Calculate enhanced levels for all users
      const leaderboardUsers: LeaderboardUser[] = [];

      for (const user of users as UserRow[]) {
        try {
          const enhancedLevel = await calculateEnhancedLevel(
            user.id,
            facilityId
          );

          // Get user's basic stats
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: userStats } = await (supabase as any)
            .from('user_gamification_stats')
            .select('total_points, current_streak')
            .eq('user_id', user.id)
            .eq('facility_id', facilityId)
            .single();

          const totalPoints =
            (userStats as UserGamificationStatsRow)?.total_points || 0;
          const currentStreak =
            (userStats as UserGamificationStatsRow)?.current_streak || 0;

          leaderboardUsers.push({
            id: user.id,
            name: user.full_name || 'Unknown User',
            email: user.email || '',
            avatar: user.avatar || undefined,
            coreLevel: enhancedLevel.coreLevel,
            totalPoints: totalPoints,
            currentStreak: currentStreak,
            skillLevels: enhancedLevel.skillLevels,
            achievements: enhancedLevel.achievements.filter(
              (a: { unlocked: boolean }) => a.unlocked
            ).length,
            rank: 0, // Will be calculated below
            department: user.department || undefined,
            role: user.role || undefined,
          });
        } catch (error) {
          console.error(`Error calculating level for user ${user.id}:`, error);
          // Add user with default values
          leaderboardUsers.push({
            id: user.id,
            name: user.full_name || 'Unknown User',
            email: user.email || '',
            avatar: user.avatar || undefined,
            coreLevel: 1,
            totalPoints: 0,
            currentStreak: 0,
            skillLevels: {
              sterilization: 1,
              inventory: 1,
              environmental: 1,
              knowledge: 1,
              overall: 1,
            },
            achievements: 0,
            rank: 0,
            department: user.department || undefined,
            role: user.role || undefined,
          });
        }
      }

      // Sort by core level (primary) and total points (secondary)
      leaderboardUsers.sort((a, b) => {
        if (b.coreLevel !== a.coreLevel) {
          return b.coreLevel - a.coreLevel;
        }
        return b.totalPoints - a.totalPoints;
      });

      // Assign ranks
      leaderboardUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      return leaderboardUsers;
    } catch (error) {
      console.error('Error getting facility leaderboard:', error);
      return [];
    }
  }

  /**
   * Get skill-specific leaderboards
   */
  async getSkillLeaderboards(facilityId: string): Promise<SkillLeaderboard> {
    try {
      const allUsers = await this.getFacilityLeaderboard(facilityId);

      // Create skill-specific leaderboards
      const skillLeaderboards: SkillLeaderboard = {
        sterilization: [...allUsers].sort(
          (a, b) => b.skillLevels.sterilization - a.skillLevels.sterilization
        ),
        inventory: [...allUsers].sort(
          (a, b) => b.skillLevels.inventory - a.skillLevels.inventory
        ),
        environmental: [...allUsers].sort(
          (a, b) => b.skillLevels.environmental - a.skillLevels.environmental
        ),
        knowledge: [...allUsers].sort(
          (a, b) => b.skillLevels.knowledge - a.skillLevels.knowledge
        ),
        overall: [...allUsers].sort(
          (a, b) => b.skillLevels.overall - a.skillLevels.overall
        ),
      };

      // Assign skill-specific ranks
      Object.keys(skillLeaderboards).forEach((skill: string) => {
        (
          skillLeaderboards[
            skill as keyof SkillLeaderboard
          ] as LeaderboardUser[]
        ).forEach(() => {
          // Note: This doesn't modify the original user object, just the skill-specific arrays
        });
      });

      return skillLeaderboards;
    } catch (error) {
      console.error('Error getting skill leaderboards:', error);
      return {
        sterilization: [],
        inventory: [],
        environmental: [],
        knowledge: [],
        overall: [],
      };
    }
  }

  /**
   * Get user's position in various leaderboards
   */
  async getUserLeaderboardPosition(
    userId: string,
    facilityId: string
  ): Promise<{
    overall: number;
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
  }> {
    try {
      const skillLeaderboards = await this.getSkillLeaderboards(facilityId);

      const findUserRank = (leaderboard: LeaderboardUser[]) => {
        const userIndex = leaderboard.findIndex((u) => u.id === userId);
        return userIndex === -1 ? leaderboard.length : userIndex + 1;
      };

      return {
        overall: findUserRank(skillLeaderboards.overall),
        sterilization: findUserRank(skillLeaderboards.sterilization),
        inventory: findUserRank(skillLeaderboards.inventory),
        environmental: findUserRank(skillLeaderboards.environmental),
        knowledge: findUserRank(skillLeaderboards.knowledge),
      };
    } catch (error) {
      console.error('Error getting user leaderboard position:', error);
      return {
        overall: 1,
        sterilization: 1,
        inventory: 1,
        environmental: 1,
        knowledge: 1,
      };
    }
  }

  /**
   * Get top performers in specific categories
   */
  async getTopPerformers(
    facilityId: string,
    category:
      | 'overall'
      | 'sterilization'
      | 'inventory'
      | 'environmental'
      | 'knowledge',
    limit: number = 10
  ): Promise<LeaderboardUser[]> {
    try {
      const skillLeaderboards = await this.getSkillLeaderboards(facilityId);
      return skillLeaderboards[category].slice(0, limit);
    } catch (error) {
      console.error(`Error getting top performers for ${category}:`, error);
      return [];
    }
  }

  /**
   * Get department-based leaderboards
   */
  async getDepartmentLeaderboards(
    facilityId: string
  ): Promise<Record<string, LeaderboardUser[]>> {
    try {
      const allUsers = await this.getFacilityLeaderboard(facilityId);

      // Group users by department
      const departmentGroups: Record<string, LeaderboardUser[]> = {};

      allUsers.forEach((user: LeaderboardUser) => {
        const dept = (user.department as string) || 'Unassigned';
        if (!departmentGroups[dept]) {
          departmentGroups[dept] = [];
        }
        departmentGroups[dept].push(user);
      });

      // Sort each department by overall performance
      Object.keys(departmentGroups).forEach((dept: string) => {
        departmentGroups[dept].sort((a, b) => b.coreLevel - a.coreLevel);
      });

      return departmentGroups;
    } catch (error) {
      console.error('Error getting department leaderboards:', error);
      return {};
    }
  }

  /**
   * Get recent activity for leaderboard context
   */
  async getRecentActivity(
    facilityId: string,
    limit: number = 20
  ): Promise<Array<{ id: string; [key: string]: unknown }>> {
    try {
      // Get recent task completions, achievements, etc.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: recentActivity } = await (supabase as any)
        .from('home_challenge_completions')
        .select('id, user_id, completed_at, points_earned')
        .eq('facility_id', facilityId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (!recentActivity) return [];

      return ((recentActivity as ActivityLogRow[]) || []).map(
        (item: ActivityLogRow) => ({
          id: item.id,
          user_id: item.user_id,
          completed_at: item.completed_at,
          points_earned: item.points_earned,
        })
      );
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}

export const enhancedLeaderboardService = new EnhancedLeaderboardService();
