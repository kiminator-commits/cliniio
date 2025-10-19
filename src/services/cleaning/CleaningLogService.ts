import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/services/loggerService';

export async function filterCycles(options: {
  facilityId: string;
  status?: string;
  date?: string;
}) {
  try {
    const query = supabase.from('cleaning_cycles').select('*').eq('facility_id', options.facilityId);

    // ✅ 1. Apply status filter if provided
    if (options.status && options.status !== 'all') {
      query.eq('status', options.status);
    }

    // ✅ 3. Guard invalid date comparisons
    if (options.date && !isNaN(Date.parse(options.date))) {
      const dateObj = new Date(options.date);
      query.gte('created_at', dateObj.toISOString().split('T')[0]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // ✅ 2. Calculate true failed-cycle count
    const failedCount = data?.filter((c) => c.status === 'failed').length ?? 0;

    return { data, failedCount };
  } catch (err: any) {
    logger.error('❌ Cleaning cycle filter error', err);
    return { data: [], failedCount: 0 };
  }
}
