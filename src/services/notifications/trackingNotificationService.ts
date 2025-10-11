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
    previousPosition?: number,
    totalQueue?: number
  ) {
    const message =
      previousPosition && totalQueue
        ? `${toolName} is now available! You were #${previousPosition} of ${totalQueue} in queue.`
        : `${toolName} is now available!`;

    this.addNotification({
      type: 'tool_available',
      title: 'Tool Available!',
      message,
      toolId,
      toolName,
      action: {
        label: 'View Tool',
        onClick: () => {
          // Navigate to tool or focus on it
          console.log(`Navigate to tool ${toolId}`);
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
}

export const trackingNotificationService = new TrackingNotificationService();
