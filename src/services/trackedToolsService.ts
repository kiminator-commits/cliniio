import { ToolStatus } from '../types/toolTypes';
import { trackingNotificationService } from './notifications/trackingNotificationService';
import { trackingAnalyticsService } from './analytics/trackingAnalyticsService';
import {
  realTimeStatusMonitor,
  ToolStatusChange,
} from './monitoring/realTimeStatusMonitor';
import {
  databaseSyncService,
  TrackingSyncData,
} from './sync/databaseSyncService';
import { supabase } from '../lib/supabaseClient';

export interface TrackedToolNotification {
  id: string;
  toolId: string;
  toolName: string;
  doctorName: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'expired';
  priority: 'high' | 'medium' | 'low';
  message: string;
}

export interface TrackedToolPriority {
  toolId: string;
  doctorName: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'waiting' | 'notified' | 'claimed' | 'expired';
}

class TrackedToolsService {
  private notifications: TrackedToolNotification[] = [];
  private priorityQueue: TrackedToolPriority[] = [];
  private statusChangeCallbacks: ((
    toolId: string,
    oldStatus: string,
    newStatus: string
  ) => void)[] = [];

  constructor() {
    // Subscribe to real-time status changes
    realTimeStatusMonitor.subscribe(this.handleToolStatusChange.bind(this));

    // Start database synchronization
    databaseSyncService.startAutoSync();
  }

  /**
   * Track a tool for a specific doctor with priority
   * Also updates the database tracked field for consistency
   */
  async trackTool(
    toolId: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    toolName?: string
  ): Promise<void> {
    const existingIndex = this.priorityQueue.findIndex(
      (item) => item.toolId === toolId && item.doctorName === doctorName
    );

    if (existingIndex >= 0) {
      // Update existing tracking
      this.priorityQueue[existingIndex] = {
        ...this.priorityQueue[existingIndex],
        timestamp: new Date().toISOString(),
        priority,
        status: 'waiting',
      };
    } else {
      // Add new tracking
      this.priorityQueue.push({
        toolId,
        doctorName,
        timestamp: new Date().toISOString(),
        priority,
        status: 'waiting',
      });
    }

    // TODO: Sync with database tracked field
    // This ensures consistency between in-memory service and database
    await this.syncWithDatabase(toolId, true);

    // Simple notification when tracking starts
    const totalInQueue = this.getToolTrackers(toolId).length;
    const queuePosition = this.getQueuePosition(toolId, doctorName);

    console.log('🔔 Tool tracked:', {
      toolId,
      totalInQueue,
      queuePosition,
      doctorName,
    });

    // Send a simple notification that tool is being tracked
    const displayName = toolName || `Tool ${toolId}`;
    trackingNotificationService.notifyToolAvailable(
      toolId,
      displayName,
      queuePosition,
      totalInQueue,
      priority
    );

    // Record analytics event
    trackingAnalyticsService.recordTrackStarted(
      toolId,
      displayName,
      doctorName,
      priority,
      queuePosition,
      totalInQueue
    );
  }

  /**
   * Untrack a tool for a specific doctor
   * Also updates the database tracked field for consistency
   */
  async untrackTool(toolId: string, doctorName: string): Promise<void> {
    const index = this.priorityQueue.findIndex(
      (item) => item.toolId === toolId && item.doctorName === doctorName
    );
    if (index >= 0) {
      // Get the current queue before removing
      const currentQueue = this.getToolTrackers(toolId);
      const removedItem = this.priorityQueue[index];

      this.priorityQueue.splice(index, 1);

      // Notify remaining subscribers about queue position changes
      this.notifyQueuePositionChanges(
        toolId,
        currentQueue,
        removedItem.doctorName
      );

      // Check if tool is still tracked by anyone
      const stillTracked = this.priorityQueue.some(
        (item) => item.toolId === toolId
      );
      await this.syncWithDatabase(toolId, stillTracked);

      // Record analytics event
      trackingAnalyticsService.recordTrackStopped(
        toolId,
        `Tool ${toolId}`, // Placeholder - should get actual tool name from inventory
        doctorName,
        removedItem.priority
      );
    }
  }

  /**
   * Notify subscribers about queue position changes
   */
  private notifyQueuePositionChanges(
    toolId: string,
    oldQueue: TrackedToolPriority[],
    removedDoctor: string
  ): void {
    const newQueue = this.getToolTrackers(toolId);

    // Find doctors who moved up in the queue
    oldQueue.forEach((oldTracker, oldIndex) => {
      if (oldTracker.doctorName === removedDoctor) return; // Skip the removed doctor

      const newIndex = newQueue.findIndex(
        (t) => t.doctorName === oldTracker.doctorName
      );
      if (newIndex >= 0 && newIndex < oldIndex) {
        // This doctor moved up in the queue
        const _toolName = `Tool ${toolId}`; // This should come from inventory data

        // Add notification service back in future iteration
      }
    });
  }

  /**
   * Check if a tool is tracked by any doctor
   */
  isToolTracked(toolId: string): boolean {
    return this.priorityQueue.some((item) => item.toolId === toolId);
  }

