export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

export function getPhaseLabel(phase: string): string {
  return phase.replace(/([A-Z])/g, ' $1').trim();
}
