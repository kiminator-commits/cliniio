import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useSterilizationStore } from '../../store/sterilizationStore';
import {
  trackedToolsService,
  TrackedToolNotification,
  TrackedToolPriority,
} from '../../services/trackedToolsService';

export interface UseTrackedToolsReturn {
  // State
  trackedTools: TrackedToolPriority[];
  pendingNotifications: TrackedToolNotification[];
  allNotifications: TrackedToolNotification[];
  trackingStats: {
    totalTracked: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    pendingNotifications: number;
  };

  // Actions
  trackTool: (
    toolId: string,
    priority?: 'high' | 'medium' | 'low',
    toolName?: string
  ) => void;
  untrackTool: (toolId: string) => void;
  acknowledgeNotification: (notificationId: string) => void;
  clearExpiredNotifications: () => void;
  getPriorityQueue: (toolId: string) => TrackedToolPriority[];
  isToolTracked: (toolId: string) => boolean;
  getToolTrackers: (toolId: string) => TrackedToolPriority[];

  // Status monitoring
  subscribeToStatusChanges: (
    callback: (toolId: string, oldStatus: string, newStatus: string) => void
  ) => () => void;
}

export const useTrackedTools = (): UseTrackedToolsReturn => {
  const { currentUser, getUserDisplayName } = useUser();
  const { trackedItems, trackingData, toggleTrackedItem } = useInventoryStore();
  const { availableTools } = useSterilizationStore();

  // Local state - moved to top before any conditional returns
  const [trackedTools, setTrackedTools] = useState<TrackedToolPriority[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<
    TrackedToolNotification[]
  >([]);
  const [allNotifications, setAllNotifications] = useState<
    TrackedToolNotification[]
  >([]);
  const [trackingStats, setTrackingStats] = useState({
    totalTracked: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    pendingNotifications: 0,
  });

  // Get current doctor name
  const getCurrentDoctorName = useCallback((): string => {
    return getUserDisplayName() || currentUser?.email || 'Unknown Doctor';
  }, [getUserDisplayName, currentUser]);

  // Update tracked tools for current doctor
  const updateTrackedTools = useCallback(() => {
    const doctorName = getCurrentDoctorName();
    const tools = trackedToolsService.getTrackedToolsForDoctor(doctorName);
    setTrackedTools(tools);
  }, [getCurrentDoctorName]);

  // Update notifications for current doctor
  const updateNotifications = useCallback(() => {
    const doctorName = getCurrentDoctorName();
    const pending = trackedToolsService.getPendingNotifications(doctorName);
    const all = trackedToolsService.getAllNotifications(doctorName);
    setPendingNotifications(pending);
    setAllNotifications(all);
  }, [getCurrentDoctorName]);

  // Update tracking statistics
  const updateTrackingStats = useCallback(() => {
    const stats = trackedToolsService.getTrackingStats();
    setTrackingStats(stats);
  }, []);

  // Track a tool with priority
  const trackTool = useCallback(
    (
      toolId: string,
      priority: 'high' | 'medium' | 'low' = 'medium',
      toolName?: string
    ) => {
      // Provide fallback for development/testing when no user is available
      const doctorName = currentUser ? getCurrentDoctorName() : 'Test Doctor';

      // Add to tracked tools service
      trackedToolsService.trackTool(toolId, doctorName, priority, toolName);

      // Update inventory store (for backward compatibility)
      toggleTrackedItem(toolId, doctorName);

      // Update local state
      updateTrackedTools();
      updateTrackingStats();
    },
    [
      currentUser,
      getCurrentDoctorName,
      toggleTrackedItem,
      updateTrackedTools,
      updateTrackingStats,
    ]
  );

  // Untrack a tool
  const untrackTool = useCallback(
    (toolId: string) => {
      // Provide fallback for development/testing when no user is available
      const doctorName = currentUser ? getCurrentDoctorName() : 'Test Doctor';

      // Remove from tracked tools service
      trackedToolsService.untrackTool(toolId, doctorName);

      // Update inventory store (for backward compatibility)
      toggleTrackedItem(toolId, doctorName);

      // Update local state
      updateTrackedTools();
      updateTrackingStats();
    },
    [
      currentUser,
      getCurrentDoctorName,
      toggleTrackedItem,
      updateTrackedTools,
      updateTrackingStats,
    ]
  );

  // Acknowledge a notification
  const acknowledgeNotification = useCallback(
    (notificationId: string) => {
      trackedToolsService.acknowledgeNotification(notificationId);
      updateNotifications();
      updateTrackingStats();
    },
    [updateNotifications, updateTrackingStats]
  );

  // Clear expired notifications
  const clearExpiredNotifications = useCallback(() => {
    trackedToolsService.clearExpiredNotifications();
    updateNotifications();
    updateTrackingStats();
  }, [updateNotifications, updateTrackingStats]);

  // Get priority queue for a tool
  const getPriorityQueue = useCallback(
    (toolId: string): TrackedToolPriority[] => {
      return trackedToolsService.getPriorityQueue(toolId);
    },
    []
  );

  // Check if a tool is tracked
  const isToolTracked = useCallback((toolId: string): boolean => {
    return trackedToolsService.isToolTracked(toolId);
  }, []);

  // Get all trackers for a tool
  const getToolTrackers = useCallback(
    (toolId: string): TrackedToolPriority[] => {
      return trackedToolsService.getToolTrackers(toolId);
    },
    []
  );

  // Subscribe to status changes
  const subscribeToStatusChanges = useCallback(
    (
      callback: (toolId: string, oldStatus: string, newStatus: string) => void
    ) => {
      return trackedToolsService.subscribeToStatusChanges(callback);
    },
    []
  );

  // Monitor tool status changes
  useEffect(() => {
    const unsubscribe = trackedToolsService.subscribeToStatusChanges(
      (toolId, oldStatus, newStatus) => {
        // Check if tool became available and remove from tracking
        if (newStatus === 'available' || newStatus === 'complete') {
          const doctorName = getCurrentDoctorName();
          const trackers = trackedToolsService.getToolTrackers(toolId);
          const currentUserTracker = trackers.find(
            (t) => t.doctorName === doctorName
          );

          if (currentUserTracker) {
            // Remove from tracking since tool is now available
            untrackTool(toolId);
          }
        }

        // Update notifications when status changes
        updateNotifications();
        updateTrackingStats();
      }
    );

    return unsubscribe;
  }, [
    updateNotifications,
    updateTrackingStats,
    getCurrentDoctorName,
    untrackTool,
  ]);

  // Monitor sterilization store for tool status changes
  useEffect(() => {
    const checkToolStatusChanges = () => {
      availableTools.forEach((tool) => {
        const currentStatus = tool.currentPhase || tool.status || '';

        // Check if this tool is tracked and status changed
        if (trackedToolsService.isToolTracked(tool.id)) {
          // For now, we'll use a simple approach - in a real app, you'd store previous status
          // This is a simplified version that monitors current status
          trackedToolsService.monitorToolStatusChange(
            tool.id,
            '',
            currentStatus
          );
        }
      });
    };

    // Check status changes periodically
    const interval = setInterval(checkToolStatusChanges, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [availableTools]);

  // Update notification tool names when available tools change
  useEffect(() => {
    const updateNotificationToolNames = () => {
      const doctorName = getCurrentDoctorName();
      const pendingNotifications =
        trackedToolsService.getPendingNotifications(doctorName);

      pendingNotifications.forEach((notification) => {
        const tool = availableTools.find((t) => t.id === notification.toolId);
        if (tool && notification.toolName !== tool.name) {
          // Update the notification with the correct tool name
          notification.toolName = tool.name;
          notification.message = `Your tracked tool "${tool.name}" is now available! You have first priority to claim it.`;
        }
      });
    };

    updateNotificationToolNames();
  }, [availableTools, getCurrentDoctorName]);

  // Error handling for missing store data - moved after all hooks
  if (!trackedItems || !trackingData || !availableTools) {
    console.warn('useTrackedTools: Missing required store data');
    return {
      trackedTools,
      pendingNotifications,
      allNotifications,
      trackingStats,
      trackTool,
      untrackTool,
      acknowledgeNotification,
      clearExpiredNotifications,
      getPriorityQueue,
      isToolTracked,
      getToolTrackers,
      subscribeToStatusChanges,
    };
  }

  return {
    trackedTools,
    pendingNotifications,
    allNotifications,
    trackingStats,
    trackTool,
    untrackTool,
    acknowledgeNotification,
    clearExpiredNotifications,
    getPriorityQueue,
    isToolTracked,
    getToolTrackers,
    subscribeToStatusChanges,
  };
};