  /**
   * Get all doctors tracking a specific tool
   */
  getToolTrackers(toolId: string): TrackedToolPriority[] {
    return this.priorityQueue
      .filter((item) => item.toolId === toolId)
      .sort((a, b) => {
        // Sort by priority first, then by timestamp (FIFO within same priority)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
  }

  /**
   * Monitor tool status changes and trigger notifications
   */
  monitorToolStatusChange(
    toolId: string,
    oldStatus: string,
    newStatus: string
  ): void {
    // Check if tool became available or complete
    if (newStatus === 'available' || newStatus === 'complete') {
      this.handleToolBecameAvailable(toolId);
    }

    // Check if tool became unavailable
    if (
      oldStatus === 'available' &&
      (newStatus === 'in_use' || newStatus === 'sterilizing')
    ) {
      this.handleToolBecameUnavailable(toolId, `Tool ${toolId}`);
    }

    // Notify subscribers
    this.statusChangeCallbacks.forEach((callback) =>
      callback(toolId, oldStatus, newStatus)
    );
  }

  /**
   * Handle when a tool becomes available
   */
  private handleToolBecameAvailable(toolId: string): void {
    const subscribers = this.getToolTrackers(toolId);

    if (subscribers.length === 0) {
      return; // No one is tracking this tool
    }

    // Sort by priority (high > medium > low)
    const priorityRank = { high: 3, medium: 2, low: 1 };
    const sorted = [...subscribers].sort(
      (a, b) => priorityRank[b.priority] - priorityRank[a.priority]
    );
    const topDoctor = sorted[0];

    // Notify top priority subscriber
    if (topDoctor && topDoctor.status === 'waiting') {
      // Get tool name (we'll need to pass this from the hook)
      const toolName = `Tool ${toolId}`; // This should come from inventory data

      // Send notification via the notification service
      trackingNotificationService.notifyToolAvailable(
        toolId,
        toolName,
        1, // position in queue (first)
        subscribers.length // total queue length
      );

      // Update the internal notification for backward compatibility
      const notification: TrackedToolNotification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        toolId,
        toolName,
        doctorName: topDoctor.doctorName,
        timestamp: new Date().toISOString(),
        status: 'pending',
        priority: topDoctor.priority,
        message: `Your tracked tool is now available! You have first priority to claim it.`,
      };

      this.notifications.push(notification);
      topDoctor.status = 'notified';
    }

    // Preserve waiting doctors - update the priority queue with the modified status
    const updatedSubscribers = sorted.map((sub) =>
      sub.doctorName === topDoctor.doctorName ? topDoctor : sub
    );

    // Update the priority queue entries for this tool
    updatedSubscribers.forEach((subscriber) => {
      const index = this.priorityQueue.findIndex(
        (item) =>
          item.toolId === toolId && item.doctorName === subscriber.doctorName
      );
      if (index >= 0) {
        this.priorityQueue[index] = subscriber;
      }
    });
  }

  /**
   * Acknowledge a notification
   */
  acknowledgeNotification(notificationId: string): void {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.status = 'acknowledged';

      // Update corresponding tracker status
      const tracker = this.priorityQueue.find(
        (t) =>
          t.toolId === notification.toolId &&
          t.doctorName === notification.doctorName
      );
      if (tracker) {
        tracker.status = 'claimed';
      }
    }
  }

  /**
   * Get all pending notifications for a doctor
   */
  getPendingNotifications(doctorName: string): TrackedToolNotification[] {
    return this.notifications.filter(
      (n) => n.doctorName === doctorName && n.status === 'pending'
    );
  }

  /**
   * Get all notifications for a doctor
   */
  getAllNotifications(doctorName: string): TrackedToolNotification[] {
    return this.notifications.filter((n) => n.doctorName === doctorName);
  }

  /**
   * Clear expired notifications (older than 24 hours)
   */
  clearExpiredNotifications(): void {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter((n) => {
      const isExpired = new Date(n.timestamp) < twentyFourHoursAgo;
      if (isExpired && n.status === 'pending') {
        n.status = 'expired';
      }
      return !isExpired;
    });
  }

