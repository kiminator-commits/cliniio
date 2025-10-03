// Database row interfaces
export interface DailyOperationsTaskRow {
  id: string;
  type: string;
  category: string;
  estimated_duration: number;
  actual_duration: number;
  points: number;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetricsRow {
  id: string;
  facility_id: string;
  metric_type: string;
  metric_value: number;
  date: string;
  created_at: string;
  updated_at: string;
  daily_time_saved?: number;
  monthly_time_saved?: number;
  time_savings?: number;
  proactive_mgmt?: number;
  skills?: number;
  inventory?: number;
  sterilization?: number;
  month?: string;
  user_id?: string;
  metric_name?: string;
}

export interface UserGamificationStatsRow {
  id: string;
  user_id: string;
  facility_id: string;
  total_tasks: number;
  completed_tasks: number;
  total_points: number;
  current_streak: number;
  best_streak: number;
  perfect_days: number;
  created_at: string;
  updated_at: string;
}

export interface AITaskPerformance {
  taskId: string;
  userId: string;
  taskType: string;
  category: string;
  estimatedDuration: number;
  actualDuration: number;
  points: number;
  difficulty: string;
  completedAt: string;
  timeSaved: number;
  efficiencyScore: number;
}

export interface PerformanceUpdate {
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
  gamificationStats: {
    totalTasks: number;
    completedTasks: number;
    perfectDays: number;
    currentStreak: number;
    bestStreak: number;
  };
}
