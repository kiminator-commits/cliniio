import { CleaningScheduleService } from './cleaningSchedule/types/cleaningScheduleServiceTypes';
import { CleaningScheduleCoreService } from './cleaningSchedule/services/cleaningScheduleCoreService';
import { CleaningScheduleGeneratorService } from './cleaningSchedule/services/cleaningScheduleGeneratorService';
import { CleaningScheduleAssignmentService } from './cleaningSchedule/services/cleaningScheduleAssignmentService';
import { CleaningScheduleAnalyticsService } from './cleaningSchedule/services/cleaningScheduleAnalyticsService';
import { CleaningScheduleIntegrationService } from './cleaningSchedule/services/cleaningScheduleIntegrationService';
import {
  CleaningSchedule,
  CleaningScheduleStats,
} from '../types/cleaningSchedule';
import { Task } from '../store/homeStore';

class CleaningScheduleServiceImpl implements CleaningScheduleService {
  private static instance: CleaningScheduleServiceImpl;
  private coreService: CleaningScheduleCoreService;
  private generatorService: CleaningScheduleGeneratorService;
  private assignmentService: CleaningScheduleAssignmentService;
  private analyticsService: CleaningScheduleAnalyticsService;
  private integrationService: CleaningScheduleIntegrationService;

  private constructor() {
    this.coreService = new CleaningScheduleCoreService();
    this.assignmentService = new CleaningScheduleAssignmentService();
    this.generatorService = new CleaningScheduleGeneratorService(
      this.coreService,
      this.assignmentService
    );
    this.analyticsService = new CleaningScheduleAnalyticsService(
      this.coreService
    );
    this.integrationService = new CleaningScheduleIntegrationService(
      this.coreService
    );
  }

  static getInstance(): CleaningScheduleServiceImpl {
    if (!CleaningScheduleServiceImpl.instance) {
      CleaningScheduleServiceImpl.instance = new CleaningScheduleServiceImpl();
    }
    return CleaningScheduleServiceImpl.instance;
  }

  // Core operations - delegate to core service
  async createSchedule(
    schedule: Omit<CleaningSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CleaningSchedule> {
    return this.coreService.createSchedule(schedule);
  }

  async updateSchedule(
    id: string,
    updates: Partial<CleaningSchedule>
  ): Promise<CleaningSchedule> {
    return this.coreService.updateSchedule(id, updates);
  }

  async getSchedules(
    filters?: Record<string, unknown>
  ): Promise<CleaningSchedule[]> {
    return this.coreService.getSchedules(filters);
  }

  async getScheduleById(id: string): Promise<CleaningSchedule | null> {
    return this.coreService.getScheduleById(id);
  }

  // Schedule generation - delegate to generator service
  async generateDailySchedules(): Promise<CleaningSchedule[]> {
    return this.generatorService.generateDailySchedules();
  }

  // Task integration - delegate to integration service
  async convertScheduleToTask(schedule: CleaningSchedule): Promise<Task> {
    return this.integrationService.convertScheduleToTask(schedule);
  }

  async getTodaysCleaningTasks(): Promise<Task[]> {
    return this.integrationService.getTodaysCleaningTasks();
  }

  // Analytics - delegate to analytics service
  async getCleaningStats(): Promise<CleaningScheduleStats> {
    return this.analyticsService.getCleaningStats();
  }

  // Additional convenience methods
  async deleteSchedule(id: string): Promise<void> {
    return this.coreService.deleteSchedule(id);
  }

  async getTodaysSchedules(): Promise<CleaningSchedule[]> {
    return this.coreService.getTodaysSchedules();
  }

  async getPendingSchedules(): Promise<CleaningSchedule[]> {
    return this.coreService.getPendingSchedules();
  }

  async getCompletedSchedules(): Promise<CleaningSchedule[]> {
    return this.coreService.getCompletedSchedules();
  }

  async getOverdueSchedules(): Promise<CleaningSchedule[]> {
    return this.coreService.getOverdueSchedules();
  }

  async getUpcomingSchedules(days: number = 7): Promise<CleaningSchedule[]> {
    return this.coreService.getUpcomingSchedules(days);
  }

  // Cache management
  async refresh(): Promise<void> {
    return this.coreService.refresh();
  }

  clearCache(): void {
    this.coreService.clearCache();
  }
}

// Export singleton instance
export const cleaningScheduleService =
  CleaningScheduleServiceImpl.getInstance();
