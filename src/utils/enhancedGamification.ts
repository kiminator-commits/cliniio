import {
  GamificationLevelProvider,
  EnhancedLevelData,
  UserStats,
} from './providers/GamificationLevelProvider';
import {
  GamificationSkillProvider,
  SkillLevels,
} from './providers/GamificationSkillProvider';
import {
  GamificationAchievementProvider,
  Achievement,
} from './providers/GamificationAchievementProvider';
import { GamificationRankingProvider } from './providers/GamificationRankingProvider';
import { GamificationStatsProvider } from './providers/GamificationStatsProvider';

// Re-export interfaces for backward compatibility
export type { SkillLevels, Achievement, EnhancedLevelData };

// Provider instances
const levelProvider = new GamificationLevelProvider();
const skillProvider = new GamificationSkillProvider();
const achievementProvider = new GamificationAchievementProvider();
const rankingProvider = new GamificationRankingProvider();
const statsProvider = new GamificationStatsProvider();

/**
 * Calculate enhanced level based on multiple factors
 */
export async function calculateEnhancedLevel(
  userId: string,
  facilityId: string
): Promise<EnhancedLevelData> {
  try {
    // Get user's cumulative stats
    const stats = await statsProvider.getUserCumulativeStats(facilityId);

    // Calculate skill-based levels
    const skillLevels = await skillProvider.calculateSkillLevels(
      userId,
      facilityId
    );

    // Get achievements
    const achievements = await achievementProvider.getUserAchievements();

    // Calculate core level using multi-dimensional formula
    const coreLevel = levelProvider.calculateCoreLevel(
      stats as unknown as UserStats,
      skillLevels,
      achievements
    );

    // Calculate progress to next level
    const levelProgress = levelProvider.calculateLevelProgress(
      stats.totalPoints,
      coreLevel
    );
    const nextLevelThreshold = levelProvider.getNextLevelThreshold(coreLevel);

    // Calculate rankings
    const rank = await rankingProvider.calculateUserRank(userId, facilityId);
    const skillRankings = await rankingProvider.calculateSkillRankings();

    return {
      coreLevel,
      skillLevels,
      achievements,
      totalExperience: stats.totalPoints,
      levelProgress,
      nextLevelThreshold,
      rank,
      skillRankings,
    };
  } catch (error) {
    console.error('Error calculating enhanced level:', error);
    return getDefaultEnhancedLevel();
  }
}

/**
 * Get default enhanced level data
 */
function getDefaultEnhancedLevel(): EnhancedLevelData {
  return {
    coreLevel: 1,
    skillLevels: {
      sterilization: 1,
      inventory: 1,
      environmental: 1,
      knowledge: 1,
      overall: 1,
    },
    achievements: achievementProvider.getDefaultAchievements(),
    totalExperience: 0,
    levelProgress: 0,
    nextLevelThreshold: levelProvider.getNextLevelThreshold(1),
    rank: 1,
    skillRankings: {
      sterilization: 1,
      inventory: 1,
      environmental: 1,
      knowledge: 1,
    },
  };
}
