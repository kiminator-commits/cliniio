import { supabase } from '@/lib/supabaseClient';

/**
 * Get the current user's facility ID
 */
export async function getCurrentFacilityId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error } = await supabase
    .from('users')
    .select('facility_id')
    .eq('id', user.id)
    .single();

  if (error || !userData) throw new Error('Failed to get user facility');
  return userData.facility_id;
}

/**
 * Safe type conversion utilities to prevent data loss
 */
export const safeDate = (value: unknown): Date | undefined => {
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};