  /**
   * Subscribe to status change events
   */
  subscribeToStatusChanges(
    callback: (toolId: string, oldStatus: string, newStatus: string) => void
  ): () => void {
    this.statusChangeCallbacks.push(callback);
    return () => {
      const index = this.statusChangeCallbacks.indexOf(callback);
      if (index >= 0) {
        this.statusChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Check if a status represents an available state
   */
  private isCleanStatus(status: ToolStatus): boolean {
    const normalizedStatus = status.toLowerCase();
    return ['clean', 'active'].includes(normalizedStatus);
  }

  /**
   * Get priority queue for a specific tool
   */
  getPriorityQueue(toolId: string): TrackedToolPriority[] {
    return this.priorityQueue
      .filter((item) => item.toolId === toolId)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
  }

  /**
   * Get all tracked tools for a doctor
   */
  getTrackedToolsForDoctor(doctorName: string): TrackedToolPriority[] {
    return this.priorityQueue.filter((item) => item.doctorName === doctorName);
  }

  /**
   * Sync tracking status with database tracked field
   * This ensures consistency between in-memory service and database
   */
  private async syncWithDatabase(toolId: string, isTracked: boolean): Promise<void> {
    // Get current user for proper tracking
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id || 'unknown-user';
    
    // Queue the sync operation
    const trackers = this.getToolTrackers(toolId);

    if (isTracked && trackers.length > 0) {
      // Sync all trackers for this tool
      trackers.forEach((tracker) => {
        const syncData: TrackingSyncData = {
          toolId,
          doctorName: tracker.doctorName,
          priority: tracker.priority,
          timestamp: tracker.timestamp,
          status: tracker.status,
        };

        databaseSyncService.queueSync(syncData);
      });
    } else {
      // Tool is no longer tracked - sync removal
      const syncData: TrackingSyncData = {
        toolId,
        doctorName: currentUserId, // Use actual user ID instead of 'system'
        priority: 'medium',
        timestamp: new Date().toISOString(),
        status: 'expired',
      };

      databaseSyncService.queueSync(syncData);
    }

    console.log(
      `📝 Queued database sync for tool ${toolId}: ${isTracked ? 'tracked' : 'untracked'}`
    );
  }

  /**
   * Get queue position for a specific doctor tracking a specific tool
   */
  getQueuePosition(toolId: string, doctorName: string): number {
    const toolTrackers = this.getToolTrackers(toolId);

    // Sort by priority (high > medium > low) and then by timestamp (first come, first served)
    const priorityRank = { high: 3, medium: 2, low: 1 };
    const sortedTrackers = [...toolTrackers].sort((a, b) => {
      // First sort by priority
      const priorityDiff = priorityRank[b.priority] - priorityRank[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by timestamp (earlier = higher priority)
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Find the position of the specified doctor
    const position = sortedTrackers.findIndex(
      (tracker) => tracker.doctorName === doctorName
    );
    return position >= 0 ? position + 1 : 0; // Return 1-based position, 0 if not found
  }

  /**
   * Get statistics about tracked tools
   */
  getTrackingStats(): {
    totalTracked: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    pendingNotifications: number;
  } {
    const totalTracked = this.priorityQueue.length;
    const highPriority = this.priorityQueue.filter(
      (item) => item.priority === 'high'
    ).length;
    const mediumPriority = this.priorityQueue.filter(
      (item) => item.priority === 'medium'
    ).length;
    const lowPriority = this.priorityQueue.filter(
      (item) => item.priority === 'low'
    ).length;
    const pendingNotifications = this.notifications.filter(
      (n) => n.status === 'pending'
    ).length;

    return {
      totalTracked,
      highPriority,
      mediumPriority,
      lowPriority,
      pendingNotifications,
    };
  }

  /**
   * Handle real-time tool status changes
   */
  private handleToolStatusChange(change: ToolStatusChange): void {
    const trackers = this.getToolTrackers(change.toolId);

    if (trackers.length === 0) {
      return; // No one is tracking this tool
    }

    console.log('🔄 Tool status changed:', {
      toolId: change.toolId,
      toolName: change.toolName,
      oldStatus: change.oldStatus,
      newStatus: change.newStatus,
      trackers: trackers.length,
    });

    // Handle different status changes
    if (change.newStatus === 'available' && change.oldStatus !== 'available') {
      // Tool became available - notify trackers
      this.handleToolBecameAvailable(change.toolId);
    } else if (
      change.newStatus === 'unavailable' &&
      change.oldStatus === 'available'
    ) {
      // Tool became unavailable - notify trackers
      this.handleToolBecameUnavailable(change.toolId, change.toolName);
    } else if (
      change.newStatus === 'in_use' &&
      change.oldStatus === 'available'
    ) {
      // Tool was checked out - notify trackers
      this.handleToolWasCheckedOut(change.toolId, change.toolName);
    }

    // Record analytics event
    trackingAnalyticsService.recordToolAvailable(
      change.toolId,
      change.toolName,
      'Test Doctor', // Simplified for demo
      'medium', // Default priority
      undefined // No wait time for status changes
    );
  }

  /**
   * Handle when a tool becomes unavailable
   */
  private handleToolBecameUnavailable(toolId: string, toolName: string): void {
    const trackers = this.getToolTrackers(toolId);

    trackers.forEach((_tracker) => {
      trackingNotificationService.notifyToolUnavailable(
        toolId,
        toolName,
        undefined,
        trackers.length
      );
    });
  }

  /**
   * Handle when a tool is checked out
   */
  private handleToolWasCheckedOut(toolId: string, toolName: string): void {
    const trackers = this.getToolTrackers(toolId);

    trackers.forEach((_tracker) => {
      trackingNotificationService.notifyToolUnavailable(
        toolId,
        toolName,
        undefined,
        trackers.length
      );
    });
  }
}

// Create singleton instance
export const trackedToolsService = new TrackedToolsService();

// Export the service instance
export default trackedToolsService;
