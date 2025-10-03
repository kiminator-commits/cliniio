import { supabase } from '@/lib/supabaseClient';

class RealtimeManager {
  private static subscriptions: unknown[] = [];

  static subscribe(
    channel: string,
    callback: (payload: unknown) => void,
    options?: { event?: string }
  ): () => void {
    const event = options?.event || '*';
    const subscription = supabase
      .channel(channel)
      .on(
        'postgres_changes' as const,
        { event, schema: 'public' },
        callback as (payload: unknown) => void
      )
      .subscribe();

    this.subscriptions.push(subscription);

    // Return an unsubscribe function
    return () => {
      this.unsubscribe(subscription);
    };
  }

  static unsubscribe(subscription: unknown) {
    if (
      subscription &&
      typeof subscription === 'object' &&
      'unsubscribe' in subscription
    ) {
      (subscription as { unsubscribe: () => void }).unsubscribe();
    }
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
  }

  static forceCleanup() {
    this.subscriptions.forEach((sub) => {
      if (sub && typeof sub === 'object' && 'unsubscribe' in sub) {
        (sub as { unsubscribe: () => void }).unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  static getStats() {
    return {
      activeChannels: this.subscriptions.length,
      totalChannels: this.subscriptions.length,
      totalSubscribers: this.subscriptions.length,
      tableSubscribers: {} as Record<string, number>,
      subscriptions: this.subscriptions,
      performance: {
        isHealthy: this.subscriptions.length < 50,
        warnings:
          this.subscriptions.length > 30 ? ['High subscription count'] : [],
        recommendations:
          this.subscriptions.length > 20 ? ['Consider cleanup'] : [],
      },
    };
  }

  static cleanup() {
    this.forceCleanup();
  }

  static globalCleanup() {
    this.forceCleanup();
  }

  static nuclearCleanup() {
    console.warn(
      '☢️ NUCLEAR CLEANUP: Force-disconnecting all realtime connections'
    );
    this.forceCleanup();
  }
}

export { RealtimeManager };
