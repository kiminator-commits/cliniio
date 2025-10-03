import { supabase } from '../../../lib/supabaseClient';
import {
  StaffSchedule,
  CleaningScheduleConfig,
  CleaningType,
} from '../../../types/cleaningSchedule';
import { CleaningScheduleHelpers } from '../utils/cleaningScheduleHelpers';

export class CleaningScheduleAssignmentService {
  async assignTaskToOptimalStaff(
    availableStaff: StaffSchedule[],
    config: CleaningScheduleConfig
  ): Promise<StaffSchedule> {
    // AI algorithm for optimal task assignment
    const staffScores = await Promise.all(
      availableStaff.map(async (staff) => {
        const score = await this.calculateStaffAssignmentScore(staff, config);
        return { staff, score };
      })
    );

    // Sort by score (higher is better) and return the best match
    staffScores.sort((a, b) => b.score - a.score);
    return staffScores[0].staff;
  }

  private async calculateStaffAssignmentScore(
    staff: StaffSchedule,
    config: CleaningScheduleConfig
  ): Promise<number> {
    let score = 0;

    // 1. Workload balance (30% weight)
    const currentTasks = await this.getStaffCurrentTasks(staff.staffId);
    const workloadScore = Math.max(0, 100 - currentTasks.length * 10);
    score += workloadScore * 0.3;

    // 2. Performance history (25% weight)
    const performanceScore = await this.getStaffPerformanceScore(staff.staffId);
    score += performanceScore * 0.25;

    // 3. Skill match (20% weight)
    const skillMatchScore = await this.getStaffSkillMatchScore(
      staff.staffId,
      config.type
    );
    score += skillMatchScore * 0.2;

    // 4. Availability (15% weight)
    const availabilityScore = this.getStaffAvailabilityScore(staff);
    score += availabilityScore * 0.15;

    // 5. Preference (10% weight)
    const preferenceScore = await this.getStaffPreferenceScore(
      staff.staffId,
      config.type
    );
    score += preferenceScore * 0.1;

    return score;
  }

  private async getStaffCurrentTasks(
    staffId: string
  ): Promise<Record<string, unknown>[]> {
    const today = CleaningScheduleHelpers.getTodayDateString();
    const { data, error } = await supabase
      .from('cleaning_schedules')
      .select('*')
      .eq('assigned_to_id', staffId)
      .eq('status', 'pending')
      .gte('due_date', today)
      .lte('due_date', today);

    if (error) return [];
    return data || [];
  }

  private async getStaffPerformanceScore(staffId: string): Promise<number> {
    // Get staff performance based on completed tasks
    const { data, error } = await supabase
      .from('cleaning_schedules')
      .select('*')
      .eq('assigned_to_id', staffId)
      .eq('status', 'completed')
      .gte(
        'completed_date',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 30 days

    if (error || !data) return 50; // Default score

    const completedTasks = data.length;
    const onTimeCompletions = data.filter(
      (task: { completed_date?: string; due_date?: string }) =>
        new Date((task.completed_date as string) || '') <=
        new Date((task.due_date as string) || '')
    ).length;

    return Math.min(100, (onTimeCompletions / completedTasks) * 100);
  }

  private async getStaffSkillMatchScore(
    _staffId: string,
    _cleaningType: CleaningType
  ): Promise<number> {
    // Return default score since staff_skills table doesn't exist
    return 50; // Default score
  }

  private getStaffAvailabilityScore(staff: StaffSchedule): number {
    const now = new Date();
    const currentHour = now.getHours();
    const workStart = parseInt(staff.workHours.start.split(':')[0]);
    const workEnd = parseInt(staff.workHours.end.split(':')[0]);

    if (currentHour >= workStart && currentHour < workEnd) {
      return 100; // Currently working
    } else if (currentHour < workStart) {
      return 80; // Will be working today
    } else {
      return 60; // Worked today but might be tired
    }
  }

  private async getStaffPreferenceScore(
    _staffId: string,
    _cleaningType: CleaningType
  ): Promise<number> {
    // Return default score since staff_preferences table doesn't exist
    return 50; // Default score
  }
}
