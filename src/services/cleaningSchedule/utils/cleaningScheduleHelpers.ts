import { supabase } from '../../../__mocks__/supabase/supabaseMockClient';
import {
  CleaningScheduleConfig,
  StaffSchedule,
  RoomStatus,
  CleaningType,
  CleaningFrequency,
} from '../../../types/cleaningSchedule';
import type { Json } from '../../../types/database.types';

/**
 * Safe type conversion utilities to prevent data loss
 */
const safeString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const safeNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0;
};

const safeBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false;
};

const safeStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
};

// Define proper types for Supabase operations
type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Database row interfaces
interface TriggerCondition {
  id: string;
  type:
    | 'room_status'
    | 'patient_visit'
    | 'time_based'
    | 'staff_schedule'
    | 'admin_decision';
  condition: string;
  value: Record<string, unknown>;
  enabled: boolean;
}

interface CleaningScheduleConfigRow {
  id: string;
  type: string;
  frequency: string;
  auto_generate: boolean;
  enabled: boolean;
  default_points: number;
  default_duration: number;
  default_priority: string;
  trigger_conditions: Json;
  assigned_roles: string[];
  created_at: string;
  updated_at: string;
}

interface StaffScheduleRow {
  id: string;
  staff_id: string;
  staff_name: string;
  role: string;
  work_days: string[];
  work_hours: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RoomStatusRow {
  id: string;
  room_id: string;
  room_name: string;
  status: string;
  last_cleaned: string;
  next_cleaning: string;
  cleaning_type: string;
  priority: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export class CleaningScheduleHelpers {
  static async getScheduleConfigs(): Promise<CleaningScheduleConfig[]> {
    const { data, error } = await supabase
      .from('cleaning_schedule_configs')
      .select('*');

    if (error) {
      const errorData = error as SupabaseError;
      throw new Error(`Failed to fetch schedule configs: ${errorData.message}`);
    }
    if (!data) return [];

    return ((data as CleaningScheduleConfigRow[]) || []).map(
      (item): CleaningScheduleConfig => ({
        id: safeString(item.id),
        type: safeString(item.type) as CleaningType,
        frequency: safeString(item.frequency) as CleaningFrequency,
        autoGenerate: safeBoolean(item.auto_generate),
        enabled: safeBoolean(item.enabled),
        defaultPoints: safeNumber(item.default_points),
        defaultDuration: safeNumber(item.default_duration),
        defaultPriority:
          (safeString(item.default_priority) as
            | 'low'
            | 'medium'
            | 'high'
            | 'urgent') || 'medium',
        triggerConditions:
          (item.trigger_conditions as unknown as TriggerCondition[]) || [],
        assignedRoles: safeStringArray(item.assigned_roles),
        createdAt: safeString(item.created_at),
        updatedAt: safeString(item.updated_at),
      })
    );
  }

  static async getActiveStaffSchedules(): Promise<StaffSchedule[]> {
    const { data, error } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      const errorData = error as SupabaseError;
      throw new Error(`Failed to fetch staff schedules: ${errorData.message}`);
    }
    if (!data) return [];

    return ((data as StaffScheduleRow[]) || []).map((item): StaffSchedule => {
      const workHours = item.work_hours as { start?: string; end?: string };
      return {
        id: safeString(item.id),
        staffId: safeString(item.staff_id),
        staffName: safeString(item.staff_name),
        role: safeString(item.role),
        workDays: safeStringArray(item.work_days),
        workHours: {
          start: safeString(workHours?.start) || '09:00',
          end: safeString(workHours?.end) || '17:00',
        },
        isActive: safeBoolean(item.is_active),
        createdAt: safeString(item.created_at),
        updatedAt: safeString(item.updated_at),
      };
    });
  }

  static async getRoomsByStatus(status: string): Promise<RoomStatus[]> {
    const { data, error } = await supabase
      .from('room_status')
      .select('*')
      .eq('status', status);

    if (error) {
      const errorData = error as SupabaseError;
      throw new Error(`Failed to fetch room status: ${errorData.message}`);
    }
    if (!data) return [];

    return ((data as RoomStatusRow[]) || []).map(
      (item): RoomStatus => ({
        id: safeString(item.id),
        roomId: safeString(item.room_id),
        status:
          (safeString(item.status) as
            | 'clean'
            | 'dirty'
            | 'occupied'
            | 'maintenance'
            | 'quarantine') || 'clean',
        lastUpdated: safeString(item.updated_at),
        patientId: undefined, // Not available in this interface
        notes: safeString(item.notes),
      })
    );
  }

  static isStaffAvailableOnDate(staff: StaffSchedule, date: string): boolean {
    const dayOfWeek = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    return staff.workDays.includes(dayOfWeek);
  }

  static getWeeklyScheduleDay(config: CleaningScheduleConfig): string {
    // Default to Friday if not configured
    const weeklyCondition = config.triggerConditions.find(
      (c) => c.type === 'time_based'
    );
    return (weeklyCondition?.value?.day as string) || 'friday';
  }

  static getPublicSpacesScheduleDay(config: CleaningScheduleConfig): string {
    // Default to Wednesday if not configured
    const publicSpacesCondition = config.triggerConditions.find(
      (c) => c.type === 'admin_decision'
    );
    return (publicSpacesCondition?.value?.day as string) || 'wednesday';
  }

  static getDeepCleanScheduleDay(config: CleaningScheduleConfig): string {
    // Default to Saturday if not configured
    const deepCleanCondition = config.triggerConditions.find(
      (c) => c.type === 'admin_decision'
    );
    return (deepCleanCondition?.value?.day as string) || 'saturday';
  }

  static getCurrentDayOfWeek(): string {
    return new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
  }

  static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  static isSameDay(date1: string, date2: string): boolean {
    return date1.split('T')[0] === date2.split('T')[0];
  }

  static isDateInPast(date: string): boolean {
    return new Date(date) < new Date();
  }

  static isDateInFuture(date: string): boolean {
    return new Date(date) > new Date();
  }

  static addDaysToDate(date: string, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  static subtractDaysFromDate(date: string, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result.toISOString().split('T')[0];
  }

  static getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  static getWeekDays(): string[] {
    return [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
  }

  static getWorkDays(): string[] {
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  }

  static getWeekendDays(): string[] {
    return ['saturday', 'sunday'];
  }

  static isWeekend(dayOfWeek: string): boolean {
    return this.getWeekendDays().includes(dayOfWeek);
  }

  static isWorkDay(dayOfWeek: string): boolean {
    return this.getWorkDays().includes(dayOfWeek);
  }

  static getNextWeekDay(currentDay: string): string {
    const weekDays = this.getWeekDays();
    const currentIndex = weekDays.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % weekDays.length;
    return weekDays[nextIndex];
  }

  static getPreviousWeekDay(currentDay: string): string {
    const weekDays = this.getWeekDays();
    const currentIndex = weekDays.indexOf(currentDay);
    const previousIndex =
      currentIndex === 0 ? weekDays.length - 1 : currentIndex - 1;
    return weekDays[previousIndex];
  }

  static formatTimeForSchedule(hour: number, minute: number = 0): string {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  }

  static getDefaultScheduleTimes(): {
    morning: string;
    afternoon: string;
    evening: string;
  } {
    return {
      morning: this.formatTimeForSchedule(9, 0), // 9 AM
      afternoon: this.formatTimeForSchedule(14, 0), // 2 PM
      evening: this.formatTimeForSchedule(17, 0), // 5 PM
    };
  }

  static calculateDurationInMinutes(
    startTime: string,
    endTime: string
  ): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }

  static calculatePointsForDuration(
    durationMinutes: number,
    basePoints: number = 10
  ): number {
    // Base points for 30 minutes, scale up/down
    const baseDuration = 30;
    return Math.round((durationMinutes / baseDuration) * basePoints);
  }

  static getPriorityMultiplier(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'low':
        return 0.8;
      case 'medium':
        return 1.0;
      case 'high':
        return 1.5;
      case 'urgent':
        return 2.0;
      default:
        return 1.0;
    }
  }

  static calculatePointsWithPriority(
    basePoints: number,
    priority: string
  ): number {
    return Math.round(basePoints * this.getPriorityMultiplier(priority));
  }
}
