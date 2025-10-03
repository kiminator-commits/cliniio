import {
  CleaningSchedule,
  CleaningScheduleConfig,
} from '../../../types/cleaningSchedule';
import { CleaningScheduleCoreService } from './cleaningScheduleCoreService';
import { CleaningScheduleAssignmentService } from './cleaningScheduleAssignmentService';
import { CleaningScheduleHelpers } from '../utils/cleaningScheduleHelpers';
// import { CleaningScheduleDataTransformer } from '../utils/cleaningScheduleTransformers';

export class CleaningScheduleGeneratorService {
  constructor(
    private coreService: CleaningScheduleCoreService,
    private assignmentService: CleaningScheduleAssignmentService
  ) {}

  async generateDailySchedules(): Promise<CleaningSchedule[]> {
    const today = CleaningScheduleHelpers.getTodayDateString();
    const configs = await CleaningScheduleHelpers.getScheduleConfigs();
    const generatedSchedules: CleaningSchedule[] = [];

    for (const config of configs) {
      if (!config.enabled || !config.autoGenerate) continue;

      try {
        switch (config.type) {
          case 'setup_take_down':
            await this.generateSetupTakeDownSchedules(
              config,
              today,
              generatedSchedules
            );
            break;
          case 'per_patient':
            await this.generatePerPatientSchedules(
              config,
              today,
              generatedSchedules
            );
            break;
          case 'weekly':
            await this.generateWeeklySchedules(
              config,
              today,
              generatedSchedules
            );
            break;
          case 'public_spaces':
            await this.generatePublicSpacesSchedules(
              config,
              today,
              generatedSchedules
            );
            break;
          case 'deep_clean':
            await this.generateDeepCleanSchedules(
              config,
              today,
              generatedSchedules
            );
            break;
        }
      } catch (error) {
        console.error(
          `Error generating schedules for type ${config.type}:`,
          error
        );
      }
    }

    return generatedSchedules;
  }

  private async generateSetupTakeDownSchedules(
    config: CleaningScheduleConfig,
    date: string,
    generatedSchedules: CleaningSchedule[]
  ): Promise<void> {
    const staffSchedules =
      await CleaningScheduleHelpers.getActiveStaffSchedules();
    const availableStaff = staffSchedules.filter((staff) =>
      CleaningScheduleHelpers.isStaffAvailableOnDate(staff, date)
    );

    if (availableStaff.length === 0) return;

    const assignedStaff = await this.assignmentService.assignTaskToOptimalStaff(
      availableStaff,
      config
    );

    const schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Daily Setup/Take Down',
      type: 'setup_take_down',
      frequency: 'daily',
      assignedTo: assignedStaff.staffName,
      assignedToId: assignedStaff.staffId,
      priority: config.defaultPriority,
      estimatedDuration: config.defaultDuration,
      points: config.defaultPoints,
      status: 'pending',
      dueDate: `${date}T09:00:00Z`, // 9 AM
    };

