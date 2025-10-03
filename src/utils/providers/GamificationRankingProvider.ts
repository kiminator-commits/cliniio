import { supabase } from '../../lib/supabaseClient';
import { UserStatsRow, SkillLevels } from './GamificationTypes';

export interface UserRanking {
  userId: string;
  userName: string;
  rank: number;
  points: number;
  level: number;
  skillLevels?: SkillLevels;
}

export interface SkillRanking {
  skill: keyof Omit<SkillLevels, 'overall'>;
  rankings: Array<{
    userId: string;
    userName: string;
    rank: number;
    skillLevel: number;
  }>;
}

export class GamificationRankingProvider {
  /**
   * Calculate user rank among facility users
   */
  async calculateUserRank(
    userId: string,
    facilityId: string
  ): Promise<number> {
    try {
      // Get all users in facility and their points
      const { data: users } = await supabase
        .from('users')
        .select('id, total_points')
        .eq('facility_id', facilityId)
        .not('total_points', 'is', null);

      if (!users || users.length === 0) return 1;

      const usersData = users as UserStatsRow[];

      // Sort by points and find user's position
      const sortedUsers = usersData.sort(
        (a, b) => (b.total_points || 0) - (a.total_points || 0)
      );
      const userIndex = sortedUsers.findIndex((u) => u.id === userId);

      if (userIndex === -1) return users.length;

      // Return rank (1-based)
      return userIndex + 1;
    } catch (error) {
      console.error('Error calculating user rank:', error);
      return 1;
    }
  }

  /**
   * Calculate skill rankings
   */
  async calculateSkillRankings(): Promise<{
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
  }> {
    try {
      // This would calculate rankings for each skill category
      // For now, return default rankings
      return {
        sterilization: 1,
        inventory: 1,
        environmental: 1,
        knowledge: 1,
      };
    } catch (error) {
      console.error('Error calculating skill rankings:', error);
      return { sterilization: 1, inventory: 1, environmental: 1, knowledge: 1 };
    }
  }

  /**
   * Get facility leaderboard
   */
  async getFacilityLeaderboard(
    facilityId: string,
    limit: number = 10
  ): Promise<UserRanking[]> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, total_points')
        .eq('facility_id', facilityId)
        .not('total_points', 'is', null)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (!users) return [];

