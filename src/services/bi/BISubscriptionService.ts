import { isSupabaseConfigured } from '../../lib/supabase';
import { RealtimeManager } from '../_core/realtimeManager';

/**
 * BI Subscription Service
 * Handles all real-time subscription operations for BI workflow
 */

export class BISubscriptionService {
  /**
   * Subscribe to BI test result changes
   */
  static subscribeToBITestChanges(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => void
  ) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping BI test subscription');
      return;
    }

    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe(
        'bi_test_results',
        callback as (payload: unknown) => void,
        {
          event: '*',
        }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to BI test changes:', error);
      return null;
    }
  }

  /**
   * Subscribe to sterilization cycle changes
   */
  static subscribeToCycleChanges(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      new?: Record<string, unknown>;
      old?: Record<string, unknown>;
    }) => void
  ) {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping cycle subscription');
      return;
    }

    try {
      // Use centralized realtime manager
      return RealtimeManager.subscribe(
        'sterilization_cycles',
        callback as (payload: unknown) => void,
        { event: '*' }
      );
    } catch (error) {
      console.error('❌ Failed to subscribe to cycle changes:', error);
      return null;
    }
  }
}
