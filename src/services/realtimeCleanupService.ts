import { supabase } from '@/lib/supabaseClient';

export async function runRealtimeCleanup(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('realtime_subscriptions')
      .delete()
      .lt('last_seen_at', new Date(Date.now() - 1000 * 60 * 60).toISOString());

    if (error) {
      console.error('Realtime cleanup RPC failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('Realtime cleanup RPC executed successfully');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error calling cleanup RPC:', err);
    return {
      success: false,
      error: (err as Error)?.message || 'Unknown error',
    };
  }
}
