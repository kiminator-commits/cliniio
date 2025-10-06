import { logger } from '../../../utils/_core/logger';
import { SecurityEvent } from '../types/securityTypes';

export class SecurityDataManager {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 100000;

  /**
   * Add security event
   */
  addSecurityEvent(event: SecurityEvent): void {
    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.splice(0, this.events.length - this.MAX_EVENTS);
    }
  }

  /**
   * Get all security events
   */
  getAllEvents(): SecurityEvent[] {
    return [...this.events];
  }

  /**
   * Clean up old events
   */
  cleanupOldEvents(cutoffDate: Date): number {
    const originalCount = this.events.length;
    this.events = this.events.filter((e) => e.timestamp > cutoffDate);
    return originalCount - this.events.length;
  }

  /**
   * Start cleanup timer
   */
  startCleanupTimer(): void {
    // Clean up old events every hour
    setInterval(
      () => {
        this.cleanupOldEventsPrivate();
      },
      60 * 60 * 1000
    );
  }

  /**
   * Clean up old events (30 days)
   */
  private cleanupOldEventsPrivate(): void {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const removedEvents = this.cleanupOldEvents(cutoff);

    if (removedEvents > 0) {
      logger.info(`Cleaned up old security events: ${removedEvents} events`);
    }
  }
}
