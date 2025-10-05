import { SkillLevels, Achievement } from './GamificationTypes';

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  totalTasks: number;
  completedTasks: number;
}

export interface EnhancedLevelData {
  coreLevel: number;
  skillLevels: SkillLevels;
  achievements: Achievement[];
  totalExperience: number;
  levelProgress: number;
  nextLevelThreshold: number;
  rank: number;
  skillRankings: {
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
  };
}

export class GamificationLevelProvider {
  /**
   * Calculate core level using multi-dimensional factors
   */
  calculateCoreLevel(
    stats: UserStats,
    skillLevels: SkillLevels,
    achievements: Achievement[]
  ): number {
    // Base points contribution (40%)
    const pointsContribution = Math.min(stats.totalPoints / 100, 50) * 0.4;

    // Streak contribution (20%)
    const streakContribution = Math.min(stats.currentStreak / 10, 20) * 0.2;

    // Consistency contribution (20%) - based on completion rate
    const completionRate =
      stats.totalTasks > 0 ? stats.completedTasks / stats.totalTasks : 0;
    const consistencyContribution = completionRate * 20 * 0.2;

    // Mastery contribution (20%) - based on skill levels
    const avgSkillLevel =
      (skillLevels.sterilization +
        skillLevels.inventory +
        skillLevels.environmental +
        skillLevels.knowledge) /
      4;
    const masteryContribution = Math.min(avgSkillLevel / 10, 20) * 0.2;

    // Achievement bonus (up to 10% extra)
    const achievementBonus =
      Math.min(
        achievements.filter((a: Achievement) => a.unlocked).length * 0.5,
        10
      ) * 0.1;

    const totalScore =
      pointsContribution +
      streakContribution +
      consistencyContribution +
      masteryContribution +
      achievementBonus;

    // Convert to level (1-100 scale)
    return Math.max(1, Math.min(100, Math.floor(totalScore)));
  }

  /**
   * Calculate level progress percentage
   */
  calculateLevelProgress(totalPoints: number, currentLevel: number): number {
    const currentLevelThreshold = this.getLevelThreshold(currentLevel);
    const nextLevelThreshold = this.getLevelThreshold(currentLevel + 1);
    const levelRange = nextLevelThreshold - currentLevelThreshold;
    const pointsInCurrentLevel = totalPoints - currentLevelThreshold;

    return Math.min(
      100,
      Math.max(0, (pointsInCurrentLevel / levelRange) * 100)
    );
  }

  /**
   * Get level threshold for a given level
   */
  getLevelThreshold(level: number): number {
    return Math.pow(level, 2) * 500;
  }

  /**
   * Get next level threshold
   */
  getNextLevelThreshold(currentLevel: number): number {
    return this.getLevelThreshold(currentLevel + 1);
  }

  /**
   * Get level name based on level number
   */
  getLevelName(level: number): string {
    if (level >= 90) return 'Legendary';
    if (level >= 80) return 'Master';
    if (level >= 70) return 'Expert';
    if (level >= 60) return 'Advanced';
    if (level >= 50) return 'Skilled';
    if (level >= 40) return 'Competent';
    if (level >= 30) return 'Proficient';
    if (level >= 20) return 'Experienced';
    if (level >= 10) return 'Novice';
    return 'Beginner';
  }

  /**
   * Get level color based on level number
   */
  getLevelColor(level: number): string {
    if (level >= 90) return '#8B5CF6'; // Purple
    if (level >= 80) return '#DC2626'; // Red
    if (level >= 70) return '#EA580C'; // Orange
    if (level >= 60) return '#D97706'; // Amber
    if (level >= 50) return '#059669'; // Emerald
    if (level >= 40) return '#0891B2'; // Cyan
    if (level >= 30) return '#2563EB'; // Blue
    if (level >= 20) return '#7C3AED'; // Violet
    if (level >= 10) return '#16A34A'; // Green
    return '#6B7280'; // Gray
  }

  /**
   * Get level badge icon based on level number
   */
  getLevelBadge(level: number): string {
    if (level >= 90) return '🏆';
    if (level >= 80) return '🥇';
    if (level >= 70) return '🥈';
    if (level >= 60) return '🥉';
    if (level >= 50) return '⭐';
    if (level >= 40) return '🌟';
    if (level >= 30) return '💎';
    if (level >= 20) return '🔮';
    if (level >= 10) return '🎯';
    return '🌱';
  }

  /**
   * Calculate experience needed for next level
   */
  getExperienceToNextLevel(
    currentPoints: number,
    currentLevel: number
  ): number {
    const nextLevelThreshold = this.getNextLevelThreshold(currentLevel);
    return Math.max(0, nextLevelThreshold - currentPoints);
  }

  /**
   * Calculate total experience needed for a specific level
   */
  getTotalExperienceForLevel(targetLevel: number): number {
    return this.getLevelThreshold(targetLevel);
  }

