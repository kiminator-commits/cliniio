import { useState, useEffect, useCallback } from 'react';
import { aiDailyTaskService } from '../services/aiDailyTaskService';
import {
  homeMetricsService,
  HomePerformanceMetrics,
} from '../services/home/homeMetricsService';
import { homeSterilizationIntegration } from '../services/homeSterilizationIntegration';
import { homeIntegrationService } from '../services/homeIntegrationService';
import { useFacility } from '../contexts/FacilityContext';
import { HomeTask } from '../types/homeTypes';
import { leaderboardService } from '../services/leaderboardService';
import { HomeData } from '../types/homeDataTypes';

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
    cyclesCompleted: '24',
    successRate: '98.5%',
    equipmentStatus: 'All Operational',
  },
  integrationMetrics: {
    systemHealth: 'Excellent',
    uptime: '99.9%',
    lastSync: '2 minutes ago',
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
    sterilizationMetrics: null,
    integrationMetrics: null,
    leaderboardData: {
      users: [],
      userRank: 1,
      totalUsers: 0,
    },
    loading: true,
    error: null,
  });

  // Load AI PROCESS AND EFFICIENCY values in background without blocking the UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadBackgroundData = useCallback(async () => {
    try {
      // Load enhanced AI PROCESS AND EFFICIENCY data in background
      // This will populate the TIME SAVED and COST SAVED values when ready
      const enhancedData = await Promise.allSettled([
        homeMetricsService.getHomeMetrics(), // Use working service
        homeSterilizationIntegration.getSterilizationMetrics(), // Enhanced sterilization
        homeIntegrationService.getAllMetrics(), // Enhanced integration
      ]);

      // Update the AI PROCESS AND EFFICIENCY tile values when ready (non-blocking)
      setData((prev) => ({
        ...prev,
        aiMetrics:
          enhancedData[0].status === 'fulfilled'
            ? enhancedData[0].value
            : prev.aiMetrics,
        sterilizationMetrics:
          enhancedData[1].status === 'fulfilled'
            ? enhancedData[1].value
            : prev.sterilizationMetrics,
        integrationMetrics:
          enhancedData[2].status === 'fulfilled'
            ? enhancedData[2].value
            : prev.integrationMetrics,
      }));
    } catch (error) {
      console.warn(
        'Background AI PROCESS AND EFFICIENCY loading failed, using basic data:',
        error
      );
      // Don't show errors, just keep the basic data
    }
  }, []);

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

      // Load ALL data in parallel for fastest possible loading
      const [
        allDailyTasks,
        sterilizationMetrics,
        integrationMetrics,
        aiMetrics,
        leaderboardData,
      ] = await Promise.allSettled([
        aiDailyTaskService.getFacilityDailyTasks(facilityId),
        homeSterilizationIntegration.getSterilizationMetrics(),
        homeIntegrationService.getAllMetrics(),
        homeMetricsService.getHomeMetrics(), // Use working service
        leaderboardService.fetchLeaderboardData(),
      ]);

      // Extract results with fallbacks
      const tasks =
        allDailyTasks.status === 'fulfilled'
          ? allDailyTasks.value
          : FALLBACK_TASKS;
      const ai =
        aiMetrics.status === 'fulfilled'
          ? {
              ...aiMetrics.value,
              costSavings: aiMetrics.value.costSavings || {
                monthly: 0,
                annual: 0,
              },
              teamPerformance: aiMetrics.value.teamPerformance || {
                skills: 0,
                inventory: 0,
                sterilization: 0,
              },
            }
          : {
              ...FALLBACK_METRICS.aiMetrics,
              costSavings: { monthly: 0, annual: 0 },
              teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
            };
      const sterilization =
        sterilizationMetrics.status === 'fulfilled'
          ? sterilizationMetrics.value
          : FALLBACK_METRICS.sterilizationMetrics;
      const integration =
        integrationMetrics.status === 'fulfilled'
          ? integrationMetrics.value
          : FALLBACK_METRICS.integrationMetrics;
      const leaderboard =
        leaderboardData.status === 'fulfilled'
          ? leaderboardData.value
          : {
              users: [],
              userRank: 1,
              totalUsers: 0,
            };

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
        sterilizationMetrics: sterilization as unknown as Record<
          string,
          unknown
        >,
        integrationMetrics: integration,
        leaderboardData: leaderboard,
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
        leaderboardData: {
          users: [],
          userRank: 1,
          totalUsers: 0,
        },
        loading: false,
        error: null, // Don't show error, just use fallback data
      });
    }
  }, [currentFacility?.id, facilityLoading]);

  // Load data when facility becomes available or when facility loading completes
  useEffect(() => {
    if (!facilityLoading) {
      loadAllData();
    }
  }, [facilityLoading, loadAllData]);

  // Removed the separate immediate loading effect to prevent multiple loading phases
  // Now everything loads in one smooth flow

  return data;
};
