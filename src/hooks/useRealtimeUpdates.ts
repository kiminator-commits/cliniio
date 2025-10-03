import { useCallback, useEffect, useRef } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { RealtimeManager } from '@/services/_core/realtimeManager';

export interface UseRealtimeUpdatesOptions {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  enabled?: boolean;
  onUpdate: (payload: Record<string, unknown>) => void;
}

export interface UseRealtimeUpdatesReturn {
  isSubscribed: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

/**
 * Hook for managing real-time subscriptions with centralized management
 * Prevents duplicate subscriptions to the same table/event combination
 */
export function useRealtimeUpdates({
  table,
  event,
  filter,
  enabled = true,
  onUpdate,
}: UseRealtimeUpdatesOptions): UseRealtimeUpdatesReturn {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const configRef = useRef({ table, event, filter, enabled });
  const onUpdateRef = useRef(onUpdate);

  // Update refs when dependencies change
  configRef.current = { table, event, filter, enabled };
  onUpdateRef.current = onUpdate;

  const subscribe = useCallback(() => {
    if (!enabled || !configRef.current.enabled) {
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, skipping real-time subscription'
      );
      return;
    }

    try {
      // Clean up existing subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Use centralized realtime manager
      unsubscribeRef.current = RealtimeManager.subscribe(
        configRef.current.table,
        (payload: unknown) => {
          console.log(
            `📡 Real-time update for ${configRef.current.table}:`,
            payload
          );
          onUpdateRef.current(payload as Record<string, unknown>);
        },
        {
          event: configRef.current.event,
          filter: configRef.current.filter,
        } as Record<string, unknown>
      );

      console.log(
        `✅ Subscribed to ${configRef.current.table} changes via RealtimeManager`
      );
    } catch (error) {
      console.error(
        `❌ Failed to subscribe to ${configRef.current.table}:`,
        error
      );
    }
  }, [enabled]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      console.log(`🔕 Unsubscribed from ${configRef.current.table} changes`);
    }
  }, []);

  useEffect(() => {
    subscribe();

    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    isSubscribed: !!unsubscribeRef.current,
    subscribe,
    unsubscribe,
  };
}

// Convenience hooks for common tables
export function useInventoryRealtime(
  onUpdate: (payload: Record<string, unknown>) => void,
  enabled = true
) {
  return useRealtimeUpdates({
    table: 'inventory_items',
    enabled,
    onUpdate,
  });
}

export function useSterilizationRealtime(
  onUpdate: (payload: Record<string, unknown>) => void,
  enabled = true
) {
  return useRealtimeUpdates({
    table: 'sterilization_cycles',
    enabled,
    onUpdate,
  });
}

export function useEnvironmentalCleanRealtime(
  onUpdate: (payload: Record<string, unknown>) => void,
  enabled = true
) {
  return useRealtimeUpdates({
    table: 'environmental_cleans_enhanced',
    enabled,
    onUpdate,
  });
}

export function useBIFailureRealtime(
  onUpdate: (payload: Record<string, unknown>) => void,
  enabled = true
) {
  return useRealtimeUpdates({
    table: 'bi_failure_incidents',
    enabled,
    onUpdate,
  });
}