  /**
   * Get level distribution statistics
   */
  getLevelDistribution(users: Array<{ level: number }>): {
    totalUsers: number;
    averageLevel: number;
    levelRanges: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    topLevel: number;
    medianLevel: number;
  } {
    const totalUsers = users.length;
    if (totalUsers === 0) {
      return {
        totalUsers: 0,
        averageLevel: 0,
        levelRanges: [],
        topLevel: 0,
        medianLevel: 0,
      };
    }

    const levels = users.map((u) => u.level).sort((a, b) => a - b);
    const averageLevel =
      levels.reduce((sum, level) => sum + level, 0) / totalUsers;
    const topLevel = Math.max(...levels);
    const medianLevel = levels[Math.floor(totalUsers / 2)];

    const levelRanges = [
      { min: 1, max: 10, label: 'Beginner (1-10)' },
      { min: 11, max: 20, label: 'Novice (11-20)' },
      { min: 21, max: 30, label: 'Experienced (21-30)' },
      { min: 31, max: 40, label: 'Proficient (31-40)' },
      { min: 41, max: 50, label: 'Competent (41-50)' },
      { min: 51, max: 60, label: 'Skilled (51-60)' },
      { min: 61, max: 70, label: 'Advanced (61-70)' },
      { min: 71, max: 80, label: 'Expert (71-80)' },
      { min: 81, max: 90, label: 'Master (81-90)' },
      { min: 91, max: 100, label: 'Legendary (91-100)' },
    ].map((range) => {
      const count = levels.filter(
        (level) => level >= range.min && level <= range.max
      ).length;
      return {
        range: range.label,
        count,
        percentage: (count / totalUsers) * 100,
      };
    });

    return {
      totalUsers,
      averageLevel,
      levelRanges,
      topLevel,
      medianLevel,
    };
  }

  /**
   * Validate level data
   */
  validateLevelData(levelData: Partial<EnhancedLevelData>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (levelData.coreLevel !== undefined) {
      if (levelData.coreLevel < 1 || levelData.coreLevel > 100) {
        errors.push('Core level must be between 1 and 100');
      }
    }

    if (levelData.totalExperience !== undefined) {
      if (levelData.totalExperience < 0) {
        errors.push('Total experience cannot be negative');
      }
    }

    if (levelData.levelProgress !== undefined) {
      if (levelData.levelProgress < 0 || levelData.levelProgress > 100) {
        errors.push('Level progress must be between 0 and 100');
      }
    }

    if (levelData.nextLevelThreshold !== undefined) {
      if (levelData.nextLevelThreshold < 0) {
        errors.push('Next level threshold cannot be negative');
      }
    }

    if (levelData.rank !== undefined) {
      if (levelData.rank < 1) {
        errors.push('Rank must be at least 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get level milestones
   */
  getLevelMilestones(): Array<{
    level: number;
    name: string;
    description: string;
    reward: string;
    threshold: number;
  }> {
    return [
      {
        level: 10,
        name: 'First Steps',
        description: 'Complete your first 10 levels',
        reward: 'Unlock advanced features',
        threshold: this.getLevelThreshold(10),
      },
      {
        level: 25,
        name: 'Rising Star',
        description: 'Reach level 25',
        reward: 'Custom avatar options',
        threshold: this.getLevelThreshold(25),
      },
      {
        level: 50,
        name: 'Halfway Hero',
        description: 'Reach the halfway point',
        reward: 'Exclusive badge',
        threshold: this.getLevelThreshold(50),
      },
      {
        level: 75,
        name: 'Elite Performer',
        description: 'Reach level 75',
        reward: 'Premium features access',
        threshold: this.getLevelThreshold(75),
      },
      {
        level: 100,
        name: 'Legendary Status',
        description: 'Reach the maximum level',
        reward: 'Legendary status and recognition',
        threshold: this.getLevelThreshold(100),
      },
    ];
  }

  /**
   * Check if user has reached a milestone
   */
  hasReachedMilestone(userLevel: number, milestoneLevel: number): boolean {
    return userLevel >= milestoneLevel;
  }

  /**
   * Get next milestone for user
   */
  getNextMilestone(userLevel: number): {
    level: number;
    name: string;
    description: string;
    reward: string;
    threshold: number;
    progress: number;
  } | null {
    const milestones = this.getLevelMilestones();
    const nextMilestone = milestones.find((m) => m.level > userLevel);

    if (!nextMilestone) return null;

    const progress = Math.min(100, (userLevel / nextMilestone.level) * 100);

    return {
      ...nextMilestone,
      progress,
    };
  }

  /**
   * Calculate level bonus multiplier
   */
  getLevelBonusMultiplier(level: number): number {
    // Higher levels get better bonuses
    return 1 + level * 0.01; // 1% bonus per level
  }

  /**
   * Calculate prestige level (for levels beyond 100)
   */
  calculatePrestigeLevel(level: number): {
    prestigeLevel: number;
    prestigePoints: number;
    baseLevel: number;
  } {
    if (level <= 100) {
      return {
        prestigeLevel: 0,
        prestigePoints: 0,
        baseLevel: level,
      };
    }

    const prestigeLevel = Math.floor((level - 100) / 10) + 1;
    const prestigePoints = (level - 100) % 10;
    const baseLevel = level % 100 || 100;

    return {
      prestigeLevel,
      prestigePoints,
      baseLevel,
    };
  }
}
