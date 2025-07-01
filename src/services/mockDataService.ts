import type {
  GamificationStats as GamificationStatsType,
  LeaderboardData,
  MetricsData,
} from '../types/homeTypes';
import { sampleTasks } from '../data/sampleTasks';

export const mockGamificationData: GamificationStatsType = {
  streak: 7,
  level: 5,
  rank: 5,
  totalScore: 1625,
  stats: {
    toolsSterilized: 150,
    inventoryChecks: 45,
    perfectDays: 12,
    totalTasks: 200,
    completedTasks: 180,
    currentStreak: 5,
    bestStreak: 8,
  },
};

export const mockLeaderboardData: LeaderboardData = {
  rank: 1,
  topUsers: [
    { name: 'You', score: 1779, avatar: 'YO' },
    { name: 'Sarah Johnson', score: 1250, avatar: 'SJ' },
    { name: 'Mike Chen', score: 1180, avatar: 'MC' },
    { name: 'Emma Davis', score: 1150, avatar: 'ED' },
    { name: 'Alex Wong', score: 1120, avatar: 'AW' },
  ],
};

export const mockMetricsData: MetricsData = {
  timeSaved: {
    daily: 2.5,
    monthly: 45.8,
  },
  costSavings: {
    monthly: 1250,
    annual: 15000,
  },
  aiEfficiency: {
    timeSavings: 15.5,
    proactiveMgmt: 22.3,
  },
  teamPerformance: {
    skills: 85,
    inventory: 92,
    sterilization: 88,
  },
};

export const mockTasks = sampleTasks;
