import { supabase } from "@/lib/supabaseClient";

export const challengeCompletionService = {
  async submitCompletion(challengeId: string, notes?: string) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized user");

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) throw new Error("Missing facility context");

      // Validate challenge ownership before submission
      const { data: challenge, error: challengeError } = await supabase
        .from("home_challenges")
        .select("id, facility_id, created_by")
        .eq("id", challengeId)
        .single();

      if (challengeError) throw new Error(challengeError.message);
      if (!challenge) throw new Error("Challenge not found");

      if (challenge.facility_id !== facilityId) {
        throw new Error("Forbidden: Challenge belongs to another facility");
      }

      const { error: insertError } = await supabase.from("challenge_completions").insert([
        {
          challenge_id: challengeId,
          user_id: user.id,
          facility_id: facilityId,
          notes: notes || null,
          completed_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      console.info(`✅ Challenge ${challengeId} completion recorded for ${facilityId}`);
      return { success: true };
    } catch (err: unknown) {
      console.error("❌ Challenge submission failed:", err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};