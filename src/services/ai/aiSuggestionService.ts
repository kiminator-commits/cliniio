import { supabase } from '@/lib/supabaseClient';

export const aiSuggestionService = {
  timers: new Map<string, number>(),

  startTracking(suggestionId: string) {
    this.timers.set(suggestionId, Date.now());
    console.info(`⏱️ Tracking started for AI suggestion ${suggestionId}`);
  },

  async stopTracking(suggestionId: string) {
    const start = this.timers.get(suggestionId);
    if (!start) {
      console.warn(`⚠️ No tracking start found for suggestion ${suggestionId}`);
      return;
    }

    const elapsedMs = Date.now() - start;
    const elapsedMinutes = Math.round(elapsedMs / 60000);
    this.timers.delete(suggestionId);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          'Unauthorized: cannot persist AI suggestion tracking data.'
        );
        return;
      }

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) {
        console.error('Missing facility_id — skipping AI suggestion time log.');
        return;
      }

      const { error } = await supabase.from('ai_suggestion_metrics').insert([
        {
          suggestion_id: suggestionId,
          user_id: user.id,
          facility_id: facilityId,
          time_spent_minutes: elapsedMinutes,
          recorded_at: new Date().toISOString(),
        },
      ]);

      if (error) throw new Error(error.message);

      console.info(
        `✅ Recorded ${elapsedMinutes} min on AI suggestion ${suggestionId}`
      );
    } catch (err: unknown) {
      console.error(
        '❌ Failed to persist AI suggestion time:',
        err instanceof Error ? err.message : String(err)
      );
    }
  },
};
