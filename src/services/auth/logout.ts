import { supabase } from '@/lib/supabaseClient';

/**
 * Logout user with Supabase authentication
 * Handles user sign out and session cleanup
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.info('✅ User logged out successfully');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Logout failed:', error.message);
    return { success: false, error: error.message };
  }
}
