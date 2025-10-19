import { supabase } from '@/lib/supabaseClient';

/**
 * Refresh user session with Supabase authentication
 * Retrieves current session and expiration information
 */
export async function refreshSession(): Promise<{ success: boolean; expires_at?: string; error?: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const expires_at = data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : undefined;
    console.info('✅ Session refreshed successfully:', expires_at);
    return { success: true, expires_at };
  } catch (error: any) {
    console.error('❌ Session refresh failed:', error.message);
    return { success: false, error: error.message };
  }
}
