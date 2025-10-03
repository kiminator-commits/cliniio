export type HomeTask = {
  id: string;
  title: string;
  subtitle?: string;
  instructions?: string;
  estimatedTime?: string;
  points: number;
  completed: boolean;
  status?: string;
  type?: string;
  category?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
};

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

export interface ChallengeData {
  title: string;
  description: string;
  reward: string;
  difficulty: string;
}

export interface MetricsData {
  timeSaved: {
    daily: number;
    monthly: number;
  };
  costSavings: {
    monthly: number;
    annual: number;
  };
  aiEfficiency: {
    timeSavings: number;
    proactiveMgmt: number;
  };
  teamPerformance: {
    skills: number;
    inventory: number;
    sterilization: number;
  };
}
