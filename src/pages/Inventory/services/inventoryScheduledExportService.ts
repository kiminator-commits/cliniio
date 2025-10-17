import {
  ExportSchedule,
  ExportTemplate,
} from './inventoryExportTemplateService';
import { InventoryExportService } from './inventoryExportService';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryItem } from '@/types/inventoryTypes';

export interface ScheduledExportResult {
  id: string;
  scheduleId: string;
  templateId: string;
  fileName: string;
  fileSize: number;
  itemCount: number;
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
  sentTo: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface EmailDeliveryOptions {
  subject: string;
  body: string;
  recipients: string[];
  attachmentName?: string;
  includeReport?: boolean;
}

/**
 * Service for handling scheduled exports and email delivery
 */
export class InventoryScheduledExportService {
  private static readonly SCHEDULES: ExportSchedule[] = [];
  private static readonly EXPORT_RESULTS: ScheduledExportResult[] = [];
  private static readonly ACTIVE_TIMERS: Map<string, NodeJS.Timeout> =
    new Map();

  /**
   * Create a new export schedule
   */
  static async createSchedule(
    schedule: Omit<ExportSchedule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ExportSchedule> {
    const newSchedule: ExportSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.SCHEDULES.push(newSchedule);

    if (newSchedule.enabled) {
      this.scheduleNextRun(newSchedule);
    }

    return newSchedule;
  }

  /**
   * Get all schedules
   */
  static async getSchedules(): Promise<ExportSchedule[]> {
    return [...this.SCHEDULES];
  }

  /**
   * Get schedule by ID
   */
  static async getScheduleById(id: string): Promise<ExportSchedule | null> {
    return this.SCHEDULES.find((schedule) => schedule.id === id) || null;
  }

  /**
   * Update schedule
   */
  static async updateSchedule(
    id: string,
    updates: Partial<ExportSchedule>
  ): Promise<ExportSchedule | null> {
    const schedule = await this.getScheduleById(id);
    if (!schedule) return null;

    // Cancel existing timer if schedule is being updated
    if (this.ACTIVE_TIMERS.has(id)) {
      clearTimeout(this.ACTIVE_TIMERS.get(id)!);
      this.ACTIVE_TIMERS.delete(id);
    }

    const updatedSchedule: ExportSchedule = {
      ...schedule,
      ...updates,
      updatedAt: new Date(),
    };

    const index = this.SCHEDULES.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.SCHEDULES[index] = updatedSchedule;
    }

    if (updatedSchedule.enabled) {
      this.scheduleNextRun(updatedSchedule);
    }

    return updatedSchedule;
  }

  /**
   * Delete schedule
   */
  static async deleteSchedule(id: string): Promise<boolean> {
    // Cancel timer if active
    if (this.ACTIVE_TIMERS.has(id)) {
      clearTimeout(this.ACTIVE_TIMERS.get(id)!);
      this.ACTIVE_TIMERS.delete(id);
    }

    const index = this.SCHEDULES.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.SCHEDULES.splice(index, 1);
    return true;
  }

  /**
   * Enable/disable schedule
   */
  static async toggleSchedule(
    id: string,
    enabled: boolean
  ): Promise<ExportSchedule | null> {
    const schedule = await this.getScheduleById(id);
    if (!schedule) return null;

    if (enabled && !schedule.enabled) {
      // Enable schedule
      return this.updateSchedule(id, { enabled: true });
    } else if (!enabled && schedule.enabled) {
      // Disable schedule
      if (this.ACTIVE_TIMERS.has(id)) {
        clearTimeout(this.ACTIVE_TIMERS.get(id)!);
        this.ACTIVE_TIMERS.delete(id);
      }
      return this.updateSchedule(id, { enabled: false });
    }

    return schedule;
  }

  /**
   * Schedule next run for a schedule
   */
  private static scheduleNextRun(schedule: ExportSchedule): void {
    const nextRun = this.calculateNextRun(schedule);
    if (!nextRun) return;

    const now = new Date();
    const delay = nextRun.getTime() - now.getTime();

    if (delay > 0) {
      const timer = setTimeout(() => {
        this.executeScheduledExport(schedule);
      }, delay);

      this.ACTIVE_TIMERS.set(schedule.id, timer);
    }
  }

