import { ToolStatus } from '../types/toolTypes';

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

  /**
   * Track a tool for a specific doctor with priority
   */
  trackTool(
    toolId: string,
    doctorName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
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
  }

  /**
   * Untrack a tool for a specific doctor
   */
  untrackTool(toolId: string, doctorName: string): void {
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
        const toolName = `Tool ${toolId}`; // This should come from inventory data

        // TODO: Add notification service back later
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
      this.handleToolBecameUnavailable(toolId);
    }

    // Notify subscribers
    this.statusChangeCallbacks.forEach((callback) =>
      callback(toolId, oldStatus, newStatus)
    );
  }

  /**
   * Handle when a tool becomes unavailable
   */
  private handleToolBecameUnavailable(toolId: string): void {
    const subscribers = this.getToolTrackers(toolId);

    if (subscribers.length === 0) {
      return; // No one is tracking this tool
    }

    // Notify all subscribers that the tool is no longer available
    subscribers.forEach((subscriber, index) => {
      const toolName = `Tool ${toolId}`; // This should come from inventory data

      // TODO: Add notification service back later
    });
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

      // TODO: Add notification service back later

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
}

// Create singleton instance
export const trackedToolsService = new TrackedToolsService();

// Export the service instance
export default trackedToolsService;
