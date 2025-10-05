import { supabase } from '@/lib/supabaseClient'

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
      .single()

    if (error && error.code !== 'PGRST116') throw error

    const settings = data || {
      auto_close_failures: false,
      alert_threshold_minutes: 60,
      email_notifications: false,
      last_synced_at: null,
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`⚙️ Loaded BI compliance settings for ${facilityId}`)
    }

    return settings
  } catch (err: any) {
    console.error('loadBIComplianceSettings failed:', err.message)
    return {
      auto_close_failures: false,
      alert_threshold_minutes: 60,
      email_notifications: false,
      last_synced_at: null,
    }
  }
}

/**
 * Syncs pending BI changes with Supabase.
 * Handles incident and compliance updates atomically.
 */
export async function syncWithSupabase(facilityId: string, pendingChanges: any[]) {
  if (!Array.isArray(pendingChanges) || pendingChanges.length === 0) return 0
  let successCount = 0

  for (const change of pendingChanges) {
    try {
      switch (change.type) {
        case 'UPDATE_INCIDENT':
          await supabase
            .from('bi_failures')
            .update({
              status: change.payload.status,
              resolved_at: change.payload.resolved_at,
              resolved_by: change.payload.resolved_by,
            })
            .eq('id', change.payload.id)
            .eq('facility_id', facilityId)
          successCount++
          break

        case 'CREATE_INCIDENT':
          await supabase
            .from('bi_failures')
            .insert([{ ...change.payload, facility_id: facilityId }])
          successCount++
          break

        case 'DELETE_INCIDENT':
          await supabase
            .from('bi_failures')
            .delete()
            .eq('id', change.payload.id)
            .eq('facility_id', facilityId)
          successCount++
          break

        case 'UPDATE_COMPLIANCE':
          await supabase
            .from('bi_compliance_settings')
            .update({
              auto_close_failures: change.payload.auto_close_failures,
              alert_threshold_minutes: change.payload.alert_threshold_minutes,
              email_notifications: change.payload.email_notifications,
              last_synced_at: new Date().toISOString(),
            })
            .eq('facility_id', facilityId)
          successCount++
          break

        default:
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Skipping unknown BI change type: ${change.type}`)
          }
      }
    } catch (err: any) {
      console.error(`syncWithSupabase failed for ${change.type}:`, err.message)
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug(`✅ Synced ${successCount}/${pendingChanges.length} BI changes to Supabase.`)
  }

  return successCount
}
