/**
 * Zustand store for managing global state on the Home page.
 * Includes gamification data, task status, UI flags, and score handling.
 * Used by HomePage, TaskSection, MetricsSection, and related hooks.
 */

import { create } from 'zustand';
import { logger } from '../utils/logger';
import { isDevelopment } from '@/lib/getEnv';

export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  points?: number;
  type: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface GamificationData {
  totalScore: number;
  level: number;
  totalPoints: number;
  availablePoints?: number;
  streak?: number;
  rank?: number;
  stats?: {
    toolsSterilized: number;
    inventoryChecks: number;
    perfectDays: number;
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    bestStreak: number;
    cleaningTasksCompleted?: number;
    totalCleaningTasks?: number;
  };
}

export interface HomeState {
  // State
  totalScore: number;
  availablePoints: number;
  showFilters: boolean;
  showLeaderboardModal: boolean;
  showStatsModal: boolean;
  showChallengeModal: boolean;
  leaderboardUsers: LeaderboardUser[];
  tasks: Task[];
  gamificationData: GamificationData;
  drawerOpen: boolean;
  loading: boolean;
  taskError: string | null;

  // Actions
  setTotalScore: (value: number) => void;
  setAvailablePoints: (value: number) => void;
  setShowFilters: (value: boolean) => void;
  setShowLeaderboardModal: (value: boolean) => void;
  setShowStatsModal: (value: boolean) => void;
  setShowChallengeModal: (value: boolean) => void;
  setLeaderboardUsers: (users: LeaderboardUser[]) => void;
  setTasks: (tasks: Task[]) => void;
  setGamificationData: (data: GamificationData) => void;
  updateGamificationData: (data: Partial<GamificationData>) => void;
  setDrawerOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTaskError: (error: string | null) => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  // Initial state
  totalScore: 0,
  availablePoints: 0,
  showFilters: false,
  showLeaderboardModal: false,
  showStatsModal: false,
  showChallengeModal: false,
  leaderboardUsers: [],
  tasks: [],
  gamificationData: {
    totalScore: 0,
    level: 1,
    totalPoints: 0,
    streak: 0,
    rank: 100,
    stats: {
      toolsSterilized: 0,
      inventoryChecks: 0,
      perfectDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  },
  drawerOpen: true,
  loading: false,
  taskError: null,

  // Actions
  setTotalScore: (value: number) => set({ totalScore: value }),
  setAvailablePoints: (value: number) => set({ availablePoints: value }),
  setShowFilters: (value: boolean) => set({ showFilters: value }),
  setShowLeaderboardModal: (value: boolean) =>
    set({ showLeaderboardModal: value }),
  setShowStatsModal: (value: boolean) => set({ showStatsModal: value }),
  setShowChallengeModal: (value: boolean) => set({ showChallengeModal: value }),
  setLeaderboardUsers: (users: LeaderboardUser[]) =>
    set({ leaderboardUsers: users }),
  setTasks: (tasks: Task[]) => set({ tasks }),
  setGamificationData: (data: GamificationData) =>
    set({ gamificationData: data }),
  updateGamificationData: (data: Partial<GamificationData>) => {
    if (isDevelopment()) {
      if (typeof data !== 'object' || data === null) {
        logger.warn(
          '[DEV] updateGamificationData called with invalid input:',
          data
        );
      }
    }
    set((state) => ({
      gamificationData: {
        ...state.gamificationData,
        ...data,
      },
    }));
  },
  setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
  setLoading: (loading: boolean) => set({ loading }),
  setTaskError: (error: string | null) => set({ taskError: error }),
}));

export const useGamification = () =>
  useHomeStore((state) => state.gamificationData);
