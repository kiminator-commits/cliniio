import { supabase } from '@/lib/supabaseClient';

/**
 * Inserts standardized activity records into activity_feed for traceability.
 * Call this whenever a location is assigned, changed, or flagged by AI.
 */
export async function logActivity({
  userId,
  facilityId,
  module,
  activityType,
  description,
  metadata,
}: {
  userId: string;
  facilityId: string;
  module: string;
  activityType: string;
  description: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  try {
    await supabase.from('activity_feed').insert([
      {
        user_id: userId,
        facility_id: facilityId,
        module,
        activity_type: activityType,
        activity_description: description,
        metadata: metadata ?? {},
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {
    console.error('Activity log failed:', e);
  }
}
