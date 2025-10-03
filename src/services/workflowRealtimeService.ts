import { isSupabaseConfigured } from '@/lib/supabase';
import { RealtimeManager } from '@/services/_core/realtimeManager';

export class WorkflowRealtimeService {
  private static subscriptions: Map<string, (() => void) | null> = new Map();

  // Subscribe to workflow sessions - COMMENTED OUT: table deleted
  // static subscribeToWorkflowSessions(callback: (event: Record<string, unknown>) => void) {
  //   // Check if Supabase is configured
  //   if (!isSupabaseConfigured()) {
  //     console.warn('⚠️ Supabase not configured, skipping workflow sessions subscription');
  //     return;
  //   }

  //   try {
  //     // Use centralized realtime manager
  //     const unsubscribe = RealtimeManager.subscribe(
  //       'workflow_sessions',
  //       callback as (payload: unknown) => void,
  //       {
  //         event: '*',
  //       }
  //     );

  //     this.subscriptions.set('workflow_sessions', unsubscribe);
  //     return unsubscribe;
  //   } catch (error) {
  //     console.error('❌ Failed to subscribe to workflow sessions:', error);
  //     return null;
  //   }
  // }

  // Subscribe to workflow events - COMMENTED OUT: table deleted
  // static subscribeToWorkflowEvents(callback: (event: Record<string, unknown>) => void) {
  //   // Check if Supabase is configured
  //   if (!isSupabaseConfigured()) {
  //     console.warn('⚠️ Supabase not configured, skipping workflow events subscription');
  //     return;
  //   }

  //   try {
  //     // Use centralized realtime manager
  //     const unsubscribe = RealtimeManager.subscribe(
  //       'workflow_events',
  //       callback as (payload: unknown) => void,
  //       {
  //         event: '*',
  //       }
  //     );

  //     this.subscriptions.set('workflow_events', unsubscribe);
  //     return unsubscribe;
  //   } catch (error) {
  //     console.error('❌ Failed to subscribe to workflow events:', error);
  //     return null;
  //   }
  // }

  // Subscribe to workflow tools
  static subscribeToWorkflowTools(
    callback: (event: Record<string, unknown>) => void
  ) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, skipping workflow tools subscription'
      );
      return;
    }

    try {
      // Use centralized realtime manager
      const unsubscribe = RealtimeManager.subscribe(
        'workflow_tools',
        callback as (payload: unknown) => void,
        {
          event: '*',
        }
      );

      this.subscriptions.set('workflow_tools', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to subscribe to workflow tools:', error);
      return null;
    }
  }

  // Subscribe to all workflow tables
  static subscribeToAllWorkflows(
    callback: (event: Record<string, unknown>) => void
  ) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn(
        '⚠️ Supabase not configured, skipping all workflows subscription'
      );
      return;
    }

    try {
      // Use centralized realtime manager for each table
      const unsubscribes = [
        // RealtimeManager.subscribe('workflow_sessions', callback as (payload: unknown) => void, {
        //   event: '*',
        // }),
        // RealtimeManager.subscribe('workflow_events', callback as (payload: unknown) => void, {
        //   event: '*',
        // }),
        RealtimeManager.subscribe(
          'workflow_tools',
          callback as (payload: unknown) => void,
          {
            event: '*',
          }
        ),
      ];

      this.subscriptions.set('all_workflows', () => {
        unsubscribes.forEach((unsub) => unsub());
      });

      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to all workflows:', error);
      return null;
    }
  }

  // Unsubscribe from specific channel
  static unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription();
      this.subscriptions.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      if (subscription) {
        subscription();
      }
    });
    this.subscriptions.clear();
  }
}
