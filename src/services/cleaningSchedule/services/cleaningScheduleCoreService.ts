import { supabase } from '../../../lib/supabaseClient';
import {
  CleaningSchedule,
  CleaningScheduleFilters,
  CleaningType,
} from '../../../types/cleaningSchedule';
import { CleaningScheduleDataTransformer } from '../utils/cleaningScheduleTransformers';
import { CleaningScheduleCacheManager } from '../utils/cleaningScheduleCache';

export class CleaningScheduleCoreService {
  private cacheManager: CleaningScheduleCacheManager;

  constructor() {
    this.cacheManager = new CleaningScheduleCacheManager();
  }

  async createSchedule(
    schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CleaningSchedule> {
    // Validate schedule before creating
    const validation =
      CleaningScheduleDataTransformer.validateSchedule(schedule);
    if (!validation.isValid) {
      throw new Error(`Invalid schedule: ${validation.errors.join(', ')}`);
    }

    // Sanitize schedule data
    const sanitizedSchedule =
      CleaningScheduleDataTransformer.sanitizeSchedule(schedule);

    const { data, error } = await supabase
      .from('cleaning_schedules')
      .insert({
        ...CleaningScheduleDataTransformer.transformToSupabase(
          sanitizedSchedule
        ),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create schedule: ${error.message}`);

    const createdSchedule =
      CleaningScheduleDataTransformer.transformFromSupabase(data);
    this.cacheManager.invalidateScheduleCache();

    return createdSchedule;
  }

  async updateSchedule(
    id: string,
    updates: Partial<CleaningSchedule>
  ): Promise<CleaningSchedule> {
    // Validate updates
    const validation =
      CleaningScheduleDataTransformer.validateSchedule(updates);
    if (!validation.isValid) {
      throw new Error(
        `Invalid schedule updates: ${validation.errors.join(', ')}`
      );
    }

    // Sanitize updates
    const sanitizedUpdates =
      CleaningScheduleDataTransformer.sanitizeSchedule(updates);

    const { data, error } = await supabase
      .from('cleaning_schedules')
      .update({
        ...CleaningScheduleDataTransformer.transformToSupabase(
          sanitizedUpdates
        ),
        // updated_at: new Date().toISOString(), // Property doesn't exist in schema
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update schedule: ${error.message}`);

    const updatedSchedule =
      CleaningScheduleDataTransformer.transformFromSupabase(data);
    this.cacheManager.invalidateScheduleCache();

    return updatedSchedule;
  }

  async getSchedules(
    filters?: CleaningScheduleFilters
  ): Promise<CleaningSchedule[]> {
    // Check cache first
    const cacheKey = `schedules_${JSON.stringify(filters)}`;
    const cachedSchedules =
      this.cacheManager.getCachedSchedules<CleaningSchedule>(cacheKey);
    if (cachedSchedules.length > 0) {
      return cachedSchedules;
    }

    let query = supabase.from('cleaning_schedules').select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    // Removed assigned_to filter since column doesn't exist
    // if (filters?.assignedTo) {
    //   query = query.eq('assigned_to', filters.assignedTo);
    // }
    if (filters?.dateRange) {
      query = query
        .gte('start_date', filters.dateRange.start)
        .lte('start_date', filters.dateRange.end);
    }

    const { data, error } = await query.order('start_date', {
      ascending: true,
    });

    if (error) throw new Error(`Failed to fetch schedules: ${error.message}`);

    const schedules = data.map(
      CleaningScheduleDataTransformer.transformFromSupabase
    );
    this.cacheManager.setCachedSchedules(cacheKey, schedules);

    return schedules;
  }

  async getScheduleById(id: string): Promise<CleaningSchedule | null> {
    // Check cache first
    const cacheKey = `schedule_${id}`;
    const cachedSchedule =
      this.cacheManager.getCachedData<CleaningSchedule>(cacheKey);
    if (cachedSchedule) {
      return cachedSchedule;
    }

    const { data, error } = await supabase
      .from('cleaning_schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch schedule: ${error.message}`);
    }

    const schedule =
      CleaningScheduleDataTransformer.transformFromSupabase(data);
    this.cacheManager.setCachedData(cacheKey, schedule);

    return schedule;
  }

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('cleaning_schedules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete schedule: ${error.message}`);

    this.cacheManager.invalidateScheduleCache();
  }

  async getSchedulesByType(type: CleaningType): Promise<CleaningSchedule[]> {
    return this.getSchedules({ type });
  }

  async getSchedulesByStatus(status: string): Promise<CleaningSchedule[]> {
    return this.getSchedules({ status });
  }

  async getSchedulesByStaff(staffId: string): Promise<CleaningSchedule[]> {
    return this.getSchedules({ assignedTo: staffId });
  }

  async getSchedulesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<CleaningSchedule[]> {
    return this.getSchedules({
      dateRange: { start: startDate, end: endDate },
    });
  }

  async getPendingSchedules(): Promise<CleaningSchedule[]> {
    return this.getSchedules({ status: 'pending' });
  }

  async getCompletedSchedules(): Promise<CleaningSchedule[]> {
    return this.getSchedules({ status: 'completed' });
  }

  async getOverdueSchedules(): Promise<CleaningSchedule[]> {
    const allSchedules = await this.getSchedules();
    return allSchedules.filter(
      (schedule) =>
        schedule.status === 'pending' && new Date(schedule.dueDate) < new Date()
    );
  }

  async getTodaysSchedules(): Promise<CleaningSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSchedules({
      dateRange: { start: today, end: today },
    });
  }

  async getUpcomingSchedules(days: number = 7): Promise<CleaningSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const endDateString = endDate.toISOString().split('T')[0];

    return this.getSchedules({
      dateRange: { start: today, end: endDateString },
    });
  }

  // Cache management
  async refresh(): Promise<void> {
    this.cacheManager.clearCache();
  }

  clearCache(): void {
    this.cacheManager.clearCache();
  }

  getCacheManager(): CleaningScheduleCacheManager {
    return this.cacheManager;
  }
}