      return users.map((user, index) => ({
        userId: user.id,
        userName: user.full_name || 'Unknown User',
        rank: index + 1,
        points: user.total_points || 0,
        level: this.calculateLevelFromPoints(user.total_points || 0),
      }));
    } catch (error) {
      console.error('Error getting facility leaderboard:', error);
      return [];
    }
  }

  /**
   * Get user's position in leaderboard
   */
  async getUserLeaderboardPosition(
    userId: string,
    facilityId: string
  ): Promise<{
    rank: number;
    totalUsers: number;
    percentile: number;
    aboveUsers: number;
    belowUsers: number;
  }> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, total_points')
        .eq('facility_id', facilityId)
        .not('total_points', 'is', null);

      if (!users || users.length === 0) {
        return {
          rank: 1,
          totalUsers: 0,
          percentile: 100,
          aboveUsers: 0,
          belowUsers: 0,
        };
      }

      const sortedUsers = users.sort(
        (a, b) => (b.total_points || 0) - (a.total_points || 0)
      );

      const userIndex = sortedUsers.findIndex(u => u.id === userId);
      const userRank = userIndex + 1;
      const totalUsers = users.length;
      const percentile = ((totalUsers - userRank + 1) / totalUsers) * 100;
      const aboveUsers = userRank - 1;
      const belowUsers = totalUsers - userRank;

      return {
        rank: userRank,
        totalUsers,
        percentile,
        aboveUsers,
        belowUsers,
      };
    } catch (error) {
      console.error('Error getting user leaderboard position:', error);
      return {
        rank: 1,
        totalUsers: 0,
        percentile: 100,
        aboveUsers: 0,
        belowUsers: 0,
      };
    }
  }

  /**
   * Get skill-specific rankings
   */
  async getSkillRankings(
    facilityId: string,
    skill: keyof Omit<SkillLevels, 'overall'>,
    _limit: number = 10
  ): Promise<SkillRanking> {
    try {
      // This would query skill-specific data and calculate rankings
      // For now, return mock data structure
      return {
        skill,
        rankings: [],
      };
    } catch (error) {
      console.error('Error getting skill rankings:', error);
      return {
        skill,
        rankings: [],
      };
    }
  }

  /**
   * Get ranking statistics
   */
  getRankingStatistics(rankings: UserRanking[]): {
    totalUsers: number;
    averagePoints: number;
    medianPoints: number;
    topPoints: number;
    bottomPoints: number;
    distribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
  } {
    if (rankings.length === 0) {
      return {
        totalUsers: 0,
        averagePoints: 0,
        medianPoints: 0,
        topPoints: 0,
        bottomPoints: 0,
        distribution: [],
      };
    }

    const points = rankings.map(r => r.points).sort((a, b) => a - b);
    const totalUsers = rankings.length;
    const averagePoints = points.reduce((sum, p) => sum + p, 0) / totalUsers;
    const medianPoints = points[Math.floor(totalUsers / 2)];
    const topPoints = Math.max(...points);
    const bottomPoints = Math.min(...points);

    // Create distribution ranges
    const ranges = [
      { min: 0, max: 100, label: '0-100' },
      { min: 101, max: 500, label: '101-500' },
      { min: 501, max: 1000, label: '501-1000' },
      { min: 1001, max: 2500, label: '1001-2500' },
      { min: 2501, max: 5000, label: '2501-5000' },
      { min: 5001, max: Infinity, label: '5000+' },
    ];

    const distribution = ranges.map(range => {
      const count = points.filter(p => p >= range.min && p <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: (count / totalUsers) * 100,
      };
    });

    return {
      totalUsers,
      averagePoints,
      medianPoints,
      topPoints,
      bottomPoints,
      distribution,
    };
  }

  /**
   * Get ranking trends
   */
  getRankingTrends(
    currentRankings: UserRanking[],
    previousRankings: UserRanking[]
  ): Array<{
    userId: string;
    userName: string;
    currentRank: number;
    previousRank: number;
    rankChange: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const trends: Array<{
      userId: string;
      userName: string;
      currentRank: number;
      previousRank: number;
      rankChange: number;
      trend: 'up' | 'down' | 'stable';
    }> = [];

    currentRankings.forEach(current => {
      const previous = previousRankings.find(p => p.userId === current.userId);
      const previousRank = previous?.rank || currentRankings.length + 1;
      const rankChange = previousRank - current.rank; // Positive means improvement
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (rankChange > 0) trend = 'up';
      else if (rankChange < 0) trend = 'down';

      trends.push({
        userId: current.userId,
        userName: current.userName,
        currentRank: current.rank,
        previousRank,
        rankChange,
        trend,
      });
    });

    return trends.sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange));
  }

  /**
   * Get ranking badges
   */
  getRankingBadges(rank: number): Array<{
    type: 'rank' | 'percentile' | 'achievement';
    name: string;
    description: string;
    icon: string;
  }> {
    const badges: Array<{
      type: 'rank' | 'percentile' | 'achievement';
      name: string;
      description: string;
      icon: string;
    }> = [];

    // Rank-based badges
    if (rank === 1) {
      badges.push({
        type: 'rank',
        name: 'Champion',
        description: 'Ranked #1 in facility',
        icon: '🥇',
      });
    } else if (rank <= 3) {
      badges.push({
        type: 'rank',
        name: 'Top Performer',
        description: 'Ranked in top 3',
        icon: '🏆',
      });
    } else if (rank <= 10) {
      badges.push({
        type: 'rank',
        name: 'Elite',
        description: 'Ranked in top 10',
        icon: '⭐',
      });
    } else if (rank <= 25) {
      badges.push({
        type: 'rank',
        name: 'Advanced',
        description: 'Ranked in top 25',
        icon: '🎯',
      });
    }

    return badges;
  }

  /**
   * Calculate level from points
   */
  private calculateLevelFromPoints(points: number): number {
    // Simple level calculation based on points
    return Math.max(1, Math.floor(Math.sqrt(points / 500)));
  }

  /**
   * Get ranking categories
   */
  getRankingCategories(): Array<{
    value: string;
    label: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        value: 'overall',
        label: 'Overall',
        description: 'Overall facility ranking',
        icon: '🏆',
      },
      {
        value: 'sterilization',
        label: 'Sterilization',
        description: 'Sterilization skill ranking',
        icon: '🧪',
      },
      {
        value: 'inventory',
        label: 'Inventory',
        description: 'Inventory management ranking',
        icon: '📦',
      },
      {
        value: 'environmental',
        label: 'Environmental',
        description: 'Environmental cleaning ranking',
        icon: '🧽',
      },
      {
        value: 'knowledge',
        label: 'Knowledge',
        description: 'Learning and knowledge ranking',
        icon: '📚',
      },
    ];
  }

  /**
   * Validate ranking data
   */
  validateRankingData(ranking: Partial<UserRanking>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!ranking.userId || ranking.userId.trim() === '') {
      errors.push('User ID is required');
    }

    if (!ranking.userName || ranking.userName.trim() === '') {
      errors.push('User name is required');
    }

    if (ranking.rank !== undefined && ranking.rank < 1) {
      errors.push('Rank must be at least 1');
    }

    if (ranking.points !== undefined && ranking.points < 0) {
      errors.push('Points cannot be negative');
    }

    if (ranking.level !== undefined && (ranking.level < 1 || ranking.level > 100)) {
      errors.push('Level must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export rankings
   */
  exportRankings(rankings: UserRanking[]): string {
    return JSON.stringify(rankings, null, 2);
  }

  /**
   * Import rankings
   */
  importRankings(jsonData: string): {
    success: boolean;
    rankings: UserRanking[];
    errors: string[];
  } {
    try {
      const rankings = JSON.parse(jsonData) as UserRanking[];
      
      if (!Array.isArray(rankings)) {
        return {
          success: false,
          rankings: [],
          errors: ['Invalid format: expected array of rankings'],
        };
      }

      const errors: string[] = [];
      const validRankings: UserRanking[] = [];

      rankings.forEach((ranking, index) => {
        const validation = this.validateRankingData(ranking);
        if (!validation.isValid) {
          errors.push(`Ranking ${index + 1}: ${validation.errors.join(', ')}`);
        } else {
          validRankings.push(ranking as UserRanking);
        }
      });

      return {
        success: errors.length === 0,
        rankings: validRankings,
        errors,
      };
    } catch {
      return {
        success: false,
        rankings: [],
        errors: ['Invalid JSON format'],
      };
    }
  }
}
