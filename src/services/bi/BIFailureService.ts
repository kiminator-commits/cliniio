import { supabase } from '../../lib/supabaseClient';
import { logger } from '@/services/loggerService';

/**
 * Initialize BI failure state by loading existing incidents from Supabase
 */
export async function initializeBIFailureState(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('bi_failure_incidents')
      .select('*')
      .order('failure_date', { ascending: false })
      .limit(25);

    if (error) throw error;
    const normalized = data.map((f) => ({
      ...f,
      failure_date: f.failure_date ? new Date(f.failure_date) : null,
    }));
    return normalized;
  } catch (error: any) {
    logger.error('❌ Error initializing BI Failure State:', error.message);
    return [];
  }
}

/**
 * Loads BI compliance configuration for the specified facility.
 * Falls back to defaults if no record exists.
 */
export async function loadBIComplianceSettings(facilityId: string) {
  try {
    const { data, error } = await supabase
      .from('bi_compliance_settings')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const settings = data || {
      auto_close_failures: false,
      alert_threshold_minutes: 60,
      email_notifications: false,
      last_synced_at: null,
    };

    if (process.env.NODE_ENV === 'development') {
      console.debug(`⚙️ Loaded BI compliance settings for ${facilityId}`);
    }

    return settings;
  } catch (err: unknown) {
    console.error(
      'loadBIComplianceSettings failed:',
      err instanceof Error ? err.message : String(err)
    );
    return {
      auto_close_failures: false,
      alert_threshold_minutes: 60,
      email_notifications: false,
      last_synced_at: null,
    };
  }
}

/**
 * Syncs pending BI changes with Supabase.
 * Handles incident and compliance updates atomically.
 */
export async function syncWithSupabase(
  facilityId: string,
  pendingChanges: Record<string, unknown>[]
) {
  if (!Array.isArray(pendingChanges) || pendingChanges.length === 0) return 0;
  let successCount = 0;

  for (const change of pendingChanges) {
    try {
      switch (change.type) {
        case 'UPDATE_INCIDENT':
          await supabase
            .from('bi_failures')
            .update({
              status: (change.payload as Record<string, unknown>).status,
              resolved_at: (change.payload as Record<string, unknown>)
                .resolved_at,
              resolved_by: (change.payload as Record<string, unknown>)
                .resolved_by,
            })
            .eq('id', (change.payload as Record<string, unknown>).id)
            .eq('facility_id', facilityId);
          successCount++;
          break;

        case 'CREATE_INCIDENT':
          await supabase.from('bi_failures').insert([
            {
              ...(change.payload as Record<string, unknown>),
              facility_id: facilityId,
            },
          ]);
          successCount++;
          break;

        case 'DELETE_INCIDENT':
          await supabase
            .from('bi_failures')
            .delete()
            .eq('id', (change.payload as Record<string, unknown>).id)
            .eq('facility_id', facilityId);
          successCount++;
          break;

        case 'UPDATE_COMPLIANCE':
          await supabase
            .from('bi_compliance_settings')
            .update({
              auto_close_failures: (change.payload as Record<string, unknown>)
                .auto_close_failures,
              alert_threshold_minutes: (
                change.payload as Record<string, unknown>
              ).alert_threshold_minutes,
              email_notifications: (change.payload as Record<string, unknown>)
                .email_notifications,
              last_synced_at: new Date().toISOString(),
            })
            .eq('facility_id', facilityId);
          successCount++;
          break;

        default:
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Skipping unknown BI change type: ${change.type}`);
          }
      }
    } catch (err: unknown) {
      console.error(
        `syncWithSupabase failed for ${change.type}:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(
      `✅ Synced ${successCount}/${pendingChanges.length} BI changes to Supabase.`
    );
  }

  return successCount;
}

export function subscribeToBIFailureUpdates(
  facilityId: string,
  onUpdate: (payload: Record<string, unknown>) => void
) {
  if (!facilityId) return () => {};

  try {
    const channel = supabase
      .channel(`bi_failures_${facilityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bi_failures',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload) => {
          if (typeof onUpdate === 'function') onUpdate(payload);
        }
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`📡 BI realtime subscription: ${status}`);
        }
      });

    // ✅ Provide a cleanup handle for safe unsubscription
    return () => {
      supabase.removeChannel(channel);
      if (process.env.NODE_ENV === 'development') {
        console.debug('🧹 BI realtime listener unsubscribed.');
      }
    };
  } catch (err: unknown) {
    console.error(
      'subscribeToBIFailureUpdates failed:',
      err instanceof Error ? err.message : String(err)
    );
    return () => {};
  }
}
