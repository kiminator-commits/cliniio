import {
  CleaningSchedule,
  CleaningType,
  CleaningFrequency,
} from '../../../types/cleaningSchedule';
import {
  safeString,
  safeNumber,
  BaseTransformer,
} from '@/shared/transformers/BaseTransformer';

export class CleaningScheduleDataTransformer extends BaseTransformer {
  static transformFromSupabase(
    data: Record<string, unknown>
  ): CleaningSchedule {
    return {
      id: safeString(data.id),
      name: safeString(data.name),
      description: safeString(data.description),
      type: safeString(data.type) as CleaningType,
      frequency: safeString(data.frequency) as CleaningFrequency,
      assignedTo: safeString(data.assigned_to),
      assignedToId: safeString(data.assigned_to_id),
      priority: safeString(data.priority) as
        | 'low'
        | 'medium'
        | 'high'
        | 'urgent',
      estimatedDuration: safeNumber(data.estimated_duration),
      points: safeNumber(data.points),
      status: safeString(data.status) as
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'overdue'
        | 'cancelled',
      dueDate: safeString(data.due_date),
      completedDate: safeString(data.completed_date),
      completedBy: safeString(data.completed_by),
      notes: safeString(data.notes),
      checklistId: safeString(data.checklist_id),
      roomId: safeString(data.room_id),
      patientId: safeString(data.patient_id),
      createdAt: safeString(data.created_at),
      updatedAt: safeString(data.updated_at),
    };
  }

  static transformToSupabase(
    schedule: Partial<CleaningSchedule>
  ): Record<string, unknown> {
    return {
      name: schedule.name,
      description: schedule.description,
      type: schedule.type,
      frequency: schedule.frequency,
      assigned_to: schedule.assignedTo,
      assigned_to_id: schedule.assignedToId,
      priority: schedule.priority,
      estimated_duration: schedule.estimatedDuration,
      points: schedule.points,
      status: schedule.status,
      due_date: schedule.dueDate,
      completed_date: schedule.completedDate,
      completed_by: schedule.completedBy,
      notes: schedule.notes,
      checklist_id: schedule.checklistId,
      room_id: schedule.roomId,
      patient_id: schedule.patientId,
    };
  }

  static createNewSchedule(
    schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> & {
    id: string;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static updateScheduleWithTimestamp(
    schedule: Partial<CleaningSchedule>
  ): Partial<CleaningSchedule> & { updatedAt: string } {
    return {
      ...schedule,
      updatedAt: new Date().toISOString(),
    };
  }

  static validateSchedule(schedule: Partial<CleaningSchedule>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!schedule.name || schedule.name.trim().length === 0) {
      errors.push('Schedule name is required');
    }

    if (!schedule.type) {
      errors.push('Schedule type is required');
    }

    if (!schedule.frequency) {
      errors.push('Schedule frequency is required');
    }

    if (!schedule.assignedTo) {
      errors.push('Assigned staff is required');
    }

    if (!schedule.priority) {
      errors.push('Priority is required');
    }

    if (!schedule.estimatedDuration || schedule.estimatedDuration <= 0) {
      errors.push('Estimated duration must be greater than 0');
    }

    if (!schedule.points || schedule.points < 0) {
      errors.push('Points must be non-negative');
    }

    if (!schedule.dueDate) {
      errors.push('Due date is required');
    }

    if (schedule.dueDate && new Date(schedule.dueDate) < new Date()) {
      errors.push('Due date cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeSchedule(
    schedule: Partial<CleaningSchedule>
  ): Partial<CleaningSchedule> {
    return {
      ...schedule,
      name: schedule.name?.trim(),
      description: schedule.description?.trim(),
      notes: schedule.notes?.trim(),
    };
  }

  static formatScheduleForDisplay(schedule: CleaningSchedule): {
    id: string;
    name: string;
    type: string;
    priority: string;
    status: string;
    dueDate: string;
    assignedTo: string;
    estimatedDuration: string;
    points: string;
  } {
    return {
      id: schedule.id,
      name: schedule.name,
      type: schedule.type,
      priority: schedule.priority,
      status: schedule.status,
      dueDate: schedule.dueDate ? schedule.dueDate.split('T')[0] : '',
      assignedTo: schedule.assignedTo || '',
      estimatedDuration: `${schedule.estimatedDuration} minutes`,
      points: `${schedule.points} points`,
    };
  }

  static getScheduleSummary(schedules: CleaningSchedule[]): {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    totalPoints: number;
    averageDuration: number;
  } {
    const total = schedules.length;
    const pending = schedules.filter((s) => s.status === 'pending').length;
    const completed = schedules.filter((s) => s.status === 'completed').length;
    const overdue = schedules.filter(
      (s) => s.status === 'pending' && new Date(s.dueDate) < new Date()
    ).length;
    const totalPoints = schedules.reduce((sum, s) => sum + s.points, 0);
    const averageDuration =
      total > 0
        ? schedules.reduce((sum, s) => sum + s.estimatedDuration, 0) / total
        : 0;

    return {
      total,
      pending,
      completed,
      overdue,
      totalPoints,
      averageDuration,
    };
  }
}
