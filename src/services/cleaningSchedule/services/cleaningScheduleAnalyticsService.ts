import { supabase } from '../../../lib/supabaseClient';
import { CleaningScheduleStats } from '../../../types/cleaningSchedule';
import { CleaningScheduleCoreService } from './cleaningScheduleCoreService';
import { CleaningScheduleHelpers } from '../utils/cleaningScheduleHelpers';

export class CleaningScheduleAnalyticsService {
  constructor(private coreService: CleaningScheduleCoreService) {}

  async getCleaningStats(): Promise<CleaningScheduleStats> {
    const today = CleaningScheduleHelpers.getTodayDateString();
    const allSchedules = await this.coreService.getSchedules();

    const completedToday = allSchedules.filter(
      (s) => s.status === 'completed' && s.completedDate?.startsWith(today)
    ).length;

    const pendingToday = allSchedules.filter(
      (s) => s.status === 'pending' && s.dueDate.startsWith(today)
    ).length;

    const overdue = allSchedules.filter(
      (s) => s.status === 'pending' && new Date(s.dueDate) < new Date()
    ).length;

    const totalSchedules = allSchedules.length;
    const completionRate =
      totalSchedules > 0 ? (completedToday / totalSchedules) * 100 : 0;

    // Calculate average completion time
    const completedSchedules = allSchedules.filter(
      (s) => s.status === 'completed' && s.completedDate
    );
    const averageCompletionTime =
      completedSchedules.length > 0
        ? completedSchedules.reduce((acc, s) => {
            const due = new Date(s.dueDate);
            const completed = new Date(s.completedDate!);
            return acc + (due.getTime() - completed.getTime());
          }, 0) / completedSchedules.length
        : 0;

    // Get top performers
    const topPerformers = await this.getTopPerformers();

    return {
      totalSchedules,
      completedToday,
      pendingToday,
      overdue,
      completionRate,
      averageCompletionTime,
      pendingSchedules: pendingToday,
      overdueSchedules: overdue,
      topPerformers,
    };
  }

  private async getTopPerformers(): Promise<
    CleaningScheduleStats['topPerformers']
  > {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .select('user_id, updated_at')
      .eq('status', 'completed')
      .gte(
        'updated_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error || !data) return [];

    const staffStats = data.reduce(
      (acc, task) => {
        const staffId = task.user_id as string;
        if (!acc[staffId]) {
          acc[staffId] = {
            staffId,
            staffName: task.user_id as string,
            completedTasks: 0,
            totalTime: 0,
          };
        }
        acc[staffId].completedTasks++;
        return acc;
      },
      {} as Record<
        string,
        {
          staffId: string;
          staffName: string;
          completedTasks: number;
          totalTime: number;
        }
      >
    );

    return Object.values(staffStats)
      .sort((a, b) => b.completedTasks - a.completedTasks)
      .slice(0, 5)
      .map((staff) => ({
        staffId: staff.staffId,
        staffName: staff.staffName,
        completedTasks: staff.completedTasks,
        averageTime: staff.totalTime / staff.completedTasks,
      }));
  }
}