  /**
   * Calculate next run time for a schedule
   */
  private static calculateNextRun(schedule: ExportSchedule): Date | null {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);

    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, move to next occurrence
    if (nextRun <= now) {
      switch (schedule.schedule) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          if (schedule.dayOfWeek !== undefined) {
            const currentDay = nextRun.getDay();
            const daysToAdd = (schedule.dayOfWeek - currentDay + 7) % 7;
            nextRun.setDate(nextRun.getDate() + daysToAdd);
          } else {
            nextRun.setDate(nextRun.getDate() + 7);
          }
          break;
        case 'monthly':
          if (schedule.dayOfMonth !== undefined) {
            nextRun.setDate(schedule.dayOfMonth);
            if (nextRun <= now) {
              nextRun.setMonth(nextRun.getMonth() + 1);
            }
          } else {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
          break;
        case 'custom':
          // For custom schedules, you'd parse the cron expression
          // This is a simplified implementation
          if (schedule.cronExpression) {
            // Parse cron expression and calculate next run
            // For now, just add 24 hours
            nextRun.setDate(nextRun.getDate() + 1);
          }
          break;
      }
    }

    return nextRun;
  }

  /**
   * Execute a scheduled export
   */
  private static async executeScheduledExport(
    schedule: ExportSchedule
  ): Promise<void> {
    try {
      // Update last run time
      await this.updateSchedule(schedule.id, { lastRun: new Date() });

      // Get template
      const { InventoryExportTemplateService } = await import(
        './inventoryExportTemplateService'
      );
      const template = await InventoryExportTemplateService.getTemplateById(
        schedule.templateId
      );

      if (!template) {
        throw new Error(`Template not found: ${schedule.templateId}`);
      }

      // Get all items
      const allItems = await inventoryServiceFacade.getAllItems();

      // Apply template
      const filteredItems = InventoryExportTemplateService.applyTemplate(
        allItems as unknown as InventoryItem[],
        template
      );

      // Generate export
      // exportOptions variable removed as it's not used

      const exportResult = await InventoryExportService.exportWithTemplate(
        allItems as unknown as InventoryItem[],
        template
      );

      // Send email - TEMPORARILY DISABLED TO STOP EMAIL BOUNCES
      console.log('Scheduled export email disabled to prevent bounces:', {
        template: template.name,
        recipients: schedule.recipients,
        itemCount: filteredItems.length,
      });

      // const emailOptions: EmailDeliveryOptions = {
      //   subject: `Scheduled Export: ${template.name}`,
      //   body: this.generateEmailBody(
      //     template,
      //     filteredItems.length,
      //     exportResult
      //   ),
      //   recipients: schedule.recipients,
      //   attachmentName: exportResult.fileName,
      //   includeReport: true,
      // };

      // await this.sendEmail(emailOptions);

      // Record result
      const result: ScheduledExportResult = {
        id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        fileName: exportResult.fileName,
        fileSize: exportResult.dataSize,
        itemCount: exportResult.itemCount,
        status: 'success',
        sentTo: schedule.recipients,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      this.EXPORT_RESULTS.push(result);

      // Schedule next run
      this.scheduleNextRun(schedule);
    } catch (error) {
      console.error('Scheduled export failed:', error);

      // Record failed result
      const result: ScheduledExportResult = {
        id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scheduleId: schedule.id,
        templateId: schedule.templateId,
        fileName: '',
        fileSize: 0,
        itemCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        sentTo: [],
        createdAt: new Date(),
        completedAt: new Date(),
      };

      this.EXPORT_RESULTS.push(result);

      // Schedule next run even if this one failed
      this.scheduleNextRun(schedule);
    }
  }

  /**
   * Send email with export attachment
   */
  private static async sendEmail(options: EmailDeliveryOptions): Promise<void> {
    // In a real implementation, this would integrate with an email service
    // For now, we'll simulate the email sending
    console.log('Sending email:', {
      to: options.recipients,
      subject: options.subject,
      attachment: options.attachmentName,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Generate email body
   */
  private static generateEmailBody(
    template: ExportTemplate,
    itemCount: number,
    exportResult: { fileName: string; dataSize: number; itemCount: number }
  ): string {
    return `
      <h2>Inventory Export Report</h2>
      <p><strong>Template:</strong> ${template.name}</p>
      <p><strong>Items Exported:</strong> ${itemCount}</p>
      <p><strong>File Size:</strong> ${(exportResult.dataSize / 1024).toFixed(2)} KB</p>
      <p><strong>Format:</strong> ${template.format.toUpperCase()}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      
      ${template.description ? `<p><strong>Description:</strong> ${template.description}</p>` : ''}
      
      <p>Please find the exported data attached to this email.</p>
      
      <hr>
      <p><em>This is an automated export from the Cliniio Inventory Management System.</em></p>
    `;
  }

  /**
   * Get export results
   */
  static async getExportResults(
    limit: number = 50
  ): Promise<ScheduledExportResult[]> {
    return this.EXPORT_RESULTS.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ).slice(0, limit);
  }

  /**
   * Get export results for a specific schedule
   */
  static async getExportResultsForSchedule(
    scheduleId: string,
    limit: number = 20
  ): Promise<ScheduledExportResult[]> {
    return this.EXPORT_RESULTS.filter(
      (result) => result.scheduleId === scheduleId
    )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Manually trigger a scheduled export
   */
  static async triggerExport(
    scheduleId: string
  ): Promise<ScheduledExportResult | null> {
    const schedule = await this.getScheduleById(scheduleId);
    if (!schedule) return null;

    // Execute the export immediately
    await this.executeScheduledExport(schedule);

    // Return the latest result
    const results = await this.getExportResultsForSchedule(scheduleId, 1);
    return results[0] || null;
  }

  /**
   * Validate schedule configuration
   */
  static validateSchedule(schedule: ExportSchedule): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!schedule.name?.trim()) {
      errors.push('Schedule name is required');
    }

    if (!schedule.templateId?.trim()) {
      errors.push('Template ID is required');
    }

    if (!schedule.time || !/^\d{2}:\d{2}$/.test(schedule.time)) {
      errors.push('Time must be in HH:mm format');
    }

    if (!schedule.recipients || schedule.recipients.length === 0) {
      errors.push('At least one recipient is required');
    }

    if (schedule.recipients) {
      schedule.recipients.forEach((email, index) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Invalid email at position ${index + 1}: ${email}`);
        }
      });
    }

    if (
      schedule.schedule === 'weekly' &&
      (schedule.dayOfWeek === undefined ||
        schedule.dayOfWeek < 0 ||
        schedule.dayOfWeek > 6)
    ) {
      errors.push(
        'Day of week must be between 0 (Sunday) and 6 (Saturday) for weekly schedules'
      );
    }

    if (
      schedule.schedule === 'monthly' &&
      (schedule.dayOfMonth === undefined ||
        schedule.dayOfMonth < 1 ||
        schedule.dayOfMonth > 31)
    ) {
      errors.push(
        'Day of month must be between 1 and 31 for monthly schedules'
      );
    }

    if (schedule.schedule === 'custom' && !schedule.cronExpression?.trim()) {
      errors.push('Cron expression is required for custom schedules');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get schedules that need to run
   */
  static getSchedulesToRun(): ExportSchedule[] {
    const now = new Date();
    return this.SCHEDULES.filter((schedule) => {
      if (!schedule.enabled) return false;

      const nextRun = this.calculateNextRun(schedule);
      return nextRun && nextRun <= now;
    });
  }

  /**
   * Initialize scheduled exports (call this on app startup)
   */
  static initializeScheduledExports(): void {
    this.SCHEDULES.forEach((schedule) => {
      if (schedule.enabled) {
        this.scheduleNextRun(schedule);
      }
    });
  }

  /**
   * Clean up timers (call this on app shutdown)
   */
  static cleanup(): void {
    this.ACTIVE_TIMERS.forEach((timer) => clearTimeout(timer));
    this.ACTIVE_TIMERS.clear();
  }
}
