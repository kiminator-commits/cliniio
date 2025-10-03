import {
  CleaningScheduleConfig,
  StaffSchedule,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // RoomStatus,
  CleaningType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // CleaningFrequency,
  CleaningSchedule,
  CleaningScheduleFilters,
  CleaningScheduleStats,
} from '../../../types/cleaningSchedule';
import { Task } from '../../../store/homeStore';

export interface CleaningScheduleService {
  // Core operations
  createSchedule(
    schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CleaningSchedule>;
  updateSchedule(
    id: string,
    updates: Partial<CleaningSchedule>
  ): Promise<CleaningSchedule>;
  getSchedules(filters?: CleaningScheduleFilters): Promise<CleaningSchedule[]>;
  getScheduleById(id: string): Promise<CleaningSchedule | null>;

  // Schedule generation
  generateDailySchedules(): Promise<CleaningSchedule[]>;

  // Task integration
  convertScheduleToTask(schedule: CleaningSchedule): Promise<Task>;
  getTodaysCleaningTasks(): Promise<Task[]>;

  // Analytics
  getCleaningStats(): Promise<CleaningScheduleStats>;
}

export interface StaffAssignmentScore {
  staff: StaffSchedule;
  score: number;
}

export interface StaffPerformanceMetrics {
  staffId: string;
  completedTasks: number;
  onTimeCompletions: number;
  performanceScore: number;
}

export interface StaffSkillMatch {
  staffId: string;
  cleaningType: CleaningType;
  proficiencyLevel: number;
  skillMatchScore: number;
}

export interface StaffPreference {
  staffId: string;
  cleaningType: CleaningType;
  preferenceScore: number;
}

export interface ScheduleGenerationContext {
  config: CleaningScheduleConfig;
  date: string;
  generatedSchedules: CleaningSchedule[];
}

export interface ScheduleGenerationResult {
  success: boolean;
  schedules: CleaningSchedule[];
  errors: string[];
}

export interface CleaningScheduleCache {
  data: Map<string, unknown>;
  timeout: number;
  updated_at: number;
}

export interface SupabaseSchedule {
  id: string;
  name: string;
  description?: string;
  type: string;
  frequency: string;
  assigned_to: string;
  assigned_to_id: string;
  priority: string;
  estimated_duration: number;
  points: number;
  status: string;
  due_date: string;
  completed_date?: string;
  completed_by?: string;
  notes?: string;
  checklist_id?: string;
  room_id?: string;
  patient_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleQueryOptions {
  filters?: CleaningScheduleFilters;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DailyScheduleGenerationOptions {
  includeSetupTakeDown?: boolean;
  includePerPatient?: boolean;
  includeWeekly?: boolean;
  includePublicSpaces?: boolean;
  includeDeepClean?: boolean;
  forceRegeneration?: boolean;
}

export interface StaffAssignmentOptions {
  considerWorkload?: boolean;
  considerPerformance?: boolean;
  considerSkills?: boolean;
  considerAvailability?: boolean;
  considerPreferences?: boolean;
  weights?: {
    workload?: number;
    performance?: number;
    skills?: number;
    availability?: number;
    preferences?: number;
  };
}
