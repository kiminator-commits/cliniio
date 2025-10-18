"use client";
import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsTestHarness() {
  // Replace with a valid facility_id for testing
  const facilityId = "00000000-0000-0000-0000-000000000000";
  const { get, set, loadAll, settings, loading, error } = useSettings(facilityId);

  useEffect(() => {
    const run = async () => {
      try {
        console.log("🔄 Loading all settings...");
        await loadAll();
        console.log("✅ Settings loaded:", settings);

        // Example: read a typed setting from Sterilization module
        const autoAdvance = await get("sterilization", "autoAdvancePhases");
        console.log("Sterilization > autoAdvancePhases:", autoAdvance);

        // Example: update a typed setting safely
        await set("sterilization", "autoAdvancePhases", !autoAdvance);
        console.log("🔁 Setting toggled successfully.");
      } catch (e: unknown) {
        console.error("⚠️ Settings harness error:", e instanceof Error ? e.message : String(e));
      }
    };
    run();
  }, [loadAll, get, set, settings]);

  if (loading) return null;
  if (error) {
    console.error("Settings error:", error);
    return null;
  }

  return null; // purely functional harness
}
