import { supabase } from '@/lib/supabaseClient';

/**
 * Submit login form with Supabase authentication
 * Handles user login using email and password
 */
export async function submitLoginForm(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    console.info(`✅ Login successful for ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    return { success: false, error: error.message };
  }
}
