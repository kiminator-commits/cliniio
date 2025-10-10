import { supabase } from '@/lib/supabaseClient';

export const challengeCompletionService = {
  async submitCompletion(challengeId: string, _notes?: string) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('Unauthorized user');

      // Get user's facility_id from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile?.facility_id) {
        throw new Error('Missing facility context');
      }

      const facilityId = userProfile.facility_id;

      // Validate challenge ownership before submission
      const { data: challenge, error: challengeError } = await supabase
        .from('home_challenges')
        .select('id, facility_id, created_by')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw new Error(challengeError.message);
      if (!challenge) throw new Error('Challenge not found');

      if (challenge.facility_id !== facilityId) {
        throw new Error('Forbidden: Challenge belongs to another facility');
      }

      const { error: insertError } = await supabase
        .from('home_challenge_completions')
        .insert([
          {
            challenge_id: challengeId,
            user_id: user.id,
            facility_id: facilityId,
            completed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw new Error(insertError.message);

      console.info(
        `✅ Challenge ${challengeId} completion recorded for ${facilityId}`
      );
      return { success: true };
    } catch (err: unknown) {
      console.error(
        '❌ Challenge submission failed:',
        err instanceof Error ? err.message : String(err)
      );
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
