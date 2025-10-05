import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

export interface CumulativeStats {
  toolsSterilized: number;
  inventoryChecks: number;
  perfectDays: number;
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  challengesCompleted: number;
  totalChallenges: number;
  enhancedLevel?: Record<string, unknown>; // Enhanced level data from multi-dimensional calculation
}

class StatsService {
  private cachedStats: CumulativeStats | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private lastLogTime: number = 0; // Prevent duplicate logs in StrictMode

  private async getCachedUser() {
    try {
      const { FacilityService } = await import('@/services/facilityService');
      const { userId, facilityId } =
        await FacilityService.getCurrentUserAndFacility();

      return {
        id: userId,
        facility_id: facilityId,
      };
    } catch (error) {
      console.error('Failed to get cached user:', error);
      return null;
    }
  }

  async fetchCumulativeStats(): Promise<CumulativeStats> {
    console.log('🔍 statsService: fetchCumulativeStats called');

    // Check cache first
    const now = Date.now();
    if (this.cachedStats && now - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log('📊 statsService: Returning cached stats');
      return this.cachedStats;
    }

    try {
      const user = await this.getCachedUser();
      console.log('👤 statsService: Got user:', user);

      if (!user) {
        logger.debug(
          'statsService: No authenticated user found, returning default stats'
        );
        return this.getDefaultStats();
      }

      logger.debug(
        'statsService: Fetching cumulative stats for user:',
        user.id
      );

      const facilityId = await this.getCurrentUserFacilityId();
      if (!facilityId) {
        logger.debug(
          'statsService: No facility ID found, returning default stats'
        );
        return this.getDefaultStats();
      }

      logger.debug(
        'statsService: Querying for user_id:',
        user.id,
        'facility_id:',
        facilityId
      );

      // First try to get stats from user_gamification_stats table
      console.log(
        '🔍 statsService: Trying to fetch from gamification table for facility:',
        facilityId
      );
      const gamificationStats =
        await this.fetchGamificationStatsFromTable(facilityId);
      if (gamificationStats) {
        console.log(
          '✅ statsService: Found gamification stats in database:',
          gamificationStats
        );

        // Cache the results
        this.cachedStats = gamificationStats;
        this.cacheTimestamp = now;

        return gamificationStats;
      } else {
        console.log(
          '❌ statsService: No gamification stats found, falling back to calculations'
        );
      }

      // Fallback to calculating stats from existing tables
      const baseStats = await this.calculateStatsFromExistingTables(
        user.id,
        facilityId
      );

      // Force streak from activity_feed only
      const streaks = await this.calculateStreakFromActivity(
        user.id,
        facilityId
      );

      const stats = {
        ...baseStats,
        currentStreak: streaks.currentStreak,
        bestStreak: streaks.bestStreak,
      };

      // Only log once per calculation to avoid StrictMode duplicate logs
      if (now - this.lastLogTime > 1000) {
        // Only log once per second
        logger.debug('statsService: Calculated stats:', stats);
        this.lastLogTime = now;
      }

      // Cache the results
      this.cachedStats = stats;
      this.cacheTimestamp = now;

      return stats;
    } catch (error) {
      console.error('Error in fetchCumulativeStats:', error);
      return this.getDefaultStats();
    }
  }

  private async fetchGamificationStatsFromTable(
    facilityId: string
  ): Promise<CumulativeStats | null> {
    try {
      console.log('🔍 Fetching gamification stats for facility:', facilityId);

      const { data, error } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      console.log('📊 Gamification stats query result:', { data, error });

      if (error || !data) {
        logger.debug('statsService: No gamification stats found in database');
        return null;
      }

      // Convert database data to CumulativeStats format
      const stats = {
        toolsSterilized: 0, // Not stored in gamification stats
        inventoryChecks: 0, // Not stored in gamification stats
        perfectDays: 0, // Not stored in gamification stats
        totalTasks: data.total_tasks || 0,
        completedTasks: data.completed_tasks || 0,
        currentStreak: data.current_streak || 0,
        bestStreak: data.best_streak || 0,
        totalPoints: data.total_points || 0,
        challengesCompleted: 0, // Not stored in gamification stats
        totalChallenges: 0, // Not stored in gamification stats
      };

      console.log('✅ Converted gamification stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching gamification stats from table:', error);
      return null;
    }
  }

