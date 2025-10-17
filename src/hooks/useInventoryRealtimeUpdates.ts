import { useEffect, useRef, useCallback, useState } from 'react';
import { inventoryServiceFacade } from '../services/inventory/InventoryServiceFacade';

/**
 * Hook for real-time inventory updates
 * Automatically subscribes to inventory changes and provides a way to refresh data
 */
export function useInventoryRealtimeUpdates() {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const refreshCallbacksRef = useRef<Set<() => void>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const hasSubscribedRef = useRef(false);

  // Subscribe to real-time updates
  useEffect(() => {
    // Prevent multiple subscriptions
    if (hasSubscribedRef.current) {
      return undefined;
    }

    try {
      console.log(
        '🔔 Setting up real-time inventory subscription via useInventoryRealtimeUpdates'
      );

      const unsubscribe = inventoryServiceFacade.subscribeToChanges(() => {
        // Callback for when changes occur
        console.log('Inventory changes detected');
      });

      unsubscribeRef.current = unsubscribe;
      hasSubscribedRef.current = true;
      
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setIsSubscribed(true);
      }, 0);

      return () => {
        if (
          unsubscribeRef.current &&
          typeof unsubscribeRef.current === 'function'
        ) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        setIsSubscribed(false);
        hasSubscribedRef.current = false;
      };
    } catch (error) {
      console.error(
        '❌ Failed to set up real-time subscription in useInventoryRealtimeUpdates:',
        error
      );
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setIsSubscribed(false);
      }, 0);
      hasSubscribedRef.current = false;
      return undefined;
    }
  }, []); // Empty dependency array to prevent infinite loops

  // Register a refresh callback
  const registerRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbacksRef.current.add(callback);

    // Return unregister function
    return () => {
      refreshCallbacksRef.current.delete(callback);
    };
  }, []);

  // Unregister a refresh callback
  const unregisterRefreshCallback = useCallback((callback: () => void) => {
    refreshCallbacksRef.current.delete(callback);
  }, []);

  // Manual refresh trigger
  const triggerRefresh = useCallback(() => {
    refreshCallbacksRef.current.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in refresh callback:', error);
      }
    });
  }, []);

  return {
    registerRefreshCallback,
    unregisterRefreshCallback,
    triggerRefresh,
    isSubscribed,
  };
}
