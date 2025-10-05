import { supabase } from "@/lib/supabaseClient";
import { facilityCacheService } from "@/services/cache/facilityCacheService";

export const challengeService = {
  async createChallenge(payload: {
    title: string;
    description?: string;
    points?: number;
  }) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized: no authenticated user.");

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) throw new Error("Missing facility context.");

      const userRole = user.user_metadata?.role || "staff";
      const allowedRoles = ["admin", "manager"];

      if (!allowedRoles.includes(userRole)) {
        throw new Error("Forbidden: insufficient permissions to create challenges.");
      }

      const challengeData = {
        title: payload.title,
        description: payload.description || "",
        points: payload.points || 0,
        facility_id: facilityId,
        created_by: user.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("home_challenges")
        .insert([challengeData])
        .select()
        .single();

      if (error) throw new Error(error.message);

      console.info(`✅ Challenge created by ${userRole}:`, data.title);
      return { success: true, data };
    } catch (err: unknown) {
      console.error("❌ Challenge creation failed:", err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  async fetchUserChallenges() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized user");

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) throw new Error("Missing facility context");

      const cacheKey = `challenges_and_completions:${facilityId}`;
      const cached = facilityCacheService.get<Record<string, unknown>[]>(cacheKey);
      if (cached) {
        console.info("🧠 Loaded challenges from cache:", cached.length);
        return cached;
      }

      // Run challenge + completion queries in parallel
      const [challengesRes, completionsRes] = await Promise.all([
        supabase
          .from("home_challenges")
          .select("*")
          .eq("facility_id", facilityId)
          .order("created_at", { ascending: false }),

        supabase
          .from("challenge_completions")
          .select("challenge_id, user_id, completed_at")
          .eq("facility_id", facilityId)
          .eq("user_id", user.id),
      ]);

      if (challengesRes.error) throw new Error(challengesRes.error.message);
      if (completionsRes.error) throw new Error(completionsRes.error.message);

      const challenges = challengesRes.data || [];
      const completions = completionsRes.data || [];

      // Merge completion state into challenges
      const merged = challenges.map((ch) => ({
        ...ch,
        isCompleted: completions.some((c) => c.challenge_id === ch.id),
        completedAt:
          completions.find((c) => c.challenge_id === ch.id)?.completed_at || null,
      }));

      facilityCacheService.set(cacheKey, merged);
      console.info(`✅ Cached ${merged.length} merged challenges for ${facilityId}`);
      return merged;
    } catch (err: unknown) {
      console.error("❌ Failed to fetch challenges:", err instanceof Error ? err.message : String(err));
      return [];
    }
  },

  async completeChallenge(payload: {
    challenge_id: string;
    points_earned: number;
  }) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized: no authenticated user.");

      // Try multiple approaches to get facility_id
      let facilityId = user.user_metadata?.facility_id || user.app_metadata?.facility_id;
      
      // If not found in metadata, query the users table
      if (!facilityId) {
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("facility_id")
          .eq("id", user.id)
          .single();
        
        if (profileError || !userData?.facility_id) {
          throw new Error("Missing facility context.");
        }
        facilityId = userData.facility_id;
      }

      // Check if challenge already completed
      const { data: existingCompletion, error: checkError } = await supabase
        .from("challenge_completions")
        .select("id")
        .eq("challenge_id", payload.challenge_id)
        .eq("user_id", user.id)
        .eq("facility_id", facilityId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(checkError.message);
      }

      if (existingCompletion) {
        console.warn("Challenge already completed by user");
        return true; // Already completed
      }

      // Record challenge completion
      const { error: insertError } = await supabase
        .from("challenge_completions")
        .insert([
          {
            challenge_id: payload.challenge_id,
            user_id: user.id,
            facility_id: facilityId,
            points_earned: payload.points_earned,
            completed_at: new Date().toISOString(),
          },
        ]);

      if (insertError) throw new Error(insertError.message);

      console.info(`✅ Challenge ${payload.challenge_id} completed by user ${user.id}`);
      return true;
    } catch (err: unknown) {
      console.error("❌ Challenge completion failed:", err instanceof Error ? err.message : String(err));
      return false;
    }
  },
};