  private async calculateStatsFromExistingTables(
    userId: string,
    facilityId: string
  ): Promise<CumulativeStats> {
    try {
      // Fetch sterilization stats
      const sterilizationStats = await this.fetchSterilizationStats();

      // Fetch inventory check stats
      const inventoryStats = await this.fetchInventoryStats(facilityId);

      // Fetch activity feed stats for tasks
      const activityStats = await this.fetchActivityStats(userId, facilityId);

      // Calculate streaks from activity data
      const streakData = await this.calculateStreakFromActivity(
        userId,
        facilityId
      );

      // Get enhanced level data if available
      let enhancedLevel = null;
      try {
        const { calculateEnhancedLevel } = await import(
          '../utils/enhancedGamification'
        );
        enhancedLevel = await calculateEnhancedLevel(userId, facilityId);
      } catch (err) {
        console.error(err);
      }

      return {
        toolsSterilized: sterilizationStats.toolsSterilized,
        inventoryChecks: inventoryStats.inventoryChecks,
        perfectDays: activityStats.perfectDays,
        totalTasks: activityStats.totalTasks,
        completedTasks: activityStats.completedTasks,
        currentStreak: streakData.currentStreak,
        bestStreak: streakData.bestStreak,
        totalPoints: activityStats.totalPoints,
        challengesCompleted: activityStats.challengesCompleted,
        totalChallenges: activityStats.totalChallenges,
        enhancedLevel: enhancedLevel || undefined,
      };
    } catch (error) {
      console.error('Error calculating stats from existing tables:', error);
      return this.getDefaultStats();
    }
  }

