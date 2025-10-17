import { useState, useEffect, useCallback } from 'react';
import { aiDailyTaskService } from '../services/aiDailyTaskService';

/**
 * ⚠️ SECURITY NOTE: This hook SHOULD ONLY be used after authentication validation.
 * It fetches user-specific data and assumes the user is logged in.
 * Always verify authentication before calling this hook to prevent data leaks.
 */
import {
  homeMetricsService as _homeMetricsService,
  HomePerformanceMetrics,
} from '../services/home/homeMetricsService';
import { homeSterilizationIntegration as _homeSterilizationIntegration } from '../services/homeSterilizationIntegration';
import { homeIntegrationService as _homeIntegrationService } from '../services/homeIntegrationService';
import { useFacility } from '../contexts/FacilityContext';
import { HomeTask } from '../types/homeTypes';
import { HomeData } from '../types/homeDataTypes';
import { performanceMetricsCache } from '../services/performanceMetricsCache';
import { statsService } from '../services/statsService';

// Fallback data for demo purposes
const FALLBACK_TASKS: HomeTask[] = [
  {
    id: 'demo-1',
    title: 'Complete Daily Safety Checklist',
    description: 'Review and complete the facility safety checklist',
    category: 'Safety',
    difficulty: 'Easy',
    points: 50,
    timeEstimate: '15 min',
    isCompleted: false,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Update Inventory Records',
    description: 'Verify and update current inventory levels',
    category: 'Inventory',
    difficulty: 'Medium',
    points: 75,
    timeEstimate: '30 min',
    isCompleted: false,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Review Sterilization Protocols',
    description: 'Ensure all sterilization equipment is properly maintained',
    category: 'Sterilization',
    difficulty: 'Hard',
    points: 100,
    timeEstimate: '45 min',
    isCompleted: false,
    completedAt: null,
    pointsEarned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FALLBACK_METRICS = {
  aiMetrics: {
    timeSaved: { daily: 0, monthly: 0 },
    aiTimeSaved: { daily: 0, monthly: 0 },
    aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
    gamificationStats: {
      totalTasks: 0,
      completedTasks: 0,
      perfectDays: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  },
  sterilizationMetrics: {
    cyclesCompleted: 0,
    successRate: '0%',
    equipmentStatus: 'No Data',
  },
  integrationMetrics: {
    systemHealth: 'No Data',
    uptime: '0%',
    lastSync: 'Never',
  },
};

/**
 * Optimized home data loader that eliminates facility ID dependency delays
 *
 * Strategy:
 * 1. Start facility-independent metrics (AI metrics) immediately on mount
 * 2. Load facility-dependent data (tasks, sterilization, integration) once facility ID is available
 * 3. Use fallback data for immediate display while real data loads
 * 4. Avoid duplicate requests by checking existing data before making new requests
 */
export const useHomeDataLoader = (): HomeData => {
  const { currentFacility, isLoading: facilityLoading } = useFacility();
  const [data, setData] = useState<HomeData>({
    tasks: [],
    aiMetrics: null,
    aiImpactMetrics: null,
    sterilizationMetrics: null,
    integrationMetrics: null,
    leaderboardData: {
      id: '',
      user_id: '',
      facility_id: '',
      points: 0,
      rank: 1,
      user_name: '',
      department: '',
      created_at: '',
      updated_at: '',
    },
    gamificationData: null,
    loading: true,
    error: null,
  });

  const loadAllData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // All data will be loaded in parallel below

      // Use facility ID from context if available, otherwise use fallback
      let facilityId: string;
      if (currentFacility?.id) {
        facilityId = currentFacility.id;
      } else if (facilityLoading) {
        // Still loading facility, wait for it
        return;
      } else {
        // Facility failed to load, use fallback
        facilityId = 'demo-facility-id';
      }

      // Load essential data in parallel including gamification data
      const [allDailyTasks, freshMetrics, gamificationStats] =
        await Promise.allSettled([
          aiDailyTaskService.getFacilityDailyTasks(facilityId),
          performanceMetricsCache.fetchAndCacheMetricsOnLogin(), // Fetch fresh metrics
          statsService.fetchCumulativeStats(), // Load gamification data during initial load
        ]);

      // Load leaderboard separately to avoid blocking other data
      const leaderboardData = await Promise.resolve([]);

      // Debug Promise.allSettled results
      console.log('🔍 useHomeDataLoader: Promise.allSettled results:', {
        allDailyTasks: allDailyTasks.status,
        freshMetrics: freshMetrics.status,
        gamificationStats: gamificationStats.status,
        leaderboardData: 'skipped',
      });

      // Extract results with fallbacks
      const tasks =
        allDailyTasks.status === 'fulfilled'
          ? allDailyTasks.value
          : FALLBACK_TASKS;

      // Use fresh metrics if available, otherwise fallback
      const metrics =
        freshMetrics.status === 'fulfilled' && freshMetrics.value
          ? freshMetrics.value
          : null;

      // Construct aiMetrics with real data if available, otherwise use fallback
      const ai = metrics?.aiMetrics || {
        timeSaved: { daily: 0, monthly: 0 },
        aiTimeSaved: { daily: 0, monthly: 0 },
        costSavings: { monthly: 0, annual: 0 },
        aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
        teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
        gamificationStats: {
          totalTasks: 0,
          completedTasks: 0,
          perfectDays: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      };
      const sterilization =
        metrics?.sterilizationMetrics || FALLBACK_METRICS.sterilizationMetrics;
      const integration =
        metrics?.integrationMetrics || FALLBACK_METRICS.integrationMetrics;
      // Leaderboard will load when modal opens - use fallback for now
      const leaderboard = {
        id: '',
        user_id: '',
        facility_id: '',
        points: 0,
        rank: 1,
        user_name: '',
        department: '',
        created_at: '',
        updated_at: '',
      };

      // Process gamification data with leaderboard-based level calculation
      const gamificationData =
        gamificationStats.status === 'fulfilled' && gamificationStats.value
          ? (() => {
              const stats = gamificationStats.value;
              const leaderboardResult =
                (
                  leaderboardData as unknown as {
                    status?: string;
                    values?: { userRank: number; totalUsers: number };
                  }
                ).status === 'fulfilled' &&
                (
                  leaderboardData as unknown as {
                    status?: string;
                    values?: { userRank: number; totalUsers: number };
                  }
                ).values
                  ? (
                      leaderboardData as unknown as {
                        status?: string;
                        values?: { userRank: number; totalUsers: number };
                      }
                    ).values
                  : { userRank: 1, totalUsers: 1 };

              // Validate and sanitize all values
              const safeStreak = Math.max(0, stats.currentStreak || 0);
              const safeTotalPoints = Math.max(0, stats.totalPoints || 0);

              // Calculate level based on leaderboard rank (higher rank = higher level)
              const safeUserRank = Math.max(1, leaderboardResult.userRank || 1);
              const safeTotalUsers = Math.max(
                1,
                leaderboardResult.totalUsers || 1
              );

              // Level calculation: Top 10% = Level 10+, Top 25% = Level 7+, Top 50% = Level 5+, etc.
              const rankPercentile = safeUserRank / safeTotalUsers;
              let safeLevel;
              if (rankPercentile <= 0.1) {
                safeLevel = Math.max(
                  10,
                  Math.floor(10 + (0.1 - rankPercentile) * 50)
                ); // Level 10-15 for top 10%
              } else if (rankPercentile <= 0.25) {
                safeLevel = Math.max(
                  7,
                  Math.floor(7 + (0.25 - rankPercentile) * 20)
                ); // Level 7-10 for top 25%
              } else if (rankPercentile <= 0.5) {
                safeLevel = Math.max(
                  5,
                  Math.floor(5 + (0.5 - rankPercentile) * 8)
                ); // Level 5-7 for top 50%
              } else {
                safeLevel = Math.max(
                  1,
                  Math.floor(1 + (1 - rankPercentile) * 4)
                ); // Level 1-5 for bottom 50%
              }

              return {
                streak: safeStreak,
                level: safeLevel,
                rank: safeUserRank,
                totalScore: safeTotalPoints,
              };
            })()
          : null;

      // Convert tasks to HomeTask format
      const homeTasks: HomeTask[] =
        tasks.length > 0
          ? tasks.map((task) => {
              // Check if this is already a HomeTask or a database result
              if ('difficulty' in task && 'timeEstimate' in task) {
                // Already a HomeTask, return as is
                return task as HomeTask;
              }

              // Database result, convert to HomeTask
              return {
                id: task.id,
                title: task.title as string,
                description: (task.description as string) || '',
                category: task.category as string,
                difficulty: (task.priority as string) || 'medium',
                points: task.points as number,
                timeEstimate: `${(task.estimated_duration as number) || 30} min`,
                isCompleted: (task.completed as boolean) || false,
                completedAt: (task.completed_at as string | null) || null,
                pointsEarned: (task.completed as boolean)
                  ? (task.points as number)
                  : 0,
                createdAt:
                  (task.created_at as string) ||
                  (task.due_date as string) ||
                  new Date().toISOString(),
                updatedAt:
                  (task.updated_at as string) || new Date().toISOString(),
              };
            })
          : FALLBACK_TASKS;

      // Show dashboard content immediately when core data is ready
      // This includes the AI PROCESS AND EFFICIENCY tile structure (but values will load in background)
      setData({
        tasks: homeTasks,
        aiMetrics: ai as HomePerformanceMetrics,
        sterilizationMetrics: sterilization as Record<string, unknown>,
        integrationMetrics: integration,
        aiImpactMetrics: (metrics?.aiImpactMetrics || null) as unknown as Record<
          string,
          unknown
        > | null,
        leaderboardData: leaderboard,
        gamificationData: gamificationData,
        loading: false, // Show dashboard now with tile structure visible
        error: null,
      });

      // Skip background loading to prevent infinite loops
      // loadBackgroundData(homeTasks, ai, sterilization, integration, leaderboard);

      console.log('🚀 Home data loaded (with fallbacks if needed):', {
        tasks: homeTasks.length,
        aiMetrics: !!ai,
        sterilizationMetrics: !!sterilization,
        integrationMetrics: !!integration,
      });
    } catch (error) {
      console.error(
        'Critical error loading home data, using all fallbacks:',
        error
      );
      // Use all fallback data if everything fails
      setData({
        tasks: FALLBACK_TASKS,
        aiMetrics: {
          ...FALLBACK_METRICS.aiMetrics,
          costSavings: { monthly: 0, annual: 0 },
          teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
        } as HomePerformanceMetrics,
        sterilizationMetrics:
          FALLBACK_METRICS.sterilizationMetrics as unknown as Record<
            string,
            unknown
          >,
        integrationMetrics:
          FALLBACK_METRICS.integrationMetrics as unknown as Record<
            string,
            unknown
          >,
        aiImpactMetrics: null, // Add AI impact metrics fallback
        leaderboardData: {
          id: '',
          user_id: '',
          facility_id: '',
          points: 0,
          rank: 1,
          user_name: '',
          department: '',
          created_at: '',
          updated_at: '',
        },
        gamificationData: null,
        loading: false,
        error: null, // Don't show error, just use fallback data
      });
    }
  }, [currentFacility, facilityLoading]);

  // Load data when facility becomes available or when facility loading completes
  useEffect(() => {
    if (!facilityLoading) {
      // Use setTimeout to avoid calling setState synchronously in effect
      const timeoutId = setTimeout(() => {
        loadAllData();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [facilityLoading, loadAllData]);

  // Removed the separate immediate loading effect to prevent multiple loading phases
  // Now everything loads in one smooth flow

  return data;
};
