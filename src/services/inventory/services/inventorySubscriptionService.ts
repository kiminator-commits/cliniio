import { supabase } from '@/lib/supabaseClient';
import { isSupabaseConfigured } from '@/lib/supabase';

import { RealtimeManager } from '@/services/_core/realtimeManager';

export class InventorySubscriptionService {
  private subscription: (() => void) | null = null;

  subscribeToChanges(
    callback: (payload: Record<string, unknown>) => void
  ): () => void {
    if (isSupabaseConfigured()) {
      try {
        // Use centralized realtime manager
        this.subscription = RealtimeManager.subscribe(
          'inventory_items',
          callback as (payload: unknown) => void,
          {
            event: '*',
          }
        );
        return this.subscription;
      } catch (error) {
        console.error('❌ Failed to subscribe to inventory changes:', error);
        return () => {};
      }
    } else {
      // No-op for static data
      return () => {};
    }
  }

  unsubscribe(): void {
    if (this.subscription) {
      // Check if subscription is a channel before trying to remove it
      if (typeof this.subscription === 'function') {
        this.subscription();
      }
      this.subscription = null;
    }
  }

  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  // Additional subscription methods for specific events
  subscribeToInsertions(
    callback: (payload: Record<string, unknown>) => void
  ): () => void {
    if (isSupabaseConfigured()) {
      try {
        // Use centralized realtime manager
        return RealtimeManager.subscribe(
          'inventory_items',
          callback as (payload: unknown) => void,
          { event: 'INSERT' }
        );
      } catch (error) {
        console.error('❌ Failed to subscribe to inventory insertions:', error);
        return () => {};
      }
    } else {
      return () => {};
    }
  }

  subscribeToUpdates(
    callback: (payload: Record<string, unknown>) => void
  ): () => void {
    if (isSupabaseConfigured()) {
      try {
        // Use centralized realtime manager
        return RealtimeManager.subscribe(
          'inventory_items',
          callback as (payload: unknown) => void,
          { event: 'UPDATE' }
        );
      } catch (error) {
        console.error('❌ Failed to subscribe to inventory updates:', error);
        return () => {};
      }
    } else {
      return () => {};
    }
  }

  subscribeToDeletions(
    callback: (payload: Record<string, unknown>) => void
  ): () => void {
    if (isSupabaseConfigured()) {
      if (!supabase || typeof supabase.channel !== 'function') {
        console.warn(
          '⚠️ Supabase client not properly initialized, skipping inventory deletions subscription'
        );
        return () => {};
      }

      const channel = supabase
        .channel('inventory_deletions')
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'inventory_items',
          },
          callback
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      return () => {};
    }
  }
}
