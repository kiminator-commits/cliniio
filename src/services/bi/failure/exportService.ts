import { supabase } from "@/lib/supabaseClient";

export const exportService = {
  async exportExposureReport(format: "csv" | "pdf" = "csv") {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Unauthorized: no authenticated user.");

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) throw new Error("Missing facility_id.");

      const { data, error } = await supabase
        .from("patient_exposure_reports")
        .select("*")
        .eq("facility_id", facilityId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error("No exposure data available.");

      if (format === "csv") {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(","),
          ...data.map((row) =>
            headers.map((key) => JSON.stringify((row as Record<string, unknown>)[key] ?? "")).join(",")
          ),
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `exposure_report_${facilityId}.csv`;
        link.click();
        console.info("✅ Exposure report exported to CSV");
      } else if (format === "pdf") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          const tableHtml = `
            <html>
              <head><title>Exposure Report</title></head>
              <body>
                <h2>Patient Exposure Report</h2>
                <table border="1" cellspacing="0" cellpadding="5">
                  <thead><tr>${Object.keys(data[0])
                    .map((k) => `<th>${k}</th>`)
                    .join("")}</tr></thead>
                  <tbody>
                    ${data
                      .map(
                        (r) =>
                          `<tr>${Object.values(r)
                            .map((v) => `<td>${v ?? ""}</td>`)
                            .join("")}</tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
                <script>window.print()</script>
              </body>
            </html>`;
          printWindow.document.write(tableHtml);
          printWindow.document.close();
        }
        console.info("🖨️ Exposure report opened in print view");
      }
    } catch (err: unknown) {
      console.error("❌ Export failed:", err instanceof Error ? err.message : String(err));
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};
