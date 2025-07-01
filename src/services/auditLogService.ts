import { supabase } from '@/lib/supabaseClient';
import { SterilizationEvent } from '@/utils/auditLogger';

export const insertSterilizationLog = async (event: SterilizationEvent) => {
  const { error } = await supabase.from('sterilization_logs').insert([event]);
  if (error) console.error('Failed to insert audit log:', error);
};
