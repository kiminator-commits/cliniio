import { supabase } from '@/lib/supabaseClient';

export async function logEnvironmentalAudit({
  facilityId,
  area,
  task,
  userId,
  status,
  notes = null,
  timestamp = new Date().toISOString(),
}: {
  facilityId: string;
  area: string;
  task: string;
  userId: string;
  status: string;
  notes?: string | null;
  timestamp?: string;
}) {
  try {
    const { error } = await supabase.from('environmental_clean_audits').insert([
      {
        facility_id: facilityId,
        area,
        task,
        user_id: userId,
        status,
        notes,
        logged_at: timestamp,
      },
    ]);

    if (error) throw error;

    if (process.env.NODE_ENV === 'development') {
      console.debug(`🧾 Logged environmental audit for ${area} (${task})`);
    }

    return true;
  } catch (err: unknown) {
    console.error(
      'logEnvironmentalAudit failed:',
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
