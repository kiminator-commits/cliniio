import { useCallback, useEffect, useRef, useState } from 'react';
import { getEnvVar } from '@/lib/getEnv';
import { RoomStatusType } from '../models';
import { RealtimeManager } from '@/services/_core/realtimeManager';

// Define proper error types for real-time functionality
export type RealtimeError = Error | string | null;

interface RealtimeStatus {
  isConnected: boolean;
  isSubscribed: boolean;
  lastUpdate: string | null;
  error: RealtimeError;
  connectionAttempts: number;
}

/**
 * Enhanced real-time functionality for Environmental Clean module
 * Uses Supabase real-time subscriptions for live updates
 */
export function useEnvironmentalCleanRealtime(autoConnect: boolean = false) {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    isSubscribed: false,
    lastUpdate: null,
    error: null,
    connectionAttempts: 0,
  });

  const subscriptionRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 3; // Reduced from 5
  const reconnectDelay = 1000; // Reduced from 2000ms
  const connectionTimeout = 5000; // 5 second connection timeout

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    try {
      return !!(
        getEnvVar('VITE_SUPABASE_URL') && getEnvVar('VITE_SUPABASE_ANON_KEY')
      );
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Subscribe to environmental cleaning changes
  const subscribeToEnvironmentalCleans = useCallback(() => {
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, skipping real-time subscription'
      );
      setStatus((prev) => ({
        ...prev,
        error: 'Supabase not configured',
      }));
      return;
    }

    // Clear any existing connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    try {
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        console.warn('⚠️ Real-time connection timeout after 5 seconds');
        setStatus((prev) => ({
          ...prev,
          error: 'Connection timeout',
          isConnected: false,
          isSubscribed: false,
          connectionAttempts: prev.connectionAttempts + 1,
        }));
      }, connectionTimeout);

      // Use centralized realtime manager
      subscriptionRef.current = RealtimeManager.subscribe(
        'environmental_cleans_enhanced',
        (payload: unknown) => {
          setStatus((prev) => ({
            ...prev,
            lastUpdate: new Date().toISOString(),
            isConnected: true,
            isSubscribed: true,
            error: null,
          }));

          // Emit custom event for components to listen to
          const event = new CustomEvent('environmentalCleanUpdate', {
            detail: {
              type: (payload as { eventType?: string }).eventType || 'update',
              data: (payload as { new?: unknown }).new || payload,
              oldData: (payload as { old?: unknown }).old || null,
              timestamp: new Date().toISOString(),
            },
          });
          window.dispatchEvent(event);
        },
        { event: '*' }
      );
    } catch (error) {
      console.error(
        '❌ Failed to subscribe to environmental cleaning changes:',
        error
      );
      setStatus((prev) => ({
        ...prev,
        error: 'Failed to subscribe',
      }));
    }
  }, [connectionTimeout]);

  // Handle reconnection logic
  const handleReconnection = useCallback(() => {
    if (status.connectionAttempts >= maxReconnectAttempts) {
      console.warn(
        '⚠️ Max reconnection attempts reached for Environmental Clean'
      );
      setStatus((prev) => ({
        ...prev,
        error: 'Max reconnection attempts reached',
      }));
      return;
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      subscribeToEnvironmentalCleans();
    }, reconnectDelay);
  }, [
    status.connectionAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    subscribeToEnvironmentalCleans,
  ]);

  // Initialize real-time connection only if autoConnect is true
  useEffect(() => {
    if (!autoConnect) {
      return undefined;
    }

    // Use setTimeout to avoid calling setState synchronously in effect
    const timeoutId = setTimeout(() => {
      subscribeToEnvironmentalCleans();
    }, 0);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }

      if (subscriptionRef.current) {
        subscriptionRef.current(); // Call the unsubscribe function
        subscriptionRef.current = null;
      }
    };
  }, [
    autoConnect,
    subscribeToEnvironmentalCleans,
  ]);

  // Handle reconnection on status changes
  useEffect(() => {
    if (
      status.error &&
      !status.isConnected &&
      status.connectionAttempts < maxReconnectAttempts
    ) {
      // Use setTimeout to avoid calling setState synchronously in effect
      const timeoutId = setTimeout(() => {
        handleReconnection();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [
    status.error,
    status.isConnected,
    status.connectionAttempts,
    handleReconnection,
  ]);

  // Manual reconnection function
  const reconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    setStatus((prev) => ({
      ...prev,
      connectionAttempts: 0,
      error: null,
    }));

    subscribeToEnvironmentalCleans();
  };

  // Manual disconnect function
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    if (subscriptionRef.current) {
      subscriptionRef.current(); // Call the unsubscribe function
      subscriptionRef.current = null;
    }

    setStatus((prev) => ({
      ...prev,
      isConnected: false,
      isSubscribed: false,
    }));
  };

  // Subscribe to specific room updates
  const subscribeToRoomUpdates = (
    roomId: string,
    callback: (payload: Record<string, unknown>) => void
  ) => {
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, cannot subscribe to room updates'
      );
      return () => {};
    }

    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe(
        'environmental_cleans_enhanced',
        callback as (payload: unknown) => void,
        {
          event: '*',
          // filter: `room_id=eq.${roomId}`,
        }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to room updates:', error);
      return () => {};
    }
  };

  // Subscribe to status changes
  const subscribeToStatusChanges = (
    status: RoomStatusType,
    callback: (payload: Record<string, unknown>) => void
  ) => {
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, cannot subscribe to status changes'
      );
      return () => {};
    }

    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe(
        'environmental_cleans_enhanced',
        callback as (payload: unknown) => void,
        {
          event: '*',
          // filter: `status=eq.${status}`,
        }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to status changes:', error);
      return () => {};
    }
  };

  return {
    ...status,
    reconnect,
    disconnect,
    subscribeToRoomUpdates,
    subscribeToStatusChanges,
  };
}
