export interface TrackingNotification {
  id: string;
  type:
    | 'tool_available'
    | 'position_changed'
    | 'tool_unavailable'
    | 'queue_update';
  title: string;
  message: string;
  toolId: string;
  toolName: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class TrackingNotificationService {
  private notifications: TrackingNotification[] = [];
  private notificationHistory: TrackingNotification[] = [];
  private listeners: ((notifications: TrackingNotification[]) => void)[] = [];

  // Add a notification
  addNotification(
    notification: Omit<TrackingNotification, 'id' | 'timestamp'>
  ) {
    const newNotification: TrackingNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.notifications.unshift(newNotification); // Add to beginning
    this.notifyListeners();

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 5000);
  }

  // Remove a notification
  removeNotification(id: string) {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      // Move to history before removing
      this.notificationHistory.push({
        ...notification,
        timestamp: new Date(), // Update timestamp when moved to history
      });

      // Keep only last 100 notifications in history
      if (this.notificationHistory.length > 100) {
        this.notificationHistory = this.notificationHistory.slice(-100);
      }
    }

    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications(): TrackingNotification[] {
    return [...this.notifications];
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: TrackingNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.notifications]));
  }

  // Notification factory methods
  notifyToolAvailable(
    toolId: string,
    toolName: string,
    position?: number,
    totalQueue?: number,
    priority?: 'high' | 'medium' | 'low'
  ) {
    let title = 'Tool Tracking Started';
    let message = `You're now tracking ${toolName}`;

    if (position && totalQueue) {
      message = `You're tracking ${toolName}. Position: ${position} of ${totalQueue}`;

      // Different titles based on priority
      if (priority === 'high') {
        title = '🔥 High Priority Tracking Started';
        message = `HIGH PRIORITY: ${message}`;
      } else if (priority === 'medium') {
        title = '⚡ Medium Priority Tracking Started';
      } else if (priority === 'low') {
        title = '📋 Low Priority Tracking Started';
      }
    }

    this.addNotification({
      type: 'tool_available',
      title,
      message,
      toolId,
      toolName,
      action: {
        label: 'View Queue',
        onClick: () => {
          console.log(`View queue for tool ${toolId}`);
        },
      },
    });
  }

  notifyPositionChanged(
    toolId: string,
    toolName: string,
    newPosition: number,
    totalQueue: number
  ) {
    this.addNotification({
      type: 'position_changed',
      title: 'Queue Update',
      message: `You moved up! You're now #${newPosition} of ${totalQueue} tracking ${toolName}.`,
      toolId,
      toolName,
      action: {
        label: 'View Queue',
        onClick: () => {
          console.log(`View queue for tool ${toolId}`);
        },
      },
    });
  }

  notifyToolUnavailable(
    toolId: string,
    toolName: string,
    previousPosition?: number,
    totalQueue?: number
  ) {
    const message =
      previousPosition && totalQueue
        ? `${toolName} is no longer available. You were #${previousPosition} of ${totalQueue} in queue.`
        : `${toolName} is no longer available.`;

    this.addNotification({
      type: 'tool_unavailable',
      title: 'Tool Unavailable',
      message,
      toolId,
      toolName,
      action: {
        label: 'Stop Tracking',
        onClick: () => {
          console.log(`Stop tracking tool ${toolId}`);
        },
      },
    });
  }

  notifyQueueUpdate(
    toolId: string,
    toolName: string,
    newPosition: number,
    totalQueue: number
  ) {
    this.addNotification({
      type: 'queue_update',
      title: 'Queue Update',
      message: `Queue updated: You're #${newPosition} of ${totalQueue} tracking ${toolName}.`,
      toolId,
      toolName,
    });
  }

  // Test method for development
  testNotification() {
    this.notifyToolAvailable('test-tool-123', 'Test Surgical Scissors', 2, 5);
  }

  // Get notification history
  getNotificationHistory(): TrackingNotification[] {
    return [...this.notificationHistory].reverse(); // Most recent first
  }

  // Clear notification history
  clearNotificationHistory() {
    this.notificationHistory = [];
  }

  // Get notifications by type
  getNotificationsByType(
    type: TrackingNotification['type']
  ): TrackingNotification[] {
    return this.notificationHistory.filter((n) => n.type === type);
  }

  // Get notifications for a specific tool
  getNotificationsForTool(toolId: string): TrackingNotification[] {
    return this.notificationHistory.filter((n) => n.toolId === toolId);
  }
}

export const trackingNotificationService = new TrackingNotificationService();
