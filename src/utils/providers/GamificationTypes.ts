export interface SkillLevels {
  sterilization: number;
  inventory: number;
  environmental: number;
  knowledge: number;
  overall: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category:
    | 'sterilization'
    | 'inventory'
    | 'environmental'
    | 'knowledge'
    | 'general';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  icon: string;
}

// Database row interfaces
export interface SterilizationCycleRow {
  id: string;
  status: string;
  tools: unknown[];
}

export interface BITestRow {
  id: string;
  result: string;
}

export interface InventoryCheckRow {
  id: string;
  accuracy: number;
  items_checked: number;
}

export interface OrderRow {
  id: string;
  status: string;
}

export interface CleaningTaskRow {
  id: string;
  status: string;
  compliance_score: number;
  room_id: string;
}

export interface LearningProgressRow {
  id: string;
  time_spent_minutes: number;
}

export interface CertificationRow {
  id: string;
  expiry_date: string;
}

export interface UserStatsRow {
  id: string;
  total_points: number;
  current_streak: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface UserGamificationStatsRow {
  total_points: number;
  current_streak: number;
  total_tasks: number;
  completed_tasks: number;
}
