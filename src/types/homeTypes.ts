export interface GamificationStats {
  streak: number;
  level: number;
  rank: number;
  totalScore: number;
  stats: {
    toolsSterilized: number;
    inventoryChecks: number;
    perfectDays: number;
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export interface LeaderboardUser {
  name: string;
  score: number;
  avatar: string;
}

export interface LeaderboardData {
  rank: number;
  topUsers: LeaderboardUser[];
}

export interface TimeSaved {
  daily: number;
  monthly: number;
}

export interface CostSavings {
  monthly: number;
  annual: number;
}

export interface AiEfficiency {
  timeSavings: number;
  proactiveMgmt: number;
}

export interface TeamPerformance {
  skills: number;
  inventory: number;
  sterilization: number;
}

export interface MetricsData {
  timeSaved: TimeSaved;
  costSavings: CostSavings;
  aiEfficiency: AiEfficiency;
  teamPerformance: TeamPerformance;
}
