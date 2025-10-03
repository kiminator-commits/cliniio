import { supabase } from '@/lib/supabaseClient';
import { isSupabaseConfigured } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSubscription {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: Record<string, unknown>) => void;
}

/**
 * Simplified realtime manager that consolidates subscriptions
 * without the excessive complexity of the previous implementation
 */
export class SimpleRealtimeManager {
  private static subscriptions = new Map<string, RealtimeChannel>();
  private static channelSubscribers = new Map<
    string,
    Set<(payload: Record<string, unknown>) => void>
  >();

  /**
   * Subscribe to table changes with automatic deduplication
   */
  static subscribe(
    table: string,
    callback: (payload: Record<string, unknown>) => void,
    options: { event?: string; filter?: string } = {}
  ): () => void {
    const channelKey = this.getChannelKey(table, options);

    // Only create one subscription per unique channel
    if (!this.subscriptions.has(channelKey)) {
      if (!isSupabaseConfigured()) {
        console.warn(
          '⚠️ Supabase not configured, skipping real-time subscription'
        );
        return () => {};
      }

      try {
        const channel = supabase
          .channel(channelKey)
          .on(
            'postgres_changes' as never,
            {
              event: options.event || '*',
              schema: 'public',
              table,
              ...(options.filter && { filter: options.filter }),
            },
            (payload: Record<string, unknown>) => {
              // Deliver payload to all subscribers
              const subscribers = this.channelSubscribers.get(channelKey);
              if (subscribers) {
                subscribers.forEach((cb) => cb(payload));
              }
            }
          )
          .subscribe();

        this.subscriptions.set(channelKey, channel);
        this.channelSubscribers.set(channelKey, new Set());

        console.log(`✅ Created shared realtime channel: ${channelKey}`);
      } catch (error) {
        console.error(
          `❌ Failed to create realtime channel ${channelKey}:`,
          error
        );
        return () => {};
      }
    }

    // Add callback to channel subscribers
    const subscribers = this.channelSubscribers.get(channelKey)!;
    subscribers.add(callback);

    console.log(
      `📡 Added subscriber to ${channelKey} (total: ${subscribers.size})`
    );

    return () => {
      this.unsubscribe(channelKey, callback);
    };
  }

  /**
   * Unsubscribe a specific callback
   */
  private static unsubscribe(
    channelKey: string,
    callback: (payload: Record<string, unknown>) => void
  ): void {
    const subscribers = this.channelSubscribers.get(channelKey);
    if (subscribers) {
      subscribers.delete(callback);

      // If no more subscribers for this channel, clean it up
      if (subscribers.size === 0) {
        const channel = this.subscriptions.get(channelKey);
        if (channel) {
          supabase.removeChannel(channel);
          this.subscriptions.delete(channelKey);
          this.channelSubscribers.delete(channelKey);
          console.log(`🔕 Cleaned up channel: ${channelKey}`);
        }
      }
    }
  }

  /**
   * Generate unique channel key
   */
  private static getChannelKey(
    table: string,
    options: { event?: string; filter?: string }
  ): string {
    const parts = [table];
    if (options.event && options.event !== '*') parts.push(options.event);
    if (options.filter) parts.push(options.filter);
    return parts.join('_');
  }

  /**
   * Get subscription statistics
   */
  static getStats() {
    return {
      activeChannels: this.subscriptions.size,
      totalSubscribers: Array.from(this.channelSubscribers.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      tableSubscribers: Object.fromEntries(
        Array.from(this.channelSubscribers.entries()).map(([channel, set]) => [
          channel,
          set.size,
        ])
      ),
    };
  }

  /**
   * Clean up all subscriptions (use for testing/debugging)
   */
  static cleanup() {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
    this.channelSubscribers.clear();
    console.log('🧹 Cleaned up all realtime subscriptions');
  }

  /**
   * Force disconnect all connections (maintains interface compatibility)
   */
  static nuclearCleanup() {
    console.log('🧹 Force cleaning up all realtime connections');
    this.cleanup();
  }
}
