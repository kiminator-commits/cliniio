import { supabase } from "@/lib/supabaseClient";

export const incidentService = {
  async getLastSuccessfulBIDate(facilityId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("bi_incidents")
        .select("completed_at")
        .eq("facility_id", facilityId)
        .eq("status", "passed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn("No previous successful BI found or query failed:", error.message);
        return null;
      }

      return data?.completed_at || null;
    } catch (err) {
      console.error("Error fetching lastSuccessfulBIDate:", err);
      return null;
    }
  },

  async getToolsInExposureWindow(windowStart?: string, windowEnd?: string) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Unauthorized: cannot fetch exposure tools.");
        return [];
      }

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) {
        console.error("Missing facility_id — cannot scope exposure query.");
        return [];
      }

      // If no explicit windowStart provided, infer it from last successful BI date
      let effectiveStart = windowStart;
      if (!effectiveStart) {
        const lastSuccess = await incidentService.getLastSuccessfulBIDate(facilityId);
        effectiveStart = lastSuccess || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // fallback: 7 days ago
      }

      const effectiveEnd = windowEnd || new Date().toISOString();

      const { data, error } = await supabase
        .from("sterilization_tools")
        .select("id, name, last_used_at, status")
        .eq("facility_id", facilityId)
        .gte("last_used_at", effectiveStart)
        .lte("last_used_at", effectiveEnd);

      if (error) throw new Error(error.message);

      console.info(
        `✅ Exposure window computed: ${effectiveStart} → ${effectiveEnd} (${data?.length || 0} tools)`
      );
      return data || [];
    } catch (err) {
      console.error("Error computing exposure window:", err);
      return [];
    }
  },
};
