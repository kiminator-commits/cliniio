import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../../utils/_core/logger';

export interface SubscriptionInfo {
  channel: RealtimeChannel;
  userId: string;
  subscribedAt: Date;
  lastActivity: Date;
}

export class SubscriptionManager {
  private subscriptions = new Map<string, SubscriptionInfo>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.startCleanupTimer();
  }

  addSubscription(userId: string, channel: RealtimeChannel): void {
    try {
      // Remove existing subscription for this user if any
      this.removeSubscription(userId);

      const subscriptionInfo: SubscriptionInfo = {
        channel,
        userId,
        subscribedAt: new Date(),
        lastActivity: new Date(),
      };

      this.subscriptions.set(userId, subscriptionInfo);
      logger.debug(`Subscription added for user: ${userId}`);
    } catch (error) {
      logger.error('Error adding subscription:', error);
    }
  }

  removeSubscription(userId: string): void {
    try {
      const subscription = this.subscriptions.get(userId);
      if (subscription) {
        subscription.channel.unsubscribe();
        this.subscriptions.delete(userId);
        logger.debug(`Subscription removed for user: ${userId}`);
      }
    } catch (error) {
      logger.error('Error removing subscription:', error);
    }
  }

  updateActivity(userId: string): void {
    try {
      const subscription = this.subscriptions.get(userId);
      if (subscription) {
        subscription.lastActivity = new Date();
      }
    } catch (error) {
      logger.error('Error updating subscription activity:', error);
    }
  }

  isUserSubscribed(userId: string): boolean {
    return this.subscriptions.has(userId);
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getActiveSubscriptions(): SubscriptionInfo[] {
    return Array.from(this.subscriptions.values());
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanup(): void {
    try {
      const now = new Date();
      const toRemove: string[] = [];

      for (const [userId, subscription] of Array.from(
        this.subscriptions.entries()
      )) {
        const inactiveTime =
          now.getTime() - subscription.lastActivity.getTime();

        if (inactiveTime > this.INACTIVITY_TIMEOUT) {
          toRemove.push(userId);
        }
      }

      // Remove inactive subscriptions
      toRemove.forEach((userId) => {
        this.removeSubscription(userId);
        logger.debug(`Cleaned up inactive subscription for user: ${userId}`);
      });

      if (toRemove.length > 0) {
        logger.info(`Cleaned up ${toRemove.length} inactive subscriptions`);
      }
    } catch (error) {
      logger.error('Error during subscription cleanup:', error);
    }
  }

  // Force cleanup of all subscriptions
  forceCleanup(): void {
    try {
      const count = this.subscriptions.size;
      this.subscriptions.forEach((subscription) => {
        subscription.channel.unsubscribe();
      });
      this.subscriptions.clear();
      logger.info(`Force cleanup: removed ${count} subscriptions`);
    } catch (error) {
      logger.error('Error during force cleanup:', error);
    }
  }

  // Get memory usage statistics
  getStats(): {
    totalSubscriptions: number;
    memoryUsage: number;
    oldestSubscription?: Date;
    newestSubscription?: Date;
  } {
    const subscriptions = Array.from(this.subscriptions.values());
    const memoryUsage = this.estimateMemoryUsage();

    let oldestSubscription: Date | undefined;
    let newestSubscription: Date | undefined;

    if (subscriptions.length > 0) {
      const dates = subscriptions.map((s) => s.subscribedAt);
      oldestSubscription = new Date(Math.min(...dates.map((d) => d.getTime())));
      newestSubscription = new Date(Math.max(...dates.map((d) => d.getTime())));
    }

    return {
      totalSubscriptions: this.subscriptions.size,
      memoryUsage,
      oldestSubscription,
      newestSubscription,
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimate: each subscription object + channel reference
    const baseSize = 200; // bytes per subscription object
    const channelSize = 1000; // bytes per channel reference
    return this.subscriptions.size * (baseSize + channelSize);
  }

  // Graceful shutdown
  shutdown(): void {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }
      this.forceCleanup();
      logger.info('Subscription manager shutdown complete');
    } catch (error) {
      logger.error('Error during subscription manager shutdown:', error);
    }
  }
}

// Singleton instance
export const subscriptionManager = new SubscriptionManager();

// Graceful shutdown handler (Node.js only)
if (typeof process !== 'undefined') {
  process.on('SIGINT', () => {
    subscriptionManager.shutdown();
  });

  process.on('SIGTERM', () => {
    subscriptionManager.shutdown();
  });
}
