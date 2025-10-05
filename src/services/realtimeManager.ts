import { supabase } from '@/lib/supabaseClient';
// RealtimeSubscription is not exported from @supabase/supabase-js in current version

class RealtimeManager {
  private static subscriptions: unknown[] = [];

  static subscribe(
    channel: string,
    callback: (payload: unknown) => void
  ): () => void {
    const subscription = supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public' }, callback)
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
      supabase.removeChannel(subscription as { unsubscribe: () => void });
    }
    this.subscriptions = this.subscriptions.filter((s) => s !== subscription);
  }

  static forceCleanup() {
    this.subscriptions.forEach((sub) => {
      if (sub && typeof sub === 'object' && 'unsubscribe' in sub) {
        supabase.removeChannel(sub as { unsubscribe: () => void });
      }
    });
    this.subscriptions = [];
  }
}

export { RealtimeManager };
