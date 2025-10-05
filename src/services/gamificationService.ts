import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

export interface LevelProgression {
  currentLevel: number;
  nextLevel: number;
  pointsToNextLevel: number;
  totalPoints: number;
  rank: number;
  rankPercentile: number;
}

export interface GamificationUpdate {
  userId: string;
  facilityId: string;
  pointsEarned: number;
  taskTitle: string;
  taskCategory: string;
}

class GamificationService {
  /**
   * Calculate level based on total points
   */
  calculateLevel(totalPoints: number): number {
    // Level progression: Level 1 = 0-99, Level 2 = 100-249, Level 3 = 250-499, etc.
    if (totalPoints < 100) return 1;
    if (totalPoints < 250) return 2;
    if (totalPoints < 500) return 3;
    if (totalPoints < 750) return 4;
    if (totalPoints < 1000) return 5;

    // For higher levels, use exponential progression
    return Math.floor(Math.log(totalPoints / 100) / Math.log(1.5)) + 5;
  }

  /**
   * Calculate points needed for next level
   */
  calculatePointsToNextLevel(
    currentLevel: number,
    totalPoints: number
  ): number {
    const nextLevelThreshold = this.getLevelThreshold(currentLevel + 1);
    return Math.max(0, nextLevelThreshold - totalPoints);
  }

  /**
   * Get points threshold for a specific level
   */
  getLevelThreshold(level: number): number {
    if (level <= 1) return 0;
    if (level <= 5) {
      const thresholds = [0, 100, 250, 500, 750, 1000];
      return thresholds[level - 1];
    }

    // Exponential progression for higher levels
    return Math.floor(100 * Math.pow(1.5, level - 5));
  }

  /**
   * Calculate user rank within facility
   */
  async calculateUserRank(
    userId: string,
    facilityId: string
  ): Promise<{ rank: number; percentile: number }> {
    try {
      // Get all users in facility with their total points
      const { data: facilityUsers, error } = await supabase
        .from('home_challenge_completions')
        .select('user_id, points_earned')
        .eq('facility_id', facilityId);

      if (error) {
        console.error('Error fetching facility users for ranking:', error);
        return { rank: 1, percentile: 100 };
      }

      // Calculate total points per user
      const userPointsMap = new Map<string, number>();
      facilityUsers?.forEach((completion) => {
        const userId = completion.user_id as string;
        const points = completion.points_earned as number;
        userPointsMap.set(userId, (userPointsMap.get(userId) || 0) + points);
      });

      // Sort users by points (descending)
      const sortedUsers = Array.from(userPointsMap.entries()).sort(
        ([, a], [, b]) => b - a
      );

      // Find current user's rank
      const userIndex = sortedUsers.findIndex(([id]) => id === userId);
      const rank = userIndex === -1 ? sortedUsers.length : userIndex + 1;
      const percentile = Math.round(
        (1 - (rank - 1) / sortedUsers.length) * 100
      );

      return { rank, percentile };
    } catch (error) {
      console.error('Error calculating user rank:', error);
      return { rank: 1, percentile: 100 };
    }
  }

  /**
   * Update gamification data after task completion
   */
  async updateGamificationData(
    update: GamificationUpdate
  ): Promise<LevelProgression> {
    try {
      // Get current user's total points
      const { data: completions, error } = await supabase
        .from('home_challenge_completions')
        .select('points_earned')
        .eq('user_id', update.userId)
        .eq('facility_id', update.facilityId);

      if (error) {
        console.error('Error fetching user completions:', error);
        throw error;
      }

      const totalPoints = (completions || []).reduce(
        (sum, completion) => sum + (completion.points_earned as number),
        0
      );

      // Calculate level progression
      const currentLevel = this.calculateLevel(totalPoints);
      const nextLevel = currentLevel + 1;
      const pointsToNextLevel = this.calculatePointsToNextLevel(
        currentLevel,
        totalPoints
      );

      // Calculate rank
      const { rank, percentile } = await this.calculateUserRank(
        update.userId,
        update.facilityId
      );

      const progression: LevelProgression = {
        currentLevel,
        nextLevel,
        pointsToNextLevel,
        totalPoints,
        rank,
        rankPercentile: percentile,
      };

      // Log the update
      logger.info('Gamification update:', {
        userId: update.userId,
        pointsEarned: update.pointsEarned,
        totalPoints,
        currentLevel,
        rank,
        taskTitle: update.taskTitle,
      });

      return progression;
    } catch (error) {
      console.error('Error updating gamification data:', error);
      throw error;
    }
  }

  /**
   * Check if user leveled up
   */
  async checkLevelUp(
    userId: string,
    facilityId: string,
    previousPoints: number
  ): Promise<boolean> {
    try {
      const { data: completions, error } = await supabase
        .from('home_challenge_completions')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('facility_id', facilityId);

      if (error) {
        console.error(
          'Error fetching user completions for level check:',
          error
        );
        return false;
      }

      const currentPoints = (completions || []).reduce(
        (sum, completion) => sum + (completion.points_earned as number),
        0
      );

      const previousLevel = this.calculateLevel(previousPoints);
      const currentLevel = this.calculateLevel(currentPoints);

      return currentLevel > previousLevel;
    } catch (error) {
      console.error('Error checking level up:', error);
      return false;
    }
  }

  /**
   * Get gamification summary for user
   */
  async getGamificationSummary(
    userId: string,
    facilityId: string
  ): Promise<LevelProgression> {
    try {
      const { data: completions, error } = await supabase
        .from('home_challenge_completions')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('facility_id', facilityId);

      if (error) {
        console.error('Error fetching gamification summary:', error);
        throw error;
      }

      const totalPoints = (completions || []).reduce(
        (sum, completion) => sum + (completion.points_earned as number),
        0
      );

      const currentLevel = this.calculateLevel(totalPoints);
      const nextLevel = currentLevel + 1;
      const pointsToNextLevel = this.calculatePointsToNextLevel(
        currentLevel,
        totalPoints
      );
      const { rank, percentile } = await this.calculateUserRank(
        userId,
        facilityId
      );

      return {
        currentLevel,
        nextLevel,
        pointsToNextLevel,
        totalPoints,
        rank,
        rankPercentile: percentile,
      };
    } catch (error) {
      console.error('Error getting gamification summary:', error);
      throw error;
    }
  }
}

export const gamificationService = new GamificationService();
