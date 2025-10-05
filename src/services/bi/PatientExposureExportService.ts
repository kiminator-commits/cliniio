export async function exportExposureReport(
  exposures: Record<string, unknown>[],
  facilityName: string
) {
  if (!Array.isArray(exposures) || exposures.length === 0) {
    console.warn('No exposures available to export.');
    return;
  }

  try {
    // Step 1 — Build CSV content
    const headers = Object.keys(exposures[0]);
    const csvRows = [
      headers.join(','),
      ...exposures.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
      ),
    ];
    const csvContent = csvRows.join('\n');

    // Step 2 — Create downloadable blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `${facilityName}_exposure_report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    // Step 3 — Trigger browser download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (process.env.NODE_ENV === 'development') {
      console.debug(`📄 Exposure report exported: ${filename}`);
    }
  } catch (err: unknown) {
    console.error(
      'exportExposureReport failed:',
      err instanceof Error ? err.message : String(err)
    );
  }
}
