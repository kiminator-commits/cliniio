import { supabase } from '@/lib/supabaseClient';

export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    console.info('✅ Google OAuth initiated successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Google OAuth failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function signInWithMicrosoft(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    console.info('✅ Microsoft OAuth initiated successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Microsoft OAuth failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function signInWithLinkedIn(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    console.info('✅ LinkedIn OAuth initiated successfully.');
    return { success: true };
  } catch (error: any) {
    console.error('❌ LinkedIn OAuth failed:', error.message);
    return { success: false, error: error.message };
  }
}
