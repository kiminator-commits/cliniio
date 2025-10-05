export interface GamificationStats {
  streak: number;
  level: number;
  rank: number;
  totalScore: number;
  totalPoints?: number;
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
  aiTimeSaved: TimeSaved; // Add AI-specific time savings
  costSavings: CostSavings;
  aiEfficiency: AiEfficiency;
  teamPerformance: TeamPerformance;
}

export interface HomeTask {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  timeEstimate: string;
  isCompleted: boolean;
  completedAt: string | null;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomePageData {
  tasks: HomeTask[];
  availablePoints: number;
  completedTasksCount: number;
  totalTasksCount: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface HomePageDataWithPagination extends HomePageData {
  pagination: PaginationInfo;
}