  private async calculateStatsFromCompletions(
    completions: Record<string, unknown>[],
    totalChallenges: number
  ): Promise<CumulativeStats> {
    // Calculate total points and completed challenges (including daily tasks)
    const totalPoints = completions.reduce(
      (sum, completion) => sum + ((completion.points_earned as number) || 0),
      0
    );
    const challengesCompleted = completions.length;

    // Separate daily tasks from regular challenges
    const dailyTasksCompleted = completions.filter(
      (completion) => completion.completion_type === 'daily_task'
    ).length;
    const regularChallengesCompleted =
      challengesCompleted - dailyTasksCompleted;

    // Calculate category-based stats
    const categoryStats = this.calculateCategoryStats(completions);

    // Calculate streak
    const streakData = await this.calculateStreak(completions);

    // Fetch real sterilization data
    const sterilizationStats = await this.fetchSterilizationStats();

    // Get enhanced level data if user is authenticated
    let enhancedLevel = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { calculateEnhancedLevel } = await import(
          '../utils/enhancedGamification'
        );
        const facilityId = await this.getCurrentUserFacilityId();
        enhancedLevel = await calculateEnhancedLevel(user.id, facilityId || '');
      }
    } catch (err) {
      console.error(err);
    }

    return {
      toolsSterilized: sterilizationStats.toolsSterilized, // Real data from sterilization_cycles
      inventoryChecks: categoryStats.quality, // Keep challenge-based for now
      perfectDays: Math.floor(challengesCompleted / 3), // Rough estimate based on daily completion rate
      totalTasks: totalChallenges + dailyTasksCompleted, // Include daily tasks in total
      completedTasks: challengesCompleted, // All completed tasks (challenges + daily tasks)
      currentStreak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      totalPoints,
      challengesCompleted: regularChallengesCompleted, // Only regular challenges
      totalChallenges,
      enhancedLevel: enhancedLevel || undefined, // Add enhanced level data
    };
  }

  private async fetchSterilizationStats(): Promise<{
    toolsSterilized: number;
  }> {
    try {
      const user = await this.getCachedUser();
      if (!user) {
        return { toolsSterilized: 0 };
      }

      const facilityId = await this.getCurrentUserFacilityId();
      if (!facilityId) {
        return { toolsSterilized: 0 };
      }

      // Count completed sterilization cycles
      const { data: completedCycles, error } = await supabase
        .from('sterilization_cycles')
        .select('id')
        .eq('facility_id', facilityId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching sterilization stats:', error);
        return { toolsSterilized: 0 };
      }

      return {
        toolsSterilized: completedCycles?.length || 0,
      };
    } catch (error) {
      console.error('Error in fetchSterilizationStats:', error);
      return { toolsSterilized: 0 };
    }
  }

  private async fetchInventoryStats(
    facilityId: string
  ): Promise<{ inventoryChecks: number }> {
    try {
      // Count inventory items that have been checked/updated recently
      const { data: inventoryItems, error } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('facility_id', facilityId)
        .not('updated_at', 'is', null);

      if (error) {
        console.error('Error fetching inventory stats:', error);
        return { inventoryChecks: 0 };
      }

      return {
        inventoryChecks: inventoryItems?.length || 0,
      };
    } catch (error) {
      console.error('Error in fetchInventoryStats:', error);
      return { inventoryChecks: 0 };
    }
  }

  private async fetchActivityStats(
    userId: string,
    facilityId: string
  ): Promise<{
    perfectDays: number;
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    challengesCompleted: number;
    totalChallenges: number;
  }> {
    try {
      // Get tasks from the home-daily_operations_tasks table
      const { data: tasks, error } = await supabase
        .from('home-daily_operations_tasks')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last 30 days

      if (error) {
        console.error('Error fetching task stats:', error);
        return {
          perfectDays: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalPoints: 0,
          challengesCompleted: 0,
          totalChallenges: 0,
        };
      }

      const totalTasks = tasks?.length || 0;
      const completedTasks =
        tasks?.filter((task) => task.completed).length || 0;

      // Calculate perfect days (days with at least 3 completed tasks)
      const dailyTaskCounts =
        tasks?.reduce(
          (acc, task) => {
            if (task.completed) {
              const date = new Date(
                task.completed_at || task.created_at
              ).toDateString();
              acc[date] = (acc[date] || 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const perfectDays = Object.values(dailyTaskCounts).filter(
        (count) => count >= 3
      ).length;

      // Calculate points from actual task points
      const totalPoints =
        tasks?.reduce((sum, task) => {
          return sum + (task.completed ? task.points || 0 : 0);
        }, 0) || 0;

      return {
        perfectDays,
        totalTasks,
        completedTasks,
        totalPoints,
        challengesCompleted: completedTasks, // Use completed tasks as challenges
        totalChallenges: totalTasks, // Use total tasks as challenges
      };
    } catch (error) {
      console.error('Error in fetchActivityStats:', error);
      return {
        perfectDays: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalPoints: 0,
        challengesCompleted: 0,
        totalChallenges: 0,
      };
    }
  }

  private async calculateStreakFromActivity(
    userId: string,
    facilityId: string
  ): Promise<{
    currentStreak: number;
    bestStreak: number;
  }> {
    try {
      // Get activity data for streak calculation
      const { data: activities, error } = await supabase
        .from('activity_feed')
        .select('created_at')
        .eq('user_id', userId)
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        ) // Last 90 days
        .order('created_at', { ascending: false });

      if (error || !activities) {
        return { currentStreak: 0, bestStreak: 0 };
      }

      // Group activities by date
      const dailyActivities = activities.reduce(
        (acc, activity) => {
          const date = new Date(activity.created_at).toDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(activity);
          return acc;
        },
        {} as Record<string, unknown[]>
      );

      // Calculate streaks
      const dates = Object.keys(dailyActivities).sort().reverse();
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const date of dates) {
        if (dailyActivities[date].length > 0) {
          tempStreak++;
          if (currentStreak === 0) currentStreak = tempStreak;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 0;
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);

      return {
        currentStreak: Math.max(currentStreak, 0),
        bestStreak: Math.max(bestStreak, 0),
      };
    } catch (error) {
      console.error('Error calculating streak from activity:', error);
      return { currentStreak: 0, bestStreak: 0 };
    }
  }

  private calculateCategoryStats(
    completions: Record<string, unknown>[]
  ): Record<string, number> {
    const stats: Record<string, number> = {
      knowledge: 0,
      process: 0,
      quality: 0,
      collaboration: 0,
      daily: 0,
      team: 0,
    };

    completions.forEach((completion) => {
      const homeChallenges = completion.home_challenges as Record<
        string,
        unknown
      >;
      const category = homeChallenges?.category as string;
      if (category && Object.prototype.hasOwnProperty.call(stats, category)) {
        stats[category]++;
      }
    });

    return stats;
  }

  private async calculateStreak(
    completions: Record<string, unknown>[]
  ): Promise<{
    currentStreak: number;
    bestStreak: number;
  }> {
    if (completions.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Get facility ID for the current user
    const facilityId = await this.getCurrentUserFacilityId();
    if (!facilityId) {
      // Fallback to basic streak calculation without office closure logic
      return this.calculateBasicStreak(completions);
    }

    // Sort completions by date (most recent first)
    const sortedCompletions = completions
      .map((c) => new Date(c.completed_at as string))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for current streak (consecutive working days with completions)
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        // Check if the most recent completion was today or yesterday
        const daysDiff = Math.floor(
          (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 1) {
          // Verify this is a working day before counting
          const shouldExclude = await this.shouldExcludeDateFromStreak(
            completionDate,
            facilityId
          );
          if (!shouldExclude) {
            currentStreak = 1;
            tempStreak = 1;
          }
        }
      } else {
        // Check for consecutive working days
        const prevDate = new Date(sortedCompletions[i - 1]);
        prevDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (prevDate.getTime() - completionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Check if the completion date is a working day
          const shouldExclude = await this.shouldExcludeDateFromStreak(
            completionDate,
            facilityId
          );
          if (!shouldExclude) {
            tempStreak++;
            if (i === 0 || currentStreak > 0) {
              currentStreak = tempStreak;
            }
          } else {
            // Reset streak if we hit a non-working day
            tempStreak = 0;
          }
        } else {
          tempStreak = 1;
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { currentStreak, bestStreak };
  }

  private calculateBasicStreak(completions: Record<string, unknown>[]): {
    currentStreak: number;
    bestStreak: number;
  } {
    if (completions.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Sort completions by date (most recent first)
    const sortedCompletions = completions
      .map((c) => new Date(c.completed_at as string))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for current streak (consecutive days with completions)
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i]);
      completionDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        // Check if the most recent completion was today or yesterday
        const daysDiff = Math.floor(
          (today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        // Check for consecutive days
        const prevDate = new Date(sortedCompletions[i - 1]);
        prevDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
          (prevDate.getTime() - completionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          tempStreak++;
          if (i === 0 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 1;
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);
    }

    return { currentStreak, bestStreak };
  }

  private async shouldExcludeDateFromStreak(
    date: Date,
    facilityId: string
  ): Promise<boolean> {
    // Import the utility function dynamically to avoid circular dependencies
    const { shouldExcludeDateFromStreak } = await import(
      '../utils/streakExclusionUtils'
    );
    return shouldExcludeDateFromStreak(date, facilityId);
  }

  private async getCurrentUserFacilityId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userFacility } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      return (userFacility?.facility_id as string) || null;
    } catch (error) {
      console.error('Error getting user facility ID:', error);
      return null;
    }
  }

  private getDefaultStats(): CumulativeStats {
    return {
      toolsSterilized: 0,
      inventoryChecks: 0,
      perfectDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0,
      challengesCompleted: 0,
      totalChallenges: 0,
    };
  }
}

export const statsService = new StatsService();
