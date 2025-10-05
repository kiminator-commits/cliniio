import { supabase } from "@/lib/supabaseClient";

type EventSeverity = "info" | "warning" | "error" | "critical";
type EventType =
  | "auth.session_invalid"
  | "auth.logout"
  | "security.protected_route_blocked"
  | "security.bi_init_failed"
  | "security.tenant_mismatch"
  | "bi.incident_created"
  | "bi.incident_resolved"
  | "workflow.scan_processed"
  | "report.export_started"
  | "report.export_failed"
  | "app.error";

async function getContext() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return {
      userId: user?.id ?? null,
      facilityId: (user?.user_metadata as Record<string, unknown>)?.facility_id ?? null,
      authError: error?.message ?? null,
    };
  } catch {
    return { userId: null, facilityId: null, authError: "context_fetch_failed" };
  }
}

async function insertEvent(
  type: EventType,
  severity: EventSeverity,
  message: string,
  context?: Record<string, unknown>
) {
  try {
    const base = await getContext();
    const payload = {
      type,
      severity,
      message,
      user_id: base.userId,
      facility_id: base.facilityId,
      context: context ?? null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("app_events").insert([payload]);

    // If the table doesn't exist yet, fail silently in prod, log in dev.
    if (error) {
      if (import.meta.env.DEV) {
        console.warn("🟡 observabilityService: insert failed (likely missing table)", error.message);
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.warn("🟡 observabilityService: unexpected error", err instanceof Error ? err.message : String(err));
    }
    return { success: false, error: String(err) };
  }
}

export const observabilityService = {
  async logSecurityEvent(type: Extract<EventType, `security.${string}`>, message: string, ctx?: Record<string, unknown>) {
    return insertEvent(type, "warning", message, ctx);
  },

  async logCritical(message: string, ctx?: Record<string, unknown>) {
    return insertEvent("app.error", "critical", message, ctx);
  },

  async logError(message: string, ctx?: Record<string, unknown>) {
    return insertEvent("app.error", "error", message, ctx);
  },

  async logInfo(type: Exclude<EventType, `security.${string}` | "app.error">, message: string, ctx?: Record<string, unknown>) {
    return insertEvent(type, "info", message, ctx);
  },
};

// Usage (later, not in this prompt):
// await observabilityService.logSecurityEvent("security.protected_route_blocked", "Blocked unauthenticated access", { path });
// await observabilityService.logCritical("Unhandled exception in BI dashboard", { stack });
// await observabilityService.logInfo("workflow.scan_processed", "Processed code ST-12345", { phase: "Bath1" });
