// Utility functions for sterilization

export function generateBatchID(): string {
  // Logic will be added later to generate proper batch ID
  return '';
}

export function generateAuditSignature(event: Record<string, unknown>): string {
  const base = JSON.stringify(event);
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return `SIG-${Math.abs(hash)}`;
}

export async function backupSterilizationRecords(records: Record<string, unknown>[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sterilization-backup-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
