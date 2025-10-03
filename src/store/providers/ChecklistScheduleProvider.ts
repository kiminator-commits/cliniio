import { Checklist } from './ChecklistDataProvider';

export interface ScheduleConfig {
  frequency: 'daily' | 'per_patient' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'custom';
  day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  points: number;
  duration: number; // in minutes
  triggers: {
    roomStatus?: boolean;
    staffSchedule?: boolean;
    adminDecision?: boolean;
  };
}

export interface ScheduledTask {
  id: string;
  checklistId: string;
  checklistTitle: string;
  scheduledFor: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  points: number;
  estimatedDuration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  completedAt?: Date;
  notes?: string;
}

export class ChecklistScheduleProvider {
  /**
   * Configure checklist scheduling
   */
  configureSchedule(
    checklists: Checklist[],
    checklistId: string,
    config: ScheduleConfig
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            autoSchedule: true,
            scheduleFrequency: config.frequency,
            scheduleDay: config.day,
            scheduleTime: config.time,
            schedulePriority: config.priority,
            schedulePoints: config.points,
            scheduleDuration: config.duration,
            triggerRoomStatus: config.triggers.roomStatus,
            triggerStaffSchedule: config.triggers.staffSchedule,
            triggerAdminDecision: config.triggers.adminDecision,
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Remove scheduling from checklist
   */
  removeSchedule(checklists: Checklist[], checklistId: string): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            autoSchedule: false,
            scheduleFrequency: undefined,
            scheduleDay: undefined,
            scheduleTime: undefined,
            schedulePriority: undefined,
            schedulePoints: undefined,
            scheduleDuration: undefined,
            triggerRoomStatus: undefined,
            triggerStaffSchedule: undefined,
            triggerAdminDecision: undefined,
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Generate scheduled tasks
   */
  generateScheduledTasks(
    checklists: Checklist[],
    startDate: Date,
    endDate: Date
  ): ScheduledTask[] {
    const scheduledTasks: ScheduledTask[] = [];
    const scheduledChecklists = checklists.filter((c) => c.autoSchedule);

    scheduledChecklists.forEach((checklist) => {
      const tasks = this.generateTasksForChecklist(checklist, startDate, endDate);
      scheduledTasks.push(...tasks);
    });

    return scheduledTasks.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  /**
   * Generate tasks for a specific checklist
   */
  private generateTasksForChecklist(
    checklist: Checklist,
    startDate: Date,
    endDate: Date
  ): ScheduledTask[] {
    const tasks: ScheduledTask[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.shouldScheduleOnDate(checklist, currentDate)) {
        const scheduledTime = this.getScheduledTime(checklist, currentDate);
        
        tasks.push({
          id: this.generateTaskId(),
          checklistId: checklist.id,
          checklistTitle: checklist.title,
          scheduledFor: scheduledTime,
          priority: checklist.schedulePriority || 'medium',
          points: checklist.schedulePoints || 10,
          estimatedDuration: checklist.scheduleDuration || 30,
          status: 'pending',
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return tasks;
  }

  /**
   * Check if checklist should be scheduled on given date
   */
  private shouldScheduleOnDate(checklist: Checklist, date: Date): boolean {
    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek] as Checklist['scheduleDay'];

    switch (checklist.scheduleFrequency) {
      case 'daily':
        return true;
      case 'weekly':
        return checklist.scheduleDay === dayName;
      case 'bi_weekly': {
        // Every other week on specified day
        const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        return checklist.scheduleDay === dayName && weekNumber % 2 === 0;
      }
      case 'monthly':
        return date.getDate() === 1; // First day of month
      case 'quarterly':
        return date.getDate() === 1 && [0, 3, 6, 9].includes(date.getMonth()); // First day of quarter
      case 'per_patient':
        // This would be triggered by patient events, not scheduled
        return false;
      default:
        return false;
    }
  }

  /**
   * Get scheduled time for a date
   */
  private getScheduledTime(checklist: Checklist, date: Date): Date {
    const scheduledTime = new Date(date);
    
    if (checklist.scheduleTime) {
      const [hours, minutes] = checklist.scheduleTime.split(':').map(Number);
      scheduledTime.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9 AM if no time specified
      scheduledTime.setHours(9, 0, 0, 0);
    }

    return scheduledTime;
  }

  /**
   * Get scheduled checklists for today
   */
  getScheduledForToday(checklists: Checklist[]): Checklist[] {
    const today = new Date();
    return checklists.filter((checklist) => {
      if (!checklist.autoSchedule) return false;
      return this.shouldScheduleOnDate(checklist, today);
    });
  }

  /**
   * Get scheduled checklists for specific date
   */
  getScheduledForDate(checklists: Checklist[], date: Date): Checklist[] {
    return checklists.filter((checklist) => {
      if (!checklist.autoSchedule) return false;
      return this.shouldScheduleOnDate(checklist, date);
    });
  }

  /**
   * Get next scheduled date for checklist
   */
  getNextScheduledDate(checklist: Checklist, fromDate: Date = new Date()): Date | null {
    if (!checklist.autoSchedule) return null;

    const currentDate = new Date(fromDate);
    const maxDays = 365; // Look ahead up to 1 year
    let daysChecked = 0;

    while (daysChecked < maxDays) {
      if (this.shouldScheduleOnDate(checklist, currentDate)) {
        return this.getScheduledTime(checklist, currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }

    return null;
  }

  /**
   * Get schedule statistics
   */
  getScheduleStatistics(checklists: Checklist[]): {
    totalScheduled: number;
    byFrequency: Record<string, number>;
    byPriority: Record<string, number>;
    byDay: Record<string, number>;
    averagePoints: number;
    totalEstimatedDuration: number;
  } {
    const scheduledChecklists = checklists.filter((c) => c.autoSchedule);
    const totalScheduled = scheduledChecklists.length;

    const byFrequency = scheduledChecklists.reduce(
      (acc, checklist) => {
        const frequency = checklist.scheduleFrequency || 'unknown';
        acc[frequency] = (acc[frequency] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = scheduledChecklists.reduce(
      (acc, checklist) => {
        const priority = checklist.schedulePriority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byDay = scheduledChecklists.reduce(
      (acc, checklist) => {
        const day = checklist.scheduleDay || 'unknown';
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalPoints = scheduledChecklists.reduce(
      (sum, checklist) => sum + (checklist.schedulePoints || 0),
      0
    );
    const averagePoints = totalScheduled > 0 ? totalPoints / totalScheduled : 0;

    const totalEstimatedDuration = scheduledChecklists.reduce(
      (sum, checklist) => sum + (checklist.scheduleDuration || 0),
      0
    );

    return {
      totalScheduled,
      byFrequency,
      byPriority,
      byDay,
      averagePoints,
      totalEstimatedDuration,
    };
  }

  /**
   * Validate schedule configuration
   */
  validateScheduleConfig(config: Partial<ScheduleConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.frequency) {
      errors.push('Frequency is required');
    } else {
      const validFrequencies = ['daily', 'per_patient', 'weekly', 'bi_weekly', 'monthly', 'quarterly', 'custom'];
      if (!validFrequencies.includes(config.frequency)) {
        errors.push(`Invalid frequency: ${config.frequency}`);
      }
    }

    if (config.frequency === 'weekly' || config.frequency === 'bi_weekly') {
      if (!config.day) {
        errors.push('Day is required for weekly/bi-weekly schedules');
      } else {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        if (!validDays.includes(config.day)) {
          errors.push(`Invalid day: ${config.day}`);
        }
      }
    }

    if (config.time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(config.time)) {
        errors.push('Invalid time format. Use HH:MM format');
      }
    }

    if (config.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(config.priority)) {
        errors.push(`Invalid priority: ${config.priority}`);
      }
    }

    if (config.points !== undefined && config.points < 0) {
      errors.push('Points cannot be negative');
    }

    if (config.duration !== undefined && config.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available schedule frequencies
   */
  getAvailableFrequencies(): Array<{
    value: ScheduleConfig['frequency'];
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'daily',
        label: 'Daily',
        description: 'Schedule every day',
      },
      {
        value: 'per_patient',
        label: 'Per Patient',
        description: 'Triggered by patient events',
      },
      {
        value: 'weekly',
        label: 'Weekly',
        description: 'Schedule once per week',
      },
      {
        value: 'bi_weekly',
        label: 'Bi-weekly',
        description: 'Schedule every other week',
      },
      {
        value: 'monthly',
        label: 'Monthly',
        description: 'Schedule once per month',
      },
      {
        value: 'quarterly',
        label: 'Quarterly',
        description: 'Schedule once per quarter',
      },
      {
        value: 'custom',
        label: 'Custom',
        description: 'Custom scheduling rules',
      },
    ];
  }

  /**
   * Get available schedule days
   */
  getAvailableDays(): Array<{
    value: ScheduleConfig['day'];
    label: string;
  }> {
    return [
      { value: 'monday', label: 'Monday' },
      { value: 'tuesday', label: 'Tuesday' },
      { value: 'wednesday', label: 'Wednesday' },
      { value: 'thursday', label: 'Thursday' },
      { value: 'friday', label: 'Friday' },
      { value: 'saturday', label: 'Saturday' },
      { value: 'sunday', label: 'Sunday' },
    ];
  }

  /**
   * Get available priorities
   */
  getAvailablePriorities(): Array<{
    value: ScheduleConfig['priority'];
    label: string;
    description: string;
  }> {
    return [
      {
        value: 'low',
        label: 'Low',
        description: 'Low priority task',
      },
      {
        value: 'medium',
        label: 'Medium',
        description: 'Medium priority task',
      },
      {
        value: 'high',
        label: 'High',
        description: 'High priority task',
      },
      {
        value: 'urgent',
        label: 'Urgent',
        description: 'Urgent priority task',
      },
    ];
  }

  /**
   * Generate task ID
   */
  private generateTaskId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