    const created = await this.coreService.createSchedule(schedule);
    generatedSchedules.push(created);
  }

  private async generatePerPatientSchedules(
    config: CleaningScheduleConfig,
    date: string,
    generatedSchedules: CleaningSchedule[]
  ): Promise<void> {
    const dirtyRooms = await CleaningScheduleHelpers.getRoomsByStatus('dirty');

    for (const room of dirtyRooms) {
      const staffSchedules =
        await CleaningScheduleHelpers.getActiveStaffSchedules();
      const availableStaff = staffSchedules.filter((staff) =>
        CleaningScheduleHelpers.isStaffAvailableOnDate(staff, date)
      );

      if (availableStaff.length === 0) continue;

      const assignedStaff =
        await this.assignmentService.assignTaskToOptimalStaff(
          availableStaff,
          config
        );

      const schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> =
        {
          name: `Per-Patient Cleaning - Room ${room.roomId}`,
          type: 'per_patient',
          frequency: 'per_patient',
          assignedTo: assignedStaff.staffName,
          assignedToId: assignedStaff.staffId,
          priority: 'high', // Per-patient cleaning is always high priority
          estimatedDuration: config.defaultDuration,
          points: config.defaultPoints,
          status: 'pending',
          dueDate: `${date}T17:00:00Z`, // 5 PM
          roomId: room.roomId,
          patientId: room.patientId,
        };

      const created = await this.coreService.createSchedule(schedule);
      generatedSchedules.push(created);
    }
  }

  private async generateWeeklySchedules(
    config: CleaningScheduleConfig,
    date: string,
    generatedSchedules: CleaningSchedule[]
  ): Promise<void> {
    const weeklyDay = CleaningScheduleHelpers.getWeeklyScheduleDay(config);
    const currentDay = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    if (currentDay !== weeklyDay) return;

    const staffSchedules =
      await CleaningScheduleHelpers.getActiveStaffSchedules();
    const availableStaff = staffSchedules.filter((staff) =>
      CleaningScheduleHelpers.isStaffAvailableOnDate(staff, date)
    );

    if (availableStaff.length === 0) return;

    const assignedStaff = await this.assignmentService.assignTaskToOptimalStaff(
      availableStaff,
      config
    );

    const schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Weekly Deep Cleaning',
      type: 'weekly',
      frequency: 'weekly',
      assignedTo: assignedStaff.staffName,
      assignedToId: assignedStaff.staffId,
      priority: config.defaultPriority,
      estimatedDuration: config.defaultDuration * 2, // Weekly tasks take longer
      points: config.defaultPoints * 1.5, // More points for weekly tasks
      status: 'pending',
      dueDate: `${date}T14:00:00Z`, // 2 PM
    };

    const created = await this.coreService.createSchedule(schedule);
    generatedSchedules.push(created);
  }

  private async generatePublicSpacesSchedules(
    config: CleaningScheduleConfig,
    date: string,
    generatedSchedules: CleaningSchedule[]
  ): Promise<void> {
    const publicSpacesDay =
      CleaningScheduleHelpers.getPublicSpacesScheduleDay(config);
    const currentDay = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    if (currentDay !== publicSpacesDay) return;

    const staffSchedules =
      await CleaningScheduleHelpers.getActiveStaffSchedules();
    const availableStaff = staffSchedules.filter((staff) =>
      CleaningScheduleHelpers.isStaffAvailableOnDate(staff, date)
    );

    if (availableStaff.length === 0) return;

    const assignedStaff = await this.assignmentService.assignTaskToOptimalStaff(
      availableStaff,
      config
    );

    const schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Public Spaces Cleaning',
      type: 'public_spaces',
      frequency: 'weekly',
      assignedTo: assignedStaff.staffName,
      assignedToId: assignedStaff.staffId,
      priority: config.defaultPriority,
      estimatedDuration: config.defaultDuration,
      points: config.defaultPoints,
      status: 'pending',
      dueDate: `${date}T10:00:00Z`, // 10 AM
    };

    const created = await this.coreService.createSchedule(schedule);
    generatedSchedules.push(created);
  }

  private async generateDeepCleanSchedules(
    config: CleaningScheduleConfig,
    date: string,
    generatedSchedules: CleaningSchedule[]
  ): Promise<void> {
    const deepCleanDay =
      CleaningScheduleHelpers.getDeepCleanScheduleDay(config);
    const currentDay = new Date(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    if (currentDay !== deepCleanDay) return;

    const staffSchedules =
      await CleaningScheduleHelpers.getActiveStaffSchedules();
    const availableStaff = staffSchedules.filter((staff) =>
      CleaningScheduleHelpers.isStaffAvailableOnDate(staff, date)
    );

    if (availableStaff.length === 0) return;

    const assignedStaff = await this.assignmentService.assignTaskToOptimalStaff(
      availableStaff,
      config
    );

    const schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Deep Clean Maintenance',
      type: 'deep_clean',
      frequency: 'monthly',
      assignedTo: assignedStaff.staffName,
      assignedToId: assignedStaff.staffId,
      priority: 'high',
      estimatedDuration: config.defaultDuration * 3, // Deep clean takes much longer
      points: config.defaultPoints * 2, // More points for deep clean
      status: 'pending',
      dueDate: `${date}T08:00:00Z`, // 8 AM - start early
    };

    const created = await this.coreService.createSchedule(schedule);
    generatedSchedules.push(created);
  }
}
