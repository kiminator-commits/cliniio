export function formatTestTime(rawTime?: string | Date | null): string {
  if (!rawTime) return '—';
  const date = rawTime instanceof Date ? rawTime : new Date(rawTime);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
