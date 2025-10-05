import { supabase } from "@/lib/supabaseClient";

export const authService = {
  // Existing methods (login, signup, etc.) remain unchanged

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
        return { success: false, error: error.message };
      }
      console.info("✅ User logged out successfully");
      return { success: true };
    } catch (err) {
      console.error("Unexpected logout error:", err);
      return { success: false, error: String(err) };
    }
  },

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh failed:", error.message);
        return { success: false, error: error.message };
      }

      if (data?.session) {
        console.info("✅ Session refreshed successfully");
        return { success: true, session: data.session };
      }

      return { success: false, error: "No active session" };
    } catch (err) {
      console.error("Unexpected refresh error:", err);
      return { success: false, error: String(err) };
    }
  },
};
