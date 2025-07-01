import { useState, useCallback, useEffect, useRef } from 'react';
import { useInventoryData } from './useInventoryData';
import { useAuditLogger } from '../../utils/auditLogger';
import { InventoryItem, InventoryStatus, TrackingEvent } from '../../types/inventory';

interface TrackingState {
  isTracking: boolean;
  trackingError: string | null;
  lastTrackedItem: InventoryItem | null;
  trackingEvents: TrackingEvent[];
}

interface TrackingOperations {
  startTracking: (itemId: string) => void;
  stopTracking: () => void;
  updateStatus: (itemId: string, status: InventoryStatus) => void;
  getTrackingHistory: (itemId: string) => TrackingEvent[];
  clearTrackingHistory: (itemId: string) => void;
  subscribeToStatusChanges: (
    callback: (item: InventoryItem, status: InventoryStatus) => void
  ) => () => void;
}

export const useInventoryTracking = (): TrackingState & TrackingOperations => {
  const { inventoryData, setInventoryData } = useInventoryData();
  const { logAuditEvent } = useAuditLogger();
  const [state, setState] = useState<TrackingState>({
    isTracking: false,
    trackingError: null,
    lastTrackedItem: null,
    trackingEvents: [],
  });
  const statusChangeCallbacks = useRef<((item: InventoryItem, status: InventoryStatus) => void)[]>(
    []
  );

  const updateState = useCallback((updates: Partial<TrackingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startTracking = useCallback(
    (itemId: string) => {
      const item = inventoryData.find(i => i.id === itemId);
      if (!item) {
        updateState({ trackingError: `Item with id ${itemId} not found` });
        return;
      }
      updateState({ isTracking: true, lastTrackedItem: item, trackingError: null });
      logAuditEvent('inventory_tracking', { action: 'start_tracking', itemId });
    },
    [inventoryData, updateState, logAuditEvent]
  );

  const stopTracking = useCallback(() => {
    updateState({ isTracking: false, lastTrackedItem: null });
    logAuditEvent('inventory_tracking', { action: 'stop_tracking' });
  }, [updateState, logAuditEvent]);

  const updateStatus = useCallback(
    (itemId: string, status: InventoryStatus) => {
      setInventoryData(prev =>
        prev.map(item => {
          if (item.id === itemId) {
            const updated = { ...item, status };
            // Log tracking event
            setState(prevState => ({
              ...prevState,
              trackingEvents: [
                ...prevState.trackingEvents,
                {
                  itemId,
                  status,
                  timestamp: new Date().toISOString(),
                },
              ],
            }));
            // Notify subscribers
            statusChangeCallbacks.current.forEach(cb => cb(updated, status));
            // Audit log
            logAuditEvent('inventory_tracking', { action: 'update_status', itemId, status });
            return updated;
          }
          return item;
        })
      );
    },
    [setInventoryData, logAuditEvent]
  );

  const getTrackingHistory = useCallback(
    (itemId: string): TrackingEvent[] => {
      return state.trackingEvents.filter(event => event.itemId === itemId);
    },
    [state.trackingEvents]
  );

  const clearTrackingHistory = useCallback(
    (itemId: string) => {
      setState(prev => ({
        ...prev,
        trackingEvents: prev.trackingEvents.filter(event => event.itemId !== itemId),
      }));
      logAuditEvent('inventory_tracking', { action: 'clear_tracking_history', itemId });
    },
    [logAuditEvent]
  );

  const subscribeToStatusChanges = useCallback(
    (callback: (item: InventoryItem, status: InventoryStatus) => void) => {
      statusChangeCallbacks.current.push(callback);
      return () => {
        statusChangeCallbacks.current = statusChangeCallbacks.current.filter(cb => cb !== callback);
      };
    },
    []
  );

  // Clean up callbacks on unmount
  useEffect(() => {
    return () => {
      statusChangeCallbacks.current = [];
    };
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    updateStatus,
    getTrackingHistory,
    clearTrackingHistory,
    subscribeToStatusChanges,
  };
};
