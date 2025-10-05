import { supabase } from "@/lib/supabaseClient";
import { facilityCacheService } from "@/services/cache/facilityCacheService";

export const statsService = {
  async fetchDashboardStats() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized user");

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) throw new Error("Missing facility context");

      const cacheKey = `bi_stats:${facilityId}`;
      const cached = facilityCacheService.get<Record<string, unknown>>(cacheKey);
      if (cached) {
        console.info("🧠 Loaded BI stats from cache");
        return cached;
      }

      // Combined query: incidents, resolved counts, and open failures
      const { data, error } = await supabase.rpc("get_bi_dashboard_stats", {
        input_facility_id: facilityId,
      });

      // Fallback if RPC not yet deployed
      if (error || !data) {
        console.warn("⚠️ RPC not found or failed — falling back to manual join.");

        const { data: incidents, error: incidentError } = await supabase
          .from("bi_incidents")
          .select("id, status, severity, created_at, resolved_at")
          .eq("facility_id", facilityId);

        if (incidentError) throw new Error(incidentError.message);

        const open = incidents.filter((i) => i.status !== "resolved").length;
        const resolved = incidents.filter((i) => i.status === "resolved").length;

        const stats = {
          totalIncidents: incidents.length,
          openIncidents: open,
          resolvedIncidents: resolved,
          resolutionRate: incidents.length
            ? Math.round((resolved / incidents.length) * 100)
            : 0,
        };

        facilityCacheService.set(cacheKey, stats);
        return stats;
      }

      // RPC returned successful data
      facilityCacheService.set(cacheKey, data);
      console.info("✅ Cached BI stats successfully");
      return data;
    } catch (err: unknown) {
      console.error("❌ Failed to fetch BI stats:", err instanceof Error ? err.message : String(err));
      return {
        totalIncidents: 0,
        openIncidents: 0,
        resolvedIncidents: 0,
        resolutionRate: 0,
      };
    }
  },
};
