import { CleaningSchedule } from '../../../types/cleaningSchedule';
import { Task } from '../../../store/homeStore';
import { CleaningScheduleCoreService } from './cleaningScheduleCoreService';
import { CleaningScheduleHelpers } from '../utils/cleaningScheduleHelpers';

export class CleaningScheduleIntegrationService {
  constructor(private coreService: CleaningScheduleCoreService) {}

  async convertScheduleToTask(schedule: CleaningSchedule): Promise<Task> {
    return {
      id: schedule.id,
      title: schedule.name,
      completed: schedule.status === 'completed',
      points: schedule.points,
      type: schedule.type,
      category: 'Environmental Cleaning',
      priority: schedule.priority,
      dueDate: schedule.dueDate,
      status: schedule.status === 'completed' ? 'completed' : 'pending',
    };
  }

  async getTodaysCleaningTasks(): Promise<Task[]> {
    const today = CleaningScheduleHelpers.getTodayDateString();
    const schedules = await this.coreService.getSchedules({
      dateRange: { start: today, end: today },
    });

    return Promise.all(
      schedules.map((schedule) => this.convertScheduleToTask(schedule))
    );
  }
}
