import { Achievement } from './GamificationTypes';

// Re-export Achievement for backward compatibility
export type { Achievement };

export class GamificationAchievementProvider {
  /**
   * Get user achievements
   */
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      // This would integrate with an achievements system
      // For now, return default achievements
      return this.getDefaultAchievements();
    } catch (error) {
      console.error('Error getting achievements:', error);
      return this.getDefaultAchievements();
    }
  }

  /**
   * Get default achievements
   */
  getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_task',
        name: 'First Steps',
        description: 'Complete your first task',
        category: 'general',
        points: 10,
        unlocked: false,
        icon: '🎯',
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'general',
        points: 25,
        unlocked: false,
        icon: '🔥',
      },
      {
        id: 'sterilization_master',
        name: 'Sterilization Master',
        description: 'Complete 100 sterilization cycles',
        category: 'sterilization',
        points: 50,
        unlocked: false,
        icon: '🧪',
      },
      {
        id: 'inventory_expert',
        name: 'Inventory Expert',
        description: 'Achieve 95% inventory accuracy',
        category: 'inventory',
        points: 50,
        unlocked: false,
        icon: '📦',
      },
      {
        id: 'environmental_champion',
        name: 'Environmental Champion',
        description: 'Complete 50 environmental cleaning tasks',
        category: 'environmental',
        points: 40,
        unlocked: false,
        icon: '🧽',
      },
      {
        id: 'knowledge_seeker',
        name: 'Knowledge Seeker',
        description: 'Complete 10 learning modules',
        category: 'knowledge',
        points: 30,
        unlocked: false,
        icon: '📚',
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 30-day streak',
        category: 'general',
        points: 100,
        unlocked: false,
        icon: '⚡',
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 100% completion rate for a week',
        category: 'general',
        points: 75,
        unlocked: false,
        icon: '💎',
      },
    ];
  }

  /**
   * Check if user has unlocked an achievement
   */
  checkAchievementUnlock(
    achievementId: string,
    userStats: {
      totalTasks: number;
      currentStreak: number;
      completedTasks: number;
      sterilizationCycles?: number;
      inventoryAccuracy?: number;
      environmentalTasks?: number;
      learningModules?: number;
    }
  ): boolean {
    const achievement = this.getDefaultAchievements().find(
      (a) => a.id === achievementId
    );
    if (!achievement) return false;

    switch (achievementId) {
      case 'first_task':
        return userStats.totalTasks >= 1;
      case 'week_warrior':
        return userStats.currentStreak >= 7;
      case 'sterilization_master':
        return (userStats.sterilizationCycles || 0) >= 100;
      case 'inventory_expert':
        return (userStats.inventoryAccuracy || 0) >= 95;
      case 'environmental_champion':
        return (userStats.environmentalTasks || 0) >= 50;
      case 'knowledge_seeker':
        return (userStats.learningModules || 0) >= 10;
      case 'streak_master':
        return userStats.currentStreak >= 30;
      case 'perfectionist':
        return (
          userStats.totalTasks > 0 &&
          userStats.completedTasks / userStats.totalTasks === 1
        );
      default:
        return false;
    }
  }

  /**
   * Get newly unlocked achievements
   */
  getNewlyUnlockedAchievements(
    previousAchievements: Achievement[],
    currentStats: {
      totalTasks: number;
      currentStreak: number;
      completedTasks: number;
      sterilizationCycles?: number;
      inventoryAccuracy?: number;
      environmentalTasks?: number;
      learningModules?: number;
    }
  ): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const allAchievements = this.getDefaultAchievements();

    allAchievements.forEach((achievement) => {
      const wasUnlocked =
        previousAchievements.find((a) => a.id === achievement.id)?.unlocked ||
        false;
      const isNowUnlocked = this.checkAchievementUnlock(
        achievement.id,
        currentStats
      );

      if (!wasUnlocked && isNowUnlocked) {
        newlyUnlocked.push({
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
        });
      }
    });

    return newlyUnlocked;
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(
    achievements: Achievement[],
    category: Achievement['category']
  ): Achievement[] {
    return achievements.filter(
      (achievement) => achievement.category === category
    );
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(achievements: Achievement[]): Achievement[] {
    return achievements.filter((achievement) => achievement.unlocked);
  }

  /**
   * Get locked achievements
   */
  getLockedAchievements(achievements: Achievement[]): Achievement[] {
    return achievements.filter((achievement) => !achievement.unlocked);
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(
    achievementId: string,
    userStats: {
      totalTasks: number;
      currentStreak: number;
      completedTasks: number;
      sterilizationCycles?: number;
      inventoryAccuracy?: number;
      environmentalTasks?: number;
      learningModules?: number;
    }
  ): {
    current: number;
    target: number;
    progress: number;
    isComplete: boolean;
  } {
    let current = 0;
    let target = 0;

    switch (achievementId) {
      case 'first_task':
        current = userStats.totalTasks;
        target = 1;
        break;
      case 'week_warrior':
        current = userStats.currentStreak;
        target = 7;
        break;
      case 'sterilization_master':
        current = userStats.sterilizationCycles || 0;
        target = 100;
        break;
      case 'inventory_expert':
        current = userStats.inventoryAccuracy || 0;
        target = 95;
        break;
      case 'environmental_champion':
        current = userStats.environmentalTasks || 0;
        target = 50;
        break;
      case 'knowledge_seeker':
        current = userStats.learningModules || 0;
        target = 10;
        break;
      case 'streak_master':
        current = userStats.currentStreak;
        target = 30;
        break;
      case 'perfectionist':
        current =
          userStats.totalTasks > 0
            ? Math.round(
                (userStats.completedTasks / userStats.totalTasks) * 100
              )
            : 0;
        target = 100;
        break;
      default:
        current = 0;
        target = 1;
    }

    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const isComplete = current >= target;

    return {
      current,
      target,
      progress,
      isComplete,
    };
  }

  /**
   * Get achievement statistics
   */
  getAchievementStatistics(achievements: Achievement[]): {
    totalAchievements: number;
    unlockedAchievements: number;
    lockedAchievements: number;
    totalPoints: number;
    unlockedPoints: number;
    byCategory: Record<
      string,
      {
        total: number;
        unlocked: number;
        points: number;
      }
    >;
    completionRate: number;
  } {
    const totalAchievements = achievements.length;
    const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
    const lockedAchievements = totalAchievements - unlockedAchievements;
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const unlockedPoints = achievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    const byCategory: Record<
      string,
      {
        total: number;
        unlocked: number;
        points: number;
      }
    > = {};

    achievements.forEach((achievement) => {
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = {
          total: 0,
          unlocked: 0,
          points: 0,
        };
      }

      byCategory[achievement.category].total++;
      byCategory[achievement.category].points += achievement.points;

      if (achievement.unlocked) {
        byCategory[achievement.category].unlocked++;
      }
    });

    const completionRate =
      totalAchievements > 0
        ? (unlockedAchievements / totalAchievements) * 100
        : 0;

    return {
      totalAchievements,
      unlockedAchievements,
      lockedAchievements,
      totalPoints,
      unlockedPoints,
      byCategory,
      completionRate,
    };
  }

  /**
   * Get achievement recommendations
   */
  getAchievementRecommendations(
    achievements: Achievement[],
    userStats: {
      totalTasks: number;
      currentStreak: number;
      completedTasks: number;
      sterilizationCycles?: number;
      inventoryAccuracy?: number;
      environmentalTasks?: number;
      learningModules?: number;
    }
  ): Array<{
    achievement: Achievement;
    progress: number;
    priority: 'low' | 'medium' | 'high';
    estimatedTimeToUnlock: string;
  }> {
    const lockedAchievements = this.getLockedAchievements(achievements);
    const recommendations: Array<{
      achievement: Achievement;
      progress: number;
      priority: 'low' | 'medium' | 'high';
      estimatedTimeToUnlock: string;
    }> = [];

    lockedAchievements.forEach((achievement) => {
      const progressData = this.getAchievementProgress(
        achievement.id,
        userStats
      );
      let priority: 'low' | 'medium' | 'high' = 'low';
      let estimatedTime = 'Unknown';

      // Determine priority based on progress
      if (progressData.progress >= 80) {
        priority = 'high';
        estimatedTime = 'Very soon';
      } else if (progressData.progress >= 50) {
        priority = 'medium';
        estimatedTime = 'Soon';
      } else if (progressData.progress >= 20) {
        priority = 'medium';
        estimatedTime = 'Moderate effort needed';
      } else {
        priority = 'low';
        estimatedTime = 'Long-term goal';
      }

      recommendations.push({
        achievement,
        progress: progressData.progress,
        priority,
        estimatedTimeToUnlock: estimatedTime,
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.progress - a.progress;
    });
  }

  /**
   * Validate achievement data
   */
  validateAchievement(achievement: Partial<Achievement>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!achievement.id || achievement.id.trim() === '') {
      errors.push('Achievement ID is required');
    }

    if (!achievement.name || achievement.name.trim() === '') {
      errors.push('Achievement name is required');
    }

    if (!achievement.description || achievement.description.trim() === '') {
      errors.push('Achievement description is required');
    }

    if (!achievement.category) {
      errors.push('Achievement category is required');
    } else {
      const validCategories = [
        'sterilization',
        'inventory',
        'environmental',
        'knowledge',
        'general',
      ];
      if (!validCategories.includes(achievement.category)) {
        errors.push(`Invalid category: ${achievement.category}`);
      }
    }

    if (achievement.points !== undefined && achievement.points < 0) {
      errors.push('Achievement points cannot be negative');
    }

    if (!achievement.icon || achievement.icon.trim() === '') {
      errors.push('Achievement icon is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get achievement categories
   */
  getAchievementCategories(): Array<{
    value: Achievement['category'];
    label: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        value: 'general',
        label: 'General',
        description: 'General achievements and milestones',
        icon: '🏆',
      },
      {
        value: 'sterilization',
        label: 'Sterilization',
        description: 'Sterilization-related achievements',
        icon: '🧪',
      },
      {
        value: 'inventory',
        label: 'Inventory',
        description: 'Inventory management achievements',
        icon: '📦',
      },
      {
        value: 'environmental',
        label: 'Environmental',
        description: 'Environmental cleaning achievements',
        icon: '🧽',
      },
      {
        value: 'knowledge',
        label: 'Knowledge',
        description: 'Learning and knowledge achievements',
        icon: '📚',
      },
    ];
  }

  /**
   * Export achievements
   */
  exportAchievements(achievements: Achievement[]): string {
    return JSON.stringify(achievements, null, 2);
  }

  /**
   * Import achievements
   */
  importAchievements(jsonData: string): {
    success: boolean;
    achievements: Achievement[];
    errors: string[];
  } {
    try {
      const achievements = JSON.parse(jsonData) as Achievement[];

      if (!Array.isArray(achievements)) {
        return {
          success: false,
          achievements: [],
          errors: ['Invalid format: expected array of achievements'],
        };
      }

      const errors: string[] = [];
      const validAchievements: Achievement[] = [];

      achievements.forEach((achievement, index) => {
        const validation = this.validateAchievement(achievement);
        if (!validation.isValid) {
          errors.push(
            `Achievement ${index + 1}: ${validation.errors.join(', ')}`
          );
        } else {
          validAchievements.push(achievement as Achievement);
        }
      });

      return {
        success: errors.length === 0,
        achievements: validAchievements,
        errors,
      };
    } catch {
      return {
        success: false,
        achievements: [],
        errors: ['Invalid JSON format'],
      };
    }
  }
}
