import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface LeaderboardData {
  users: LeaderboardUser[];
  userRank: number;
  totalUsers: number;
}

class LeaderboardService {
  private getCachedUser() {
    // For development, provide a mock user context
    if (process.env.NODE_ENV === 'development') {
      return {
        id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
      };
    }

    // In production, get from auth context
    return null;
  }

  async fetchLeaderboardData(): Promise<LeaderboardData> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        logger.debug(
          'leaderboardService: No authenticated user found, returning empty data'
        );
        return { users: [], userRank: 1, totalUsers: 0 };
      }

      logger.debug(
        'leaderboardService: Fetching leaderboard data for facility:',
        user.facility_id
      );

      // Fetch leaderboard data: sum of points by user (avoiding users table join due to RLS)
      const { data: leaderboardData, error } = await supabase
        .from('home_challenge_completions')
        .select(
          `
          user_id,
          points_earned
        `
        )
        .eq('facility_id', user.facility_id);

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return { users: [], userRank: 1, totalUsers: 0 };
      }

      // Aggregate points by user
      const userPoints = new Map<string, { points: number }>();

      leaderboardData?.forEach((completion) => {
        const userId = completion.user_id;
        const points = completion.points_earned || 0;

        if (userPoints.has(userId as string)) {
          userPoints.get(userId as string)!.points += points as number;
        } else {
          userPoints.set(userId as string, { points: points as number });
        }
      });

      // Convert to array and sort by points (descending)
      const sortedUsers = Array.from(userPoints.entries())
        .map(([userId, userData]) => ({
          id: userId,
          name: `User ${userId.slice(0, 8)}`, // Use truncated user ID as name
          score: userData.points,
          rank: 0, // Will be calculated below
          avatar: '👤',
        }))
        .sort((a, b) => b.score - a.score);

      // Calculate ranks
      let currentRank = 1;
      let currentScore = sortedUsers[0]?.score || 0;

      sortedUsers.forEach((user, index) => {
        if (user.score < currentScore) {
          currentRank = index + 1;
          currentScore = user.score;
        }
        user.rank = currentRank;
      });

      // Find current user's rank
      const currentUserRank =
        sortedUsers.find((leaderboardUser) => leaderboardUser.id === user.id)
          ?.rank || 1;

      logger.debug('leaderboardService: Calculated leaderboard:', {
        totalUsers: sortedUsers.length,
        userRank: currentUserRank,
        topUsers: sortedUsers.slice(0, 5),
      });

      return {
        users: sortedUsers,
        userRank: currentUserRank,
        totalUsers: sortedUsers.length,
      };
    } catch (error) {
      console.error('Error in fetchLeaderboardData:', error);
      return { users: [], userRank: 1, totalUsers: 0 };
    }
  }
}

export const leaderboardService = new LeaderboardService();
