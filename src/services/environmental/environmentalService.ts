import { supabase } from "@/lib/supabaseClient";

export const environmentalService = {
  async processScan(code: string) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Unauthorized: cannot process environmental scan without a valid session.");
        return { success: false, error: "Unauthorized" };
      }

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) {
        console.error("Missing facility_id — cannot log audit entry.");
        return { success: false, error: "Missing facility_id" };
      }

      // Simulate identifying area or equipment from code (expand later if needed)
      const auditEntry = {
        facility_id: facilityId,
        scanned_code: code,
        user_id: user.id,
        action: "environmental_scan",
        status: "completed",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("environmental_clean_audit_logs").insert([auditEntry]);

      if (error) throw new Error(error.message);

      console.info("✅ Environmental scan audit log persisted:", code);
      return { success: true };
    } catch (err: unknown) {
      console.error("❌ Failed to persist environmental scan audit log:", err instanceof Error ? err.message : String(err));
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};